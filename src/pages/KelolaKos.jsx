import React, { useState, useEffect, useRef, useCallback } from 'react';
import LogoKosfinder from '../assets/Logo-Kosfinder.svg';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ── Fix default icon Leaflet ──────────────────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ── Custom marker merah ───────────────────────────────────────────────────────
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

// ── Fix: Leaflet tile layer kadang tidak render sempurna karena Tailwind reset ─
const leafletFixStyle = `
  .leaflet-container { z-index: 0; }
  .leaflet-tile-pane img { max-width: none !important; display: inline !important; }
  .leaflet-tile { width: 256px !important; height: 256px !important; }
`;

// ── Sub-komponen: klik peta untuk pindahkan pin ───────────────────────────────
function MapClickHandler({ onClick }) {
  useMapEvents({ click: (e) => onClick(e.latlng.lat, e.latlng.lng) });
  return null;
}

// ── Sub-komponen: sinkronisasi center peta ────────────────────────────────────
function MapUpdater({ lat, lng }) {
  const map = useMap();
  useEffect(() => { map.setView([lat, lng], map.getZoom()); }, [lat, lng, map]);
  return null;
}

// ── Geocoding via Nominatim (OpenStreetMap, GRATIS, tanpa API key) ────────────
async function searchAddress(query) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=id`;
  const res = await fetch(url, { headers: { 'Accept-Language': 'id', 'User-Agent': 'KosFinder-App' } });
  return res.json();
}

async function reverseGeocode(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
  const res = await fetch(url, { headers: { 'Accept-Language': 'id', 'User-Agent': 'KosFinder-App' } });
  return res.json();
}

// ── Komponen peta picker lengkap ──────────────────────────────────────────────
function LocationPickerMap({ latitude, longitude, onChange }) {
  const [position, setPosition]         = useState([latitude, longitude]);
  const [searchQuery, setSearchQuery]   = useState('');
  const [suggestions, setSuggestions]   = useState([]);
  const [isSearching, setIsSearching]   = useState(false);
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [gpsError, setGpsError]         = useState('');
  const [detectedAddress, setDetectedAddress] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const markerRef   = useRef(null);
  const searchRef   = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => { setPosition([latitude, longitude]); }, [latitude, longitude]);

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const updatePosition = useCallback(async (lat, lng, fetchAddr = true) => {
    setPosition([lat, lng]);
    onChange?.(lat, lng);
    if (fetchAddr) {
      try {
        const data = await reverseGeocode(lat, lng);
        if (data?.address) {
          const a = data.address;
          setDetectedAddress([a.road, a.suburb, a.city || a.town || a.county].filter(Boolean).join(', ') || data.display_name);
        }
      } catch { setDetectedAddress(''); }
    }
  }, [onChange]);

  const handleSearchInput = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    clearTimeout(debounceRef.current);
    if (val.trim().length < 3) { setSuggestions([]); setShowSuggestions(false); return; }
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try { const r = await searchAddress(val); setSuggestions(r); setShowSuggestions(true); }
      catch { setSuggestions([]); }
      finally { setIsSearching(false); }
    }, 500);
  };

  const handleSelectSuggestion = (item) => {
    updatePosition(parseFloat(item.lat), parseFloat(item.lon), false);
    setDetectedAddress(item.display_name);
    setSearchQuery(item.display_name);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true); setShowSuggestions(false);
    try { const r = await searchAddress(searchQuery); if (r.length > 0) handleSelectSuggestion(r[0]); }
    catch { } finally { setIsSearching(false); }
  };

  const handleGps = () => {
    if (!navigator.geolocation) { setGpsError('Browser tidak mendukung GPS.'); return; }
    setIsGpsLoading(true); setGpsError('');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { updatePosition(coords.latitude, coords.longitude); setIsGpsLoading(false); },
      (err) => {
        setGpsError(err.code === 1 ? 'Izin lokasi ditolak. Aktifkan di pengaturan browser.' : 'Gagal mendapatkan lokasi.');
        setIsGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleMarkerDrag = useCallback(() => {
    const m = markerRef.current;
    if (m) { const { lat, lng } = m.getLatLng(); updatePosition(lat, lng); }
  }, [updatePosition]);

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white">
      {/* Search bar */}
      <div className="p-3 border-b border-gray-100 bg-gray-50">
        <div ref={searchRef} className="relative">
          <div className="flex gap-2" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearchSubmit(e); } }}>
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                {isSearching
                  ? <svg className="w-4 h-4 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                  : <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"/></svg>
                }
              </div>
              <input type="text" value={searchQuery} onChange={handleSearchInput} onFocus={() => suggestions.length > 0 && setShowSuggestions(true)} placeholder="Cari alamat, nama jalan, kampus, landmark..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
              {searchQuery && <button type="button" onClick={() => { setSearchQuery(''); setSuggestions([]); setShowSuggestions(false); }} className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg></button>}
            </div>
            <button type="button" onClick={handleSearchSubmit} disabled={isSearching} className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 flex-shrink-0">Cari</button>
            <button type="button" onClick={handleGps} disabled={isGpsLoading} title="Gunakan lokasi saya" className="px-3 py-2.5 bg-white hover:bg-gray-100 border border-gray-200 text-gray-600 rounded-xl transition-colors disabled:opacity-50 flex-shrink-0 flex items-center gap-1.5">
              {isGpsLoading
                ? <svg className="w-4 h-4 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                : <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg>
              }
              <span className="text-xs font-semibold hidden sm:block">{isGpsLoading ? 'Mencari...' : 'Lokasi Saya'}</span>
            </button>
          </div>
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-[9999] max-h-60 overflow-y-auto">
              {suggestions.map((item, idx) => (
                <button key={idx} type="button" onClick={() => handleSelectSuggestion(item)} className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0 flex items-start gap-3">
                  <svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>
                  <div className="min-w-0"><p className="text-sm font-medium text-gray-800 truncate">{item.display_name}</p></div>
                </button>
              ))}
            </div>
          )}
        </div>
        {gpsError && <div className="mt-2 flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2"><svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>{gpsError}</div>}
      </div>

      {/* Peta */}
      <div style={{ height: '300px' }} className="relative">
        <style>{leafletFixStyle}</style>
        <MapContainer key={`${position[0]}-${position[1]}-picker`} center={position} zoom={15} style={{ width: '100%', height: '100%' }} scrollWheelZoom={true}>
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapUpdater lat={position[0]} lng={position[1]} />
          <MapClickHandler onClick={(lat, lng) => updatePosition(lat, lng)} />
          <Marker position={position} icon={redIcon} draggable={true} ref={markerRef} eventHandlers={{ dragend: handleMarkerDrag }} />
        </MapContainer>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[999] pointer-events-none">
          <div className="bg-black/60 text-white text-[11px] font-medium px-3 py-1.5 rounded-full backdrop-blur-sm whitespace-nowrap">
            Seret pin atau klik peta untuk pindahkan titik
          </div>
        </div>
      </div>

      {/* Info koordinat */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <svg className="w-3.5 h-3.5 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>
          <span className="font-mono font-semibold text-gray-700">{position[0].toFixed(6)}, {position[1].toFixed(6)}</span>
        </div>
        {detectedAddress && <p className="text-xs text-gray-500 truncate max-w-xs">📍 {detectedAddress}</p>}
      </div>
    </div>
  );
}

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// ── Komponen helper: bintang rating (read-only) ─────────────────────────────
function StarRating({ count = 5, max = 5, size = 'sm' }) {
  const cls = size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5';
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(max)].map((_, i) => (
        <svg key={i} className={`${cls} ${i < count ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function KelolaKos({ onNavigateBack }) {
  // State untuk mengontrol tab mana yang sedang aktif
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [formData, setFormData] = useState({
    kos_name: '',
    gender_type: 'Campur',
    city: '',
    address: '',
    price: '',
    total_unit: '',     
    available_unit: '', 
    description: '',
    whatsapp_contact: '',
    latitude: -7.282356,
    longitude: 112.794925,
  });

  
  const [selectedFacilities, setSelectedFacilities] = useState([]);
  const [selectedRules, setSelectedRules] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  // State untuk menyimpan daftar Kos Saya dari database
  const [myKosList, setMyKosList] = useState([]);
  const [isLoadingKos, setIsLoadingKos] = useState(false);

  // Ambil data dari server SETIAP KALI tab berubah ke 'kos-saya'
  useEffect(() => {
    if (activeTab === 'kos-saya') {
      fetchMyKos();
    }
  }, [activeTab]);

  const fetchMyKos = async () => {
    setIsLoadingKos(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/my-kos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setMyKosList(data.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data Kos:", error);
    } finally {
      setIsLoadingKos(false);
    }
  };

  const handleDeleteKos = (kosId) => {
    showConfirm(
      'Apakah Anda yakin ingin menghapus properti ini? Data yang dihapus tidak dapat dikembalikan.',
      async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/kos/${kosId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Properti berhasil dihapus!');
        fetchMyKos(); // Refresh daftar kos
      } else {
        alert(data.message || 'Gagal menghapus properti.');
      }
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan jaringan.');
    }
      }
    );
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const handleEditKos = async (kos) => {
    // 1. Isi form dengan data lama
    setFormData({
      kos_name: kos.kos_name,
      gender_type: kos.gender_type,
      city: kos.city,
      address: kos.address,
      price: kos.price,
      total_unit: kos.total_unit || '',       
      available_unit: kos.available_unit || '',
      description: kos.description,
      whatsapp_contact: kos.whatsapp_contact || '',
      latitude: parseFloat(kos.latitude),
      longitude: parseFloat(kos.longitude),
    });

    // 2. Fetch data lengkap kos (fasilitas, rules, foto)
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/kos/${kos.kos_id}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      const data = await res.json();
      if (data.success && data.data) {
        const full = data.data;
        // Fasilitas: simpan facility_id (integer) sesuai yang dipakai checkbox
        const facs = (full.facilities || []).map(f => f.facility_id ?? f.id).filter(Boolean);
        const rules = (full.rules || []).map(r => r.rule_id ?? r.id).filter(Boolean);
        setSelectedFacilities(facs);
        setSelectedRules(rules);
        // Load foto existing sebagai preview
        const existingPhotos = (full.photos || full.images || []).map((p, idx) => {
          const url = (p.photo_url || p.image_url || p.url || '');
          const fullUrl = url.startsWith('http') ? url : `${import.meta.env.VITE_APP_BASE_URL}${url}`;
          return { id: `existing-${p.photo_id || p.id || idx}`, previewUrl: fullUrl, isExisting: true, photoId: p.photo_id || p.id };
        });
        setPhotos(existingPhotos);
      } else {
        setSelectedFacilities([]);
        setSelectedRules([]);
        setPhotos([]);
      }
    } catch {
      setSelectedFacilities([]);
      setSelectedRules([]);
      setPhotos([]);
    }

    // 3. Set mode edit
    setIsEditing(true);
    setEditingId(kos.kos_id);
    setActiveTab('upload'); // Pindah ke tab upload
    window.scrollTo(0, 0);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      kos_name: '', gender_type: 'Campur', city: '', address: '', price: '', total_unit: '', available_unit: '', description: '',
      whatsapp_contact: '',
      latitude: -7.282356, longitude: 112.794925,
    });
    setSelectedFacilities([]);
    setSelectedRules([]);
    // Revoke object URLs untuk foto baru agar tidak memory leak
    setPhotos(prev => { prev.filter(p => !p.isExisting).forEach(p => URL.revokeObjectURL(p.previewUrl)); return []; });
    setActiveTab('kos-saya');
  };


  // Daftar fasilitas & rules dari backend
  const [listFasilitas, setListFasilitas] = useState([]);
  const [listRules, setListRules] = useState([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [facRes, ruleRes] = await Promise.all([
          fetch(`${API_BASE}/facilities`, { headers: { 'Accept': 'application/json' } }),
          fetch(`${API_BASE}/rules`,      { headers: { 'Accept': 'application/json' } }),
        ]);
        const facData  = await facRes.json();
        const ruleData = await ruleRes.json();

        if (facData.success)  setListFasilitas(facData.data);
        if (ruleData.success) setListRules(ruleData.data);
      } catch (err) {
        console.error('Gagal memuat fasilitas/rules:', err);
      }
    };
    fetchOptions();
  }, []);

  // Fungsi untuk menangani input teks
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Fungsi untuk menangani checkbox fasilitas
  const handleFacilityToggle = (fasilitas) => {
    setSelectedFacilities(prev => 
      prev.includes(fasilitas) 
        ? prev.filter(f => f !== fasilitas) 
        : [...prev, fasilitas]
    );
  };

  // Fungsi untuk menangani checkbox peraturan
  const handleRuleToggle = (rule) => {
    setSelectedRules(prev => 
      prev.includes(rule) 
        ? prev.filter(r => r !== rule) 
        : [...prev, rule]
    );
  };

  // Fungsi untuk menangani upload foto (additive — tidak menimpa foto lama)
  const handlePhotoChange = (e) => {
    const newFiles = Array.from(e.target.files);
    const newEntries = newFiles.map((file) => ({
      id: `new-${Date.now()}-${Math.random()}`,
      previewUrl: URL.createObjectURL(file),
      isExisting: false,
      file,
    }));
    setPhotos(prev => [...prev, ...newEntries]);
    // Reset input value agar file yang sama bisa dipilih lagi
    e.target.value = '';
  };

  // Fungsi untuk drop foto (additive)
  const handlePhotoDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    const newEntries = droppedFiles.map((file) => ({
      id: `new-${Date.now()}-${Math.random()}`,
      previewUrl: URL.createObjectURL(file),
      isExisting: false,
      file,
    }));
    setPhotos(prev => [...prev, ...newEntries]);
  };

  // Fungsi untuk hapus foto satu per satu
  const handleRemovePhoto = (id) => {
    setPhotos(prev => {
      const toRemove = prev.find(p => p.id === id);
      if (toRemove && !toRemove.isExisting) URL.revokeObjectURL(toRemove.previewUrl);
      return prev.filter(p => p.id !== id);
    });
  };

  // Fungsi saat tombol submit ditekan
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    
    // Validasi: Wajib ada foto JIKA sedang buat kos baru (Upload Baru).
    const newPhotos = photos.filter(p => !p.isExisting && p.file);
    if (!isEditing && newPhotos.length === 0) {
      alert('Harap unggah setidaknya 1 foto properti Anda.');
      return;
    }

    // Validasi harga tidak boleh 0 atau kosong
    const priceVal = Number(formData.price);
    if (!formData.price || priceVal < 50000) {
      alert('Harga sewa tidak valid. Harga minimum adalah Rp 50.000.');
      return;
    }

    const confirmMessage = isEditing
      ? 'Apakah Anda yakin ingin mengubah data kos ini?'
      : 'Apakah Anda yakin ingin mempublikasikan kos ini?';

    showConfirm(confirmMessage, () => doUploadSubmit());
  };

  const doUploadSubmit = async () => {
    setIsUploading(true);

    const formDataObj = new FormData();
    formDataObj.append('kos_name', formData.kos_name);
    formDataObj.append('gender_type', formData.gender_type);
    formDataObj.append('city', formData.city);
    formDataObj.append('address', formData.address);
    formDataObj.append('price', formData.price);
    formDataObj.append('total_unit', formData.total_unit);         
    formDataObj.append('available_unit', formData.available_unit);
    formDataObj.append('description', formData.description);
    formDataObj.append('latitude', formData.latitude);
    formDataObj.append('longitude', formData.longitude);
    formDataObj.append('whatsapp_contact', formData.whatsapp_contact);

    formDataObj.append('facilities', JSON.stringify(selectedFacilities));
    formDataObj.append('rules', JSON.stringify(selectedRules));

    // Masukkan foto baru saja (bukan foto existing yang sudah ada di server)
    const newPhotos = photos.filter(p => !p.isExisting && p.file);
    if (newPhotos.length > 0) {
      newPhotos.forEach((p) => {
        formDataObj.append('images[]', p.file);
      });
    }

    // 🔥 TRIK LARAVEL: Jika sedang edit, sisipkan _method PUT
    if (isEditing) {
      formDataObj.append('_method', 'PUT');
    }

    const token = localStorage.getItem('token');
    
    // Tentukan URL tujuan: Ke API '/kos' atau '/kos/{id}'
    const apiUrl = isEditing 
      ? `${API_BASE}/kos/${editingId}` 
      : `${API_BASE}/kos`;

    try {
      // Metode Fetch SELALU 'POST' karena kita pakai FormData
      const response = await fetch(apiUrl, {
        method: 'POST', 
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: formDataObj,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal menyimpan data properti.');
      }

      alert(isEditing ? 'Sukses! Properti kos berhasil diperbarui.' : 'Sukses! Properti kos Anda berhasil dipublikasikan.');
      
      // Bersihkan state dan kembali ke mode normal
      handleCancelEdit(); 

    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  // ── State: Review Tab ────────────────────────────────────────────────────
  const [allReviews, setAllReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewFilter, setReviewFilter] = useState('semua');
  const [replyTarget, setReplyTarget] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [replyError, setReplyError] = useState('');
  // ────────────────────────────────────────────────────────────────────────

  const fetchAllReviews = async (kosList) => {
    if (!kosList || kosList.length === 0) { setReviewsLoading(false); return; }
    setReviewsLoading(true);
    const token = localStorage.getItem('token');
    try {
      const results = await Promise.all(
        kosList.map(kos =>
          fetch(`${API_BASE}/kos/${kos.kos_id}/reviews`, {
            headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
          })
            .then(r => r.json())
            .then(data => (data.success ? (data.data || []).map(rv => ({ ...rv, _kos_name: kos.kos_name, _kos_id: kos.kos_id })) : []))
            .catch(() => [])
        )
      );
      const merged = results.flat().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setAllReviews(merged);
    } catch (err) {
      console.error('Gagal memuat review:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'review') {
      if (myKosList.length > 0) {
        fetchAllReviews(myKosList);
      } else {
        const loadThenFetch = async () => {
          setReviewsLoading(true);
          const token = localStorage.getItem('token');
          try {
            const res = await fetch(`${API_BASE}/my-kos`, {
              headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
            });
            const data = await res.json();
            if (data.success && data.data.length > 0) {
              setMyKosList(data.data);
              await fetchAllReviews(data.data);
            } else {
              setReviewsLoading(false);
            }
          } catch (err) {
            console.error(err);
            setReviewsLoading(false);
          }
        };
        loadThenFetch();
      }
    }
  }, [activeTab]);

  const handleSubmitReply = async (reviewid) => {
    if (!replyText.trim()) return;
    setReplySubmitting(true);
    setReplyError('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE}/reviews/${reviewid}/reply`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ owner_reply: replyText }),
      });
      const data = await res.json();
      if (data.success) {
        setReplyTarget(null);
        setReplyText('');
        setAllReviews(prev =>
          prev.map(rv =>
            rv.reviewid === reviewid
              ? { ...rv, owner_reply: data.data.owner_reply, owner_replied_at: data.data.owner_replied_at }
              : rv
          )
        );
      } else {
        setReplyError(data.message || 'Gagal mengirim balasan.');
      }
    } catch {
      setReplyError('Gagal menghubungi server.');
    } finally {
      setReplySubmitting(false);
    }
  };

  // ── State: Confirmation Modal ──────────────────────────────────────────────
  const [confirmModal, setConfirmModal] = useState(null); // { message, onConfirm }
  // ────────────────────────────────────────────────────────────────────────────

  const showConfirm = (message, onConfirm) => {
    setConfirmModal({ message, onConfirm });
  };

  const handleConfirmYes = () => {
    if (confirmModal?.onConfirm) confirmModal.onConfirm();
    setConfirmModal(null);
  };

  const handleConfirmNo = () => {
    setConfirmModal(null);
  };

  // ── State: Dashboard ────────────────────────────────────────────────────
  const [dashboardStats, setDashboardStats] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [recentActivity, setRecentActivity] = useState([]);
  // ────────────────────────────────────────────────────────────────────────

  const fetchDashboard = async () => {
    setDashboardLoading(true);
    const token = localStorage.getItem('token');
    try {
      const [kosRes, leadsRes, viewsRes] = await Promise.all([
        fetch(`${API_BASE}/my-kos`, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        }),
        fetch(`${API_BASE}/dashboard/leads`, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        }),
        fetch(`${API_BASE}/dashboard/views`, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        }),
      ]);

      const [kosData, leadsData, viewsData] = await Promise.all([
        kosRes.json(), leadsRes.json(), viewsRes.json(),
      ]);

      // Ambil semua review dari semua kos untuk hitung rating & total
      let totalReviews = 0;
      let totalRating = 0;
      let activity = [];

      if (kosData.success && kosData.data.length > 0) {
        if (myKosList.length === 0) setMyKosList(kosData.data);

        const reviewResults = await Promise.all(
          kosData.data.map(kos =>
            fetch(`${API_BASE}/kos/${kos.kos_id}/reviews`, {
              headers: { Accept: 'application/json' },
            })
              .then(r => r.json())
              .then(d => (d.success ? (d.data || []).map(rv => ({ ...rv, _kos_name: kos.kos_name, _kos_id: kos.kos_id })) : []))
              .catch(() => [])
          )
        );

        const allRv = reviewResults.flat();
        totalReviews = allRv.length;
        totalRating = allRv.length > 0
          ? allRv.reduce((s, r) => s + parseFloat(r.rating), 0) / allRv.length
          : 0;

        // Susun aktivitas terbaru: review + leads, diurutkan waktu
        const reviewActivity = allRv.map(rv => ({
          type: 'review',
          label: 'Ulasan Baru',
          description: `${rv.user?.user_name || 'Seseorang'} memberikan ulasan bintang ${Math.round(parseFloat(rv.rating))} untuk ${rv._kos_name}`,
          timestamp: new Date(rv.created_at),
          rating: Math.round(parseFloat(rv.rating)),
          reviewid: rv.reviewid,
          kos_id: rv._kos_id,
          hasReply: !!rv.owner_reply,
        }));

        const leadItems = (leadsData.success ? leadsData.data : []).map(lead => ({
          type: 'lead',
          label: 'Leads Baru',
          description: `${lead.user?.user_name || 'Seseorang'} tertarik pada ${lead.kos_name}`,
          timestamp: new Date(lead.created_at),
        }));

        activity = [...reviewActivity, ...leadItems]
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 10);
      }

      setDashboardStats({
        pengunjung: viewsData.success ? viewsData.total : 0,
        leads: (leadsData.success ? leadsData.total : 0) + (viewsData.success ? viewsData.total : 0) + totalReviews,
        rating: totalRating > 0 ? totalRating.toFixed(1) : '—',
        review: totalReviews,
      });
      setRecentActivity(activity);
    } catch (err) {
      console.error('Gagal memuat dashboard:', err);
      setDashboardStats({ pengunjung: 0, leads: 0, rating: '—', review: 0 });
    } finally {
      setDashboardLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboard();
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans antialiased text-gray-800">
      
      {/* ── Confirmation Modal ─────────────────────────────────────────── */}
      {confirmModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-gray-100">
            <div className="flex items-start gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-base mb-1">Konfirmasi</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{confirmModal.message}</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleConfirmNo}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmYes}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition shadow-sm"
              >
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white px-4 pt-3 pb-1 md:px-8 md:py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        
        <div 
          onClick={onNavigateBack} 
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          title="Kembali ke Beranda"
        >
          <img src={LogoKosfinder} alt="Logo" className="h-8 md:h-10 w-auto" />
          <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs font-bold rounded-full">
            Pemilik Kos
          </span>
        </div>

        <button 
          onClick={onNavigateBack}
          className="text-sm font-bold text-gray-500 hover:text-blue-600 transition flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Kembali
        </button>
        
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        
        {/* NAVIGASI TABS */}
        <div className="bg-gray-200/70 p-1.5 rounded-2xl flex items-center mb-8 shadow-sm">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === 'dashboard' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            Dashboard
          </button>
          
          <button 
            onClick={() => setActiveTab('kos-saya')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === 'kos-saya' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            Kos Saya
          </button>
          
          <button 
            onClick={() => setActiveTab('upload')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === 'upload' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            Upload
          </button>
          
          <button 
            onClick={() => setActiveTab('review')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === 'review' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
            Review
          </button>
        </div>

        {/* KONTEN BERDASARKAN TAB AKTIF */}
        <div className="animate-fadeIn">
          
          {/* --- TAB: DASHBOARD --- */}
          {activeTab === 'dashboard' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-extrabold text-gray-900">Dashboard</h1>
                <button
                  onClick={fetchDashboard}
                  disabled={dashboardLoading}
                  className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-600 font-semibold py-2 px-4 rounded-xl text-sm transition disabled:opacity-50"
                >
                  <svg className={`w-4 h-4 ${dashboardLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  Refresh
                </button>
              </div>

              {/* Kartu Statistik */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {/* Pengunjung */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <svg className="w-6 h-6 text-blue-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  {dashboardLoading ? (
                    <div className="h-10 w-16 bg-gray-100 rounded-lg animate-pulse mb-1" />
                  ) : (
                    <h2 className="text-4xl font-bold text-gray-900">{dashboardStats?.pengunjung ?? '—'}</h2>
                  )}
                  <p className="text-sm text-gray-500 mt-1 font-medium">Total Pengunjung</p>
                </div>

                {/* Leads */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <svg className="w-6 h-6 text-green-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  {dashboardLoading ? (
                    <div className="h-10 w-16 bg-gray-100 rounded-lg animate-pulse mb-1" />
                  ) : (
                    <h2 className="text-4xl font-bold text-gray-900">{dashboardStats?.leads ?? '—'}</h2>
                  )}
                  <p className="text-sm text-gray-500 mt-1 font-medium">Total Interaksi</p>
                </div>

                {/* Rating */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <svg className="w-6 h-6 text-amber-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                  {dashboardLoading ? (
                    <div className="h-10 w-16 bg-gray-100 rounded-lg animate-pulse mb-1" />
                  ) : (
                    <div className="flex items-center gap-2">
                      <h2 className="text-4xl font-bold text-gray-900">{dashboardStats?.rating ?? '—'}</h2>
                      {dashboardStats?.rating !== '—' && <span className="text-amber-400 text-2xl">★</span>}
                    </div>
                  )}
                  <p className="text-sm text-gray-500 mt-1 font-medium">Rating Rata-rata</p>
                </div>

                {/* Review */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <svg className="w-6 h-6 text-purple-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  {dashboardLoading ? (
                    <div className="h-10 w-16 bg-gray-100 rounded-lg animate-pulse mb-1" />
                  ) : (
                    <h2 className="text-4xl font-bold text-gray-900">{dashboardStats?.review ?? '—'}</h2>
                  )}
                  <p className="text-sm text-gray-500 mt-1 font-medium">Total Ulasan</p>
                </div>
              </div>

              {/* Aktivitas Terbaru */}
              <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Aktivitas Terbaru</h3>
                  {recentActivity.length > 0 && (
                    <span className="text-xs text-gray-400 font-medium">{recentActivity.length} aktivitas</span>
                  )}
                </div>

                {dashboardLoading ? (
                  <div className="space-y-4">
                    {[1,2,3].map(i => (
                      <div key={i} className="flex gap-4 animate-pulse">
                        <div className="w-10 h-10 bg-gray-100 rounded-full shrink-0" />
                        <div className="flex-1 space-y-2 py-1">
                          <div className="h-3 bg-gray-100 rounded w-1/3" />
                          <div className="h-3 bg-gray-100 rounded w-2/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentActivity.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto w-12 h-12 text-gray-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    <p className="text-gray-400 font-medium text-sm">Belum ada aktivitas terbaru.</p>
                    <p className="text-gray-300 text-xs mt-1">Aktivitas akan muncul saat ada leads atau ulasan masuk.</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {recentActivity.map((item, idx) => {
                      const isToday = item.timestamp.toDateString() === new Date().toDateString();
                      const isYesterday = item.timestamp.toDateString() === new Date(Date.now() - 86400000).toDateString();
                      const showDivider = idx === 0 ||
                        item.timestamp.toDateString() !== recentActivity[idx - 1]?.timestamp.toDateString();

                      const timeLabel = (() => {
                        const diffMs = Date.now() - item.timestamp;
                        const diffMin = Math.floor(diffMs / 60000);
                        if (diffMin < 60) return `${diffMin || 1} menit lalu`;
                        const diffHr = Math.floor(diffMin / 60);
                        if (diffHr < 24) return `${diffHr} jam lalu`;
                        return item.timestamp.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                      })();

                      const dateLabel = isToday ? 'Hari Ini' : isYesterday ? 'Kemarin'
                        : item.timestamp.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });

                      return (
                        <div key={idx}>
                          {showDivider && (
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest pt-4 pb-2 first:pt-0">{dateLabel}</p>
                          )}
                          <div className="flex gap-4 py-3 border-b border-gray-50 last:border-0">
                            {/* Ikon */}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.type === 'review' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'}`}>
                              {item.type === 'review' ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                              ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                              )}
                            </div>

                            {/* Konten */}
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-2">
                                <h5 className="font-bold text-sm text-gray-900">{item.label}</h5>
                                <span className="text-[11px] text-gray-400 shrink-0">{timeLabel}</span>
                              </div>
                              <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{item.description}</p>
                              {/* Bintang untuk review */}
                              {item.type === 'review' && (
                                <div className="flex items-center gap-2 mt-1.5">
                                  <StarRating count={item.rating} max={5} />
                                  {!item.hasReply && (
                                    <button
                                      onClick={() => { setActiveTab('review'); }}
                                      className="text-[10px] text-blue-600 font-bold hover:underline"
                                    >
                                      + Balas
                                    </button>
                                  )}
                                  {item.hasReply && (
                                    <span className="text-[10px] text-green-600 font-semibold flex items-center gap-0.5">
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                      Sudah dibalas
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* --- TAB: KOS SAYA --- */}
          {activeTab === 'kos-saya' && (
            <div className="animate-fadeIn">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-extrabold text-gray-900">Properti Kos Saya</h1>
                  <p className="text-gray-500 text-sm mt-1">Kelola data, harga, dan ketersediaan kos Anda.</p>
                </div>
                <button 
                  onClick={() => setActiveTab('upload')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl transition shadow-sm flex items-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                  Tambah Kos Baru
                </button>
              </div>

              {isLoadingKos ? (
                <div className="text-center py-20 text-gray-500 font-medium">Memuat data properti Anda...</div>
              ) : myKosList.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-gray-200">
                  <p className="text-gray-500 font-medium mb-4">Anda belum memiliki properti kos yang dipublikasikan.</p>
                  <button onClick={() => setActiveTab('upload')} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-xl">Upload Sekarang</button>
                </div>
              ) : (
                <div className="space-y-5">
                  {myKosList.map((kos, index) => (
                    <div 
                      key={kos.kos_id} 
                      // 🔥 Mengunci tinggi menjadi pas (220px) agar sangat rapi dan konsisten
                      className={`flex flex-col md:flex-row bg-white rounded-[24px] border overflow-hidden shadow-sm hover:shadow-md transition-shadow md:h-[220px] ${index === 0 ? 'border-blue-500' : 'border-gray-200'}`}
                    >
                      {/* Bagian Kiri: Gambar */}
                      <div className="w-full md:w-72 h-48 md:h-full shrink-0">
                        <img src={kos.image_url} alt={kos.kos_name} className="w-full h-full object-cover" />
                      </div>
                      
                      {/* Bagian Kanan: Konten */}
                      <div className="flex-1 p-5 md:p-6 flex flex-col justify-between">
                        <div>
                          {/* Judul & Badge */}
                          <div className="flex justify-between items-start mb-0.5">
                            <h2 className="text-lg font-extrabold text-gray-900 leading-tight truncate pr-4">{kos.kos_name}</h2>
                            <span className="bg-blue-600 text-white px-3 py-1 text-[10px] font-bold rounded-full shrink-0 uppercase tracking-wider">
                              {kos.status ? kos.status : 'AKTIF'}
                            </span>
                          </div>
                          
                          {/* Harga */}
                          <p className="text-blue-600 font-extrabold text-[15px] mb-3">
                            Rp {Number(kos.price).toLocaleString('id-ID')}
                            <span className="text-[11px] font-medium text-gray-500 ml-0.5">/bulan</span>
                          </p>

                          {/* Fasilitas */}
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            <span className="border border-gray-300 text-gray-700 px-3 py-0.5 rounded-full text-[10px] font-semibold bg-white">WiFi</span>
                            <span className="border border-gray-300 text-gray-700 px-3 py-0.5 rounded-full text-[10px] font-semibold bg-white">AC</span>
                            <span className="border border-gray-300 text-gray-700 px-3 py-0.5 rounded-full text-[10px] font-semibold bg-white">Parkir Motor</span>
                            <span className="border border-gray-300 text-gray-700 px-3 py-0.5 rounded-full text-[10px] font-semibold bg-white">Dapur Bersama</span>
                          </div>
                        </div>

                        {/* Statistik & Tombol */}
                        <div className="mt-auto">
                          {/* Grid Statistik yang disejajarkan rata */}
                          <div className="grid grid-cols-3 gap-4 mb-2">
                            <div>
                              <p className="text-[10px] text-gray-400 font-medium mb-0.5">Pengunjung</p>
                              <p className="font-extrabold text-gray-900 text-base">0</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-400 font-medium mb-0.5">Leads</p>
                              <p className="font-extrabold text-gray-900 text-base">0</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-400 font-medium mb-0.5">Tipe</p>
                              <p className="font-extrabold text-gray-900 text-base">{kos.gender_type}</p>
                            </div>
                          </div>
                          
                          {/* Tombol diletakkan di bawah agar persis dengan desain */}
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleEditKos(kos)}
                              className="flex items-center gap-1.5 border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-1 px-3 rounded-lg text-[11px] transition"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                              Edit
                            </button>
                            
                            <button 
                              onClick={() => handleDeleteKos(kos.kos_id)}
                              className="flex items-center gap-1.5 border border-red-200 hover:bg-red-50 text-red-500 font-bold py-1 px-3 rounded-lg text-[11px] transition"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              Hapus
                            </button>
                          </div>
                        </div>
                        
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* --- TAB: UPLOAD KOS --- */}
          {activeTab === 'upload' && (
            <div className="animate-fadeIn">
              <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Upload Kos Baru</h1>
              <p className="text-gray-500 mb-8">Masukkan detail properti kos Anda dengan lengkap dan menarik.</p>
              
              <form onSubmit={handleUploadSubmit} className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-8">
                
                {/* 1. Informasi Dasar */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">1</span>
                    Informasi Dasar
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Kos</label>
                      <input type="text" name="kos_name" value={formData.kos_name} onChange={handleInputChange} placeholder="Contoh: Kos Melati Putri Residence" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-colors" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tipe Kos</label>
                      <select name="gender_type" value={formData.gender_type} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-colors appearance-none">
                        <option value="Campur">Campur (Pria & Wanita)</option>
                        <option value="Pria">Khusus Pria</option>
                        <option value="Wanita">Khusus Wanita</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Harga Sewa per Bulan (Rp)</label>
                      <input type="number" name="price" value={formData.price} onChange={handleInputChange} placeholder="Contoh: 1500000" required min="50000" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-colors" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Total Unit</label>
                      <input type="number" name="total_unit" value={formData.total_unit} onChange={handleInputChange} placeholder="Contoh: 10" required min="1" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-colors" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Unit Tersedia</label>
                      <input type="number" name="available_unit" value={formData.available_unit} onChange={handleInputChange} placeholder="Contoh: 5" required min="0" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-colors" />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Nomor WhatsApp yang Bisa Dihubungi
                        <span className="ml-1.5 text-xs font-normal text-gray-400">(nomor penjaga atau nomor Anda sendiri)</span>
                      </label>
                      <div className="flex">
                        <span className="inline-flex items-center px-4 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-gray-500 text-sm font-semibold select-none">
                          +62
                        </span>
                        <input
                          type="tel"
                          name="whatsapp_contact"
                          value={formData.whatsapp_contact}
                          onChange={handleInputChange}
                          placeholder="81234567890"
                          required
                          className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-r-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1.5">Tanpa angka 0 di depan. Contoh: 81234567890</p>
                    </div>
                  </div>
                </div>

                {/* 2. Lokasi */}
                <div className="pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">2</span>
                    Lokasi & Titik Peta
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kota / Kabupaten</label>
                      <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="Contoh: Surabaya Timur" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-colors" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Alamat Lengkap</label>
                      <textarea name="address" value={formData.address} onChange={handleInputChange} placeholder="Tuliskan nama jalan, RT/RW, kelurahan, dan patokan terdekat..." required rows="2" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-colors resize-none"></textarea>
                    </div>
                  </div>

                  {/* Peta Lokasi — Leaflet + OpenStreetMap (gratis, tanpa API key) */}
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tandai Lokasi Presisi di Peta</label>
                  <LocationPickerMap
                    latitude={formData.latitude}
                    longitude={formData.longitude}
                    onChange={(lat, lng) => setFormData({ ...formData, latitude: lat, longitude: lng })}
                  />
                </div>
                
                {/* 3. Fasilitas & Deskripsi */}
                <div className="pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">3</span>
                    Fasilitas & Deskripsi
                  </h3>
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Fasilitas yang Tersedia</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {listFasilitas.map((fac) => (
                        <label key={fac.facility_id} className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors ${selectedFacilities.includes(fac.facility_id) ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                          <input type="checkbox" className="hidden" checked={selectedFacilities.includes(fac.facility_id)} onChange={() => handleFacilityToggle(fac.facility_id)} />
                          <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedFacilities.includes(fac.facility_id) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                            {selectedFacilities.includes(fac.facility_id) && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                          </div>
                          <span className="text-sm font-medium">{fac.facility_name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6 mt-8">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Peraturan Kos</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {listRules.map((rule) => (
                        <label key={rule.rule_id} className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors ${selectedRules.includes(rule.rule_id) ? 'bg-red-50 border-red-400 text-red-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                          <input type="checkbox" className="hidden" checked={selectedRules.includes(rule.rule_id)} onChange={() => handleRuleToggle(rule.rule_id)} />
                          <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedRules.includes(rule.rule_id) ? 'bg-red-600 border-red-600' : 'border-gray-300'}`}>
                            {selectedRules.includes(rule.rule_id) && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                          </div>
                          <span className="text-sm font-medium">{rule.rule_name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Deskripsi Tambahan</label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Ceritakan kelebihan kos Anda (misal: dekat kampus ITS, suasana tenang, bebas jam malam...)" required rows="4" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-colors resize-none"></textarea>
                  </div>
                </div>

                {/* 4. Upload Foto */}
                <div className="pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">4</span>
                    Foto Properti
                  </h3>

                  {/* Grid preview foto */}
                  {photos.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-4">
                      {photos.map((photo) => (
                        <div key={photo.id} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-100">
                          <img
                            src={photo.previewUrl}
                            alt="Preview foto"
                            className="w-full h-full object-cover"
                          />
                          {/* Badge: existing vs baru */}
                          {photo.isExisting ? (
                            <span className="absolute top-1 left-1 bg-gray-700/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">Lama</span>
                          ) : (
                            <span className="absolute top-1 left-1 bg-blue-600/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">Baru</span>
                          )}
                          {/* Tombol hapus */}
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(photo.id)}
                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                            title="Hapus foto ini"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Drop zone */}
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:bg-gray-50 transition cursor-pointer relative"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handlePhotoDrop}
                  >
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <svg className="mx-auto h-10 w-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <p className="text-sm font-semibold text-gray-700">Klik atau seret foto ke sini untuk menambah</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {photos.length > 0
                        ? `${photos.length} foto (${photos.filter(p=>!p.isExisting).length} baru) — foto baru akan ditambahkan, bukan menggantikan`
                        : 'Pilih satu atau beberapa foto (Maks 2MB/foto)'}
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <button type="submit" disabled={isUploading} className={`w-full text-white font-bold py-4 rounded-xl transition shadow-md ${isUploading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
                    {isUploading ? 'Mengunggah Data...' : 'Simpan & Publikasikan Kos'}
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* --- TAB: REVIEW --- */}
          {activeTab === 'review' && (
            <div className="animate-fadeIn">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-3">
                <div>
                  <h1 className="text-2xl font-extrabold text-gray-900">Ulasan Kos</h1>
                  <p className="text-gray-500 text-sm mt-1">Rekap semua ulasan dari penyewa di seluruh kos Anda.</p>
                </div>
                <button
                  onClick={() => fetchAllReviews(myKosList)}
                  className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-600 font-semibold py-2 px-4 rounded-xl text-sm transition self-start md:self-auto"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  Refresh
                </button>
              </div>

              {reviewsLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
                  <p className="text-gray-500 text-sm font-medium">Memuat ulasan...</p>
                </div>
              ) : allReviews.length === 0 && myKosList.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-gray-200">
                  <svg className="mx-auto w-14 h-14 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  <p className="text-gray-500 font-medium mb-1">Belum ada kos yang terdaftar.</p>
                  <p className="text-gray-400 text-sm mb-4">Upload kos Anda terlebih dahulu untuk mulai menerima ulasan.</p>
                  <button onClick={() => setActiveTab('upload')} className="bg-blue-600 text-white font-bold py-2 px-5 rounded-xl text-sm">Upload Kos</button>
                </div>
              ) : (
                <>
                  {/* Statistik ringkas */}
                  {allReviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Total Ulasan</p>
                        <p className="text-3xl font-extrabold text-gray-900">{allReviews.length}</p>
                      </div>
                      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Rating Rata-rata</p>
                        <div className="flex items-center gap-2">
                          <p className="text-3xl font-extrabold text-amber-500">
                            {(allReviews.reduce((s, r) => s + parseFloat(r.rating), 0) / allReviews.length).toFixed(1)}
                          </p>
                          <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        </div>
                      </div>
                      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Belum Dibalas</p>
                        <p className="text-3xl font-extrabold text-red-500">
                          {allReviews.filter(r => !r.owner_reply).length}
                        </p>
                      </div>
                      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Sudah Dibalas</p>
                        <p className="text-3xl font-extrabold text-green-500">
                          {allReviews.filter(r => !!r.owner_reply).length}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Filter per kos */}
                  {myKosList.length > 1 && (
                    <div className="flex gap-2 flex-wrap mb-5">
                      <button
                        onClick={() => setReviewFilter('semua')}
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold transition border ${reviewFilter === 'semua' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                      >
                        Semua Kos
                      </button>
                      {myKosList.map(kos => (
                        <button
                          key={kos.kos_id}
                          onClick={() => setReviewFilter(kos.kos_id)}
                          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition border truncate max-w-[200px] ${reviewFilter === kos.kos_id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                        >
                          {kos.kos_name}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Daftar review */}
                  {(() => {
                    const filtered = reviewFilter === 'semua'
                      ? allReviews
                      : allReviews.filter(r => r._kos_id === reviewFilter);

                    if (filtered.length === 0) {
                      return (
                        <div className="text-center py-16 bg-white rounded-3xl border border-gray-200">
                          <svg className="mx-auto w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                          <p className="text-gray-500 font-medium">Belum ada ulasan untuk kos ini.</p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-4">
                        {filtered.map((review) => (
                          <div key={review.reviewid} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            {/* Badge nama kos (hanya tampil di mode 'semua') */}
                            {reviewFilter === 'semua' && (
                              <div className="px-5 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                                <svg className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                                <span className="text-xs font-bold text-gray-600 truncate">{review._kos_name}</span>
                              </div>
                            )}

                            <div className="p-5">
                              {/* Header review: avatar + nama + rating + tanggal */}
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                                    {(review.user?.user_name || 'U').charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h3 className="font-bold text-sm text-gray-900">{review.user?.user_name || 'Pengguna'}</h3>
                                      <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">Penyewa</span>
                                    </div>
                                    <StarRating count={Math.round(parseFloat(review.rating))} max={5} />
                                  </div>
                                </div>
                                <span className="text-[11px] text-gray-400 font-medium flex-shrink-0 pt-0.5">
                                  {new Date(review.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                              </div>

                              {/* Komentar */}
                              <p className="text-sm text-gray-600 leading-relaxed mb-3">{review.comment}</p>

                              {/* Foto review */}
                              {review.photos && review.photos.length > 0 && (
                                <div className="flex gap-2 mb-3 flex-wrap">
                                  {review.photos.map((photo, idx) => {
                                    const imageUrl = photo.photo_url.startsWith('http')
                                      ? photo.photo_url
                                      : `${import.meta.env.VITE_APP_BASE_URL}${photo.photo_url}`;
                                    return (
                                      <img
                                        key={photo.photo_id}
                                        src={imageUrl}
                                        alt={`Foto ulasan ${idx + 1}`}
                                        className="w-20 h-16 rounded-lg object-cover border cursor-pointer hover:opacity-90 transition-opacity"
                                      />
                                    );
                                  })}
                                </div>
                              )}

                              {/* Balasan pemilik yang sudah ada */}
                              {review.owner_reply && (
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 mt-2">
                                  <div className="flex items-center gap-1.5 mb-1.5">
                                    <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                                    <p className="text-xs font-bold text-amber-700">Tanggapan Anda</p>
                                  </div>
                                  <p className="text-sm text-gray-700 leading-relaxed">{review.owner_reply}</p>
                                  {review.owner_replied_at && (
                                    <p className="text-[10px] text-gray-400 mt-1.5">
                                      {new Date(review.owner_replied_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                  )}
                                </div>
                              )}

                              {/* Form balas — hanya jika belum ada balasan */}
                              {!review.owner_reply && (
                                <div className="mt-3">
                                  {replyTarget === review.reviewid ? (
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                      <p className="text-xs font-bold text-blue-700 mb-2">Tulis tanggapan Anda</p>
                                      <textarea
                                        value={replyText}
                                        onChange={e => setReplyText(e.target.value)}
                                        placeholder="Balas ulasan ini dengan sopan dan informatif..."
                                        className="w-full border border-blue-200 bg-white rounded-lg p-3 text-sm outline-none focus:border-blue-400 resize-none mb-2"
                                        rows={3}
                                      />
                                      {replyError && (
                                        <p className="text-red-500 text-xs mb-2 font-medium">{replyError}</p>
                                      )}
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => handleSubmitReply(review.reviewid)}
                                          disabled={replySubmitting || !replyText.trim()}
                                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg disabled:opacity-50 transition"
                                        >
                                          {replySubmitting ? 'Mengirim...' : 'Kirim Balasan'}
                                        </button>
                                        <button
                                          onClick={() => { setReplyTarget(null); setReplyText(''); setReplyError(''); }}
                                          className="text-gray-500 text-xs font-semibold px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
                                        >
                                          Batal
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => { setReplyTarget(review.reviewid); setReplyText(''); setReplyError(''); }}
                                      className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold hover:text-blue-800 transition mt-1"
                                    >
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                                      Balas ulasan ini
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
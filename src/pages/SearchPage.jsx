import { useState, useEffect, useRef, useCallback } from 'react';
import LogoKosfinder from '../assets/Logo-Kosfinder.svg';
import IconCari from '../assets/material-symbols-light_search.svg';
import IconWishlist from '../assets/tdesign_heart.svg';
import IconSetting from '../assets/mdi-light_settings.svg';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function SearchPage({ initialParams, onNavigate, onNavigateBack }) {

  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [settingOpen, setSettingOpen] = useState(false);

  // STATE FILTER — inisialisasi dari initialParams (dikirim dari Home)
  const [searchKeyword, setSearchKeyword] = useState(() => {
    if (typeof initialParams === 'string') return initialParams;
    return initialParams?.keyword || '';
  });
  const [filterGenders, setFilterGenders] = useState(() => initialParams?.genders || []);
  const [minPrice, setMinPrice] = useState(() => initialParams?.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(() => initialParams?.maxPrice || '');
  const [filterFacilities, setFilterFacilities] = useState(() => initialParams?.facilities || []);
  const [filterRules, setFilterRules] = useState(() => initialParams?.rules || []);
  const [isAvailable, setIsAvailable] = useState(() => initialParams?.isAvailable || false);

  // STATE GEOCODING — hasil pencarian koordinat dari Nominatim
  const [geocodeResult, setGeocodeResult] = useState(null); // { lat, lng, displayName } | null
  const [isGeocoding, setIsGeocoding] = useState(false);
  const debounceTimer = useRef(null);
  const RADIUS_KM = 3; // radius pencarian berbasis lokasi (km)

  // STATE AUTENTIKASI
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userAvatar, setUserAvatar] = useState(null);

  // STATE DATA
  const [dataKos, setDataKos] = useState([]);
  const [listFasilitas, setListFasilitas] = useState([]);
  const [listPeraturan, setListPeraturan] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const toggleDropdown = (name) => setOpenDropdown(openDropdown === name ? null : name);
  const toggleGender = (item) => setFilterGenders(prev => prev.includes(item) ? prev.filter(g => g !== item) : [...prev, item]);
  const toggleFacility = (item) => setFilterFacilities(prev => prev.includes(item) ? prev.filter(f => f !== item) : [...prev, item]);
  const toggleRule = (item) => setFilterRules(prev => prev.includes(item) ? prev.filter(r => r !== item) : [...prev, item]);

  // Hitung jarak antara dua koordinat (km) — Haversine formula
  const hitungJarak = useCallback((lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }, []);

  // Debounced geocoding — hit Nominatim 600ms setelah user berhenti mengetik
  useEffect(() => {
    const keyword = (searchKeyword || '').trim();

    // Reset geocode jika keyword kosong
    if (!keyword) {
      setGeocodeResult(null);
      return;
    }

    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      setIsGeocoding(true);
      try {
        // Tambahkan konteks kota agar hasil lebih akurat
        const query = encodeURIComponent(`${keyword}, Surabaya, Indonesia`);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
          { headers: { 'Accept-Language': 'id', 'User-Agent': 'KosFinder/1.0' } }
        );
        const data = await res.json();
        if (data.length > 0) {
          setGeocodeResult({
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
            displayName: data[0].display_name,
          });
        } else {
          setGeocodeResult(null);
        }
      } catch {
        setGeocodeResult(null);
      } finally {
        setIsGeocoding(false);
      }
    }, 600);

    return () => clearTimeout(debounceTimer.current);
  }, [searchKeyword]);

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    try {
      if (token) {
        await fetch(`${API_BASE}/logout`, {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error("Gagal logout dari server:", error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsLoggedIn(false);
      setUserName('');
      window.location.reload();
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      setIsLoggedIn(true);
      const user = JSON.parse(userStr);
      setUserName(user.user_name.split(' ')[0]);
      setUserRole(user.role);
      setUserAvatar(user.avatar_url || null);
    }

    const headers = { 'Accept': 'application/json' };
    Promise.all([
      fetch(`${API_BASE}/kos`, { headers }).then(r => r.json()),
      fetch(`${API_BASE}/facilities`, { headers }).then(r => r.json()),
      fetch(`${API_BASE}/rules`, { headers }).then(r => r.json()),
    ])
      .then(([kosData, facData, ruleData]) => {
        if (kosData.success)  setDataKos(kosData.data);
        if (facData.success)  setListFasilitas(facData.data);
        if (ruleData.success) setListPeraturan(ruleData.data);
      })
      .catch((error) => console.error('Gagal mengambil data:', error))
      .finally(() => setIsLoading(false));
  }, []);

  // FILTER CLIENT-SIDE
  const filteredKos = dataKos.filter((kos) => {
    const kataKunci = (searchKeyword || '').toLowerCase();

    let matchKeyword = true;
    if (kataKunci) {
      if (geocodeResult && kos.latitude && kos.longitude) {
        // Mode lokasi — kos dalam radius RADIUS_KM dari koordinat hasil geocode
        const jarak = hitungJarak(
          geocodeResult.lat, geocodeResult.lng,
          parseFloat(kos.latitude), parseFloat(kos.longitude)
        );
        matchKeyword = jarak <= RADIUS_KM;
      } else {
        // Fallback — pencarian teks biasa (nama, alamat, kota, deskripsi)
        matchKeyword =
          (kos.kos_name || '').toLowerCase().includes(kataKunci) ||
          (kos.address || '').toLowerCase().includes(kataKunci) ||
          (kos.city || '').toLowerCase().includes(kataKunci) ||
          (kos.description || '').toLowerCase().includes(kataKunci);
      }
    }

    const matchGender = filterGenders.length === 0 || filterGenders.includes(kos.gender_type);

    const harga = parseInt(kos.price) || 0;
    const matchMinPrice = minPrice === '' || harga >= parseInt(minPrice);
    const matchMaxPrice = maxPrice === '' || harga <= parseInt(maxPrice);

    const matchFacilities = filterFacilities.length === 0 ||
      filterFacilities.every(fId => (kos.facilities || []).some(f => f.facility_id === fId));

    const matchRules = filterRules.length === 0 ||
      filterRules.every(rId => (kos.rules || []).some(r => r.rule_id === rId));

    const matchAvailability = !isAvailable || parseInt(kos.available_unit ?? 0) > 0;

    return matchKeyword && matchGender && matchMinPrice && matchMaxPrice && matchFacilities && matchRules && matchAvailability;
  });

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col">

      <header className="bg-white px-4 pt-3 pb-1 md:px-8 md:py-4 flex flex-wrap content-start items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="order-1 flex justify-start md:flex-1">
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigateBack(); }} className="hover:opacity-80 transition-opacity">
            <img src={LogoKosfinder} alt="Logo" className="h-8 md:h-10 w-auto" />
          </a>
        </div>

        {/* BAGIAN KANAN NAVBAR */}
        <div className="order-2 md:order-3 flex justify-end md:flex-1">
          {isLoggedIn ? (
            <div className="flex items-center gap-3 md:gap-4 animate-fadeIn">
              
              {userRole === 'pemilik' && (
                <button onClick={() => onNavigate('kelola-kos')} className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full font-bold transition-colors text-xs md:text-sm shadow-sm flex items-center gap-1.5">
                  <svg className="w-4 h-4 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  Kelola Kos
                </button>
              )}
              
              <button onClick={() => onNavigate('profil')} className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center hover:bg-blue-200 transition overflow-hidden border-2 border-blue-200">
                {userAvatar ? (
                  <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                ) : (
                  userName.charAt(0).toUpperCase()
                )}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 md:gap-3">
              <button onClick={() => onNavigate('login')} className="text-gray-700 font-medium hover:text-blue-600 transition px-2 py-1 md:px-4 md:py-2 text-xs md:text-sm">
                Masuk
              </button>
              <button onClick={() => onNavigate('register')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 md:px-6 md:py-2.5 rounded-full font-bold transition-colors text-xs md:text-sm shadow-sm">
                Daftar
              </button>
            </div>
          )}
        </div>

        <nav className="order-3 md:order-2 w-full md:w-auto mt-2 md:mt-0 flex justify-evenly md:justify-center gap-2 md:gap-16 lg:gap-24 font-medium text-gray-500">
          <a href="#" onClick={(e) => { e.preventDefault(); setShowSearchPanel(!showSearchPanel); }} className={`flex flex-col items-center group cursor-pointer ${showSearchPanel ? 'text-blue-600' : 'hover:text-blue-600'}`}>
            <img src={IconCari} className="w-5 h-5 md:w-6 md:h-6 opacity-70 group-hover:opacity-100 transition-opacity" alt="Cari" />
            <span className="mt-1 text-xs md:text-sm">Cari Kos</span>
          </a>
          
          {/* MENU WISHLIST */}
          <a href="#" onClick={(e) => { e.preventDefault(); isLoggedIn ? onNavigate('wishlist') : onNavigate('login'); }} className={`flex flex-col items-center group cursor-pointer transition-colors ${isLoggedIn ? 'hover:text-blue-600' : 'opacity-40 hover:opacity-70'}`}>
            <img src={IconWishlist} className={`w-5 h-5 md:w-6 md:h-6 transition-opacity ${isLoggedIn ? 'opacity-70 group-hover:opacity-100' : 'opacity-50'}`} alt="Wishlist" />
            <span className="mt-1 text-xs md:text-sm">Wishlist</span>
          </a>
          
          {/* MENU RIWAYAT */}
          <a href="#" onClick={(e) => { e.preventDefault(); isLoggedIn ? onNavigate('riwayat') : onNavigate('login'); }} className={`flex flex-col items-center group cursor-pointer transition-colors ${isLoggedIn ? 'hover:text-blue-600' : 'opacity-40 hover:opacity-70'}`}>
            <svg className={`w-5 h-5 md:w-6 md:h-6 transition-opacity ${isLoggedIn ? 'opacity-70 group-hover:opacity-100' : 'opacity-50'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span className="mt-1 text-xs md:text-sm">Riwayat</span>
          </a>
          
          <button onClick={() => setSettingOpen(true)} className="flex flex-col items-center hover:text-blue-600 group cursor-pointer bg-transparent border-none outline-none">
            <img src={IconSetting} className="w-5 h-5 md:w-6 md:h-6 opacity-70 group-hover:opacity-100 transition-opacity" alt="Setting" />
            <span className="mt-1 text-xs md:text-sm">Setting</span>
          </button>
        </nav>
      </header>

      {/* PANEL PENCARIAN */}
      {showSearchPanel && (
        <div className="sticky top-[60px] md:top-[72px] z-40 bg-white border-b border-gray-200 shadow-lg px-4 py-5 md:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-50 p-2 rounded-full flex items-center border border-gray-200 w-full mb-4 focus-within:ring-2 ring-blue-100 transition-all">
              <img src={IconCari} alt="Cari" className="ml-3 w-5 h-5 opacity-60" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setShowSearchPanel(false)}
                placeholder="Cari lokasi, kampus, nama kos..."
                className="w-full px-4 py-1.5 outline-none text-sm md:text-base bg-transparent text-gray-800"
              />
              {isGeocoding && (
                <div className="mr-2 flex items-center gap-1 text-xs text-gray-400 shrink-0">
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-blue-400" />
                  <span className="hidden sm:block">Mencari lokasi...</span>
                </div>
              )}
              <button onClick={() => setShowSearchPanel(false)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-bold transition-colors hidden md:block text-sm">
                Terapkan
              </button>
            </div>

            {/* Info hasil geocode */}
            {geocodeResult && searchKeyword && (
              <div className="mb-3 flex items-center gap-2 text-xs text-blue-600 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span>Menampilkan kos dalam radius <strong>{RADIUS_KM} km</strong> dari <strong>{searchKeyword}</strong></span>
              </div>
            )}
            {!geocodeResult && searchKeyword && !isGeocoding && (
              <div className="mb-3 flex items-center gap-2 text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <span>Lokasi tidak ditemukan — mencari berdasarkan teks</span>
              </div>
            )}
            <div className="flex flex-wrap gap-2.5">
              <div className="relative">
                <button onClick={() => toggleDropdown('gender')} className={`px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold border transition-colors shadow-sm ${filterGenders.length > 0 || openDropdown === 'gender' ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                  {filterGenders.length > 0 ? `Tipe (${filterGenders.length}) ▾` : 'Tipe Kos ▾'}
                </button>
                {openDropdown === 'gender' && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl p-3 z-50">
                    {['Pria', 'Wanita', 'Campur'].map(g => (
                      <label key={g} className="flex items-center space-x-3 py-2 px-2 hover:bg-blue-50 rounded-lg cursor-pointer">
                        <input type="checkbox" checked={filterGenders.includes(g)} onChange={() => toggleGender(g)} className="w-4 h-4 rounded text-blue-600" />
                        <span className="text-sm text-gray-700">{g}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <button onClick={() => toggleDropdown('price')} className={`px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold border transition-colors shadow-sm ${(minPrice || maxPrice) || openDropdown === 'price' ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                  Harga ▾
                </button>
                {openDropdown === 'price' && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-xl p-4 z-50 flex flex-col gap-4">
                    <div><label className="block text-xs font-semibold text-gray-500 mb-1">Min (Rp)</label><input type="number" placeholder="0" min="0" value={minPrice} onChange={(e) => { const val = e.target.value; if (val === '' || parseInt(val) >= 0) setMinPrice(val); }} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" /></div>
                    <div><label className="block text-xs font-semibold text-gray-500 mb-1">Max (Rp)</label><input type="number" placeholder="2000000" min="0" value={maxPrice} onChange={(e) => { const val = e.target.value; if (val === '' || parseInt(val) >= 0) setMaxPrice(val); }} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" /></div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button onClick={() => toggleDropdown('facilities')} className={`px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold border transition-colors shadow-sm ${filterFacilities.length > 0 || openDropdown === 'facilities' ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                  {filterFacilities.length > 0 ? `Fasilitas (${filterFacilities.length}) ▾` : 'Fasilitas ▾'}
                </button>
                {openDropdown === 'facilities' && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl p-3 z-50 max-h-60 overflow-y-auto">
                    {listFasilitas.map(f => (
                      <label key={f.facility_id} className="flex items-center space-x-3 py-1.5 px-2 hover:bg-blue-50 rounded-lg cursor-pointer">
                        <input type="checkbox" checked={filterFacilities.includes(f.facility_id)} onChange={() => toggleFacility(f.facility_id)} className="w-4 h-4 rounded text-blue-600" />
                        <span className="text-sm text-gray-700">{f.facility_name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <button onClick={() => toggleDropdown('rules')} className={`px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold border transition-colors shadow-sm ${filterRules.length > 0 || openDropdown === 'rules' ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                  {filterRules.length > 0 ? `Peraturan (${filterRules.length}) ▾` : 'Peraturan ▾'}
                </button>
                {openDropdown === 'rules' && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl p-3 z-50 max-h-60 overflow-y-auto">
                    {listPeraturan.map(r => (
                      <label key={r.rule_id} className="flex items-center space-x-3 py-1.5 px-2 hover:bg-blue-50 rounded-lg cursor-pointer">
                        <input type="checkbox" checked={filterRules.includes(r.rule_id)} onChange={() => toggleRule(r.rule_id)} className="w-4 h-4 rounded text-blue-600" />
                        <span className="text-sm text-gray-700">{r.rule_name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={() => setIsAvailable(!isAvailable)} className={`px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold border transition-colors shadow-sm ${isAvailable ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                Tersedia
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="w-full max-w-6xl mx-auto px-4 md:px-8 mt-8 mb-20 flex-1">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
            {geocodeResult && searchKeyword
              ? `Kos dekat "${searchKeyword}"`
              : searchKeyword
              ? `Hasil untuk "${searchKeyword}"`
              : 'Semua Kos'}
          </h1>
          <span className="text-sm text-gray-500 font-medium">
            {isGeocoding ? 'Mencari...' : `${filteredKos.length} kos ditemukan`}
          </span>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-500 font-medium">Memuat data kos...</span>
          </div>
        ) : filteredKos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-60 text-gray-400">
            <svg className="w-16 h-16 mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <p className="font-semibold text-lg">Kos tidak ditemukan</p>
            <p className="text-sm mt-1">Coba ubah kata kunci atau filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {filteredKos.map((kos) => (
              <div
                key={kos.kos_id}
                onClick={() => onNavigate(`detail-${kos.kos_id}`)}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer"
              >
                <div className="w-full h-36 sm:h-40 overflow-hidden relative">
                  <img src={kos.image_url} alt={kos.kos_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {parseInt(kos.available_unit ?? 0) === 0 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Penuh</span>
                    </div>
                  )}
                </div>
                <div className="p-3 flex flex-col gap-1.5">
                  <div className="flex justify-between items-start gap-1">
                    <div className="flex flex-col gap-1 min-w-0">
                      <h3 className="font-bold text-sm text-gray-900 leading-tight truncate">{kos.kos_name}</h3>
                      <span className="border border-blue-400 text-blue-600 px-2 py-0.5 rounded-full text-[10px] font-semibold w-fit">{kos.gender_type}</span>
                    </div>
                    <svg className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                    </svg>
                  </div>
                  <div className="flex items-start gap-1 text-gray-500 text-[10px] font-medium">
                    <svg className="w-3 h-3 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    <span className="truncate">{kos.city}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-semibold text-gray-700">
                    <svg className="w-3 h-3 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    <span>{kos.average_rating ? Number(kos.average_rating).toFixed(1) : 'Baru'}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {(kos.facilities || []).slice(0, 3).map((fac) => (
                      <span key={fac.facility_id} className="bg-blue-50 text-blue-600 text-[9px] px-2 py-0.5 rounded-full font-semibold">{fac.facility_name}</span>
                    ))}
                    {(kos.facilities || []).length > 3 && (
                      <span className="bg-gray-100 text-gray-500 text-[9px] px-2 py-0.5 rounded-full font-semibold">+{(kos.facilities || []).length - 3}</span>
                    )}
                  </div>
                  {(kos.rules || []).length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {(kos.rules || []).slice(0, 2).map((rule) => (
                        <span key={rule.rule_id} className="bg-amber-50 text-amber-600 text-[9px] px-2 py-0.5 rounded-full font-semibold">{rule.rule_name}</span>
                      ))}
                      {(kos.rules || []).length > 2 && (
                        <span className="bg-gray-100 text-gray-500 text-[9px] px-2 py-0.5 rounded-full font-semibold">+{(kos.rules || []).length - 2}</span>
                      )}
                    </div>
                  )}
                  <p className="mt-1 text-[10px] text-gray-500">
                    <span className="text-blue-600 font-extrabold text-sm mr-0.5">Rp {Number(kos.price).toLocaleString('id-ID')}</span>/bln
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* SETTING SIDEBAR */}
      {settingOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSettingOpen(false)} />
          <div className="relative w-full max-w-sm bg-[#F2F2F7] h-full overflow-y-auto shadow-2xl flex flex-col animate-slideInRight">
            <div className="bg-white px-5 pt-12 pb-4 flex items-center justify-between border-b border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-2 border-blue-200">
                  {isLoggedIn ? (
                    userAvatar ? (
                      <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-blue-600 font-bold text-xl">{userName.charAt(0).toUpperCase()}</span>
                    )
                  ) : (
                    <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                  )}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-base">{isLoggedIn ? userName : 'Tamu'}</p>
                  <p className="text-gray-400 text-xs">{isLoggedIn ? 'Pengguna KosFinder' : 'Belum masuk'}</p>
                </div>
              </div>
              <button onClick={() => setSettingOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="flex-1 px-4 py-5 space-y-6">
              {[
                { label: 'Profil', items: [{ title: 'Ubah Profil', sub: 'Nama, foto, dan info pribadi', key: 'profil' }] },
                { label: 'Riwayat', items: [{ title: 'Riwayat Pencarian', key: 'riwayat' }] },
                { label: 'Keamanan', items: [{ title: 'Ubah Password', key: 'profil' }] },
                { label: 'Bantuan', items: [{ title: 'Tanya KosFinder+', key: 'bantuan' }] },
                { label: 'Lainnya', items: [{ title: 'Tentang Kami', key: 'tentang' }, { title: 'Kebijakan Privasi', key: 'kebijakan' }, { title: 'Kredit & Atribut', key: 'kredit' }] },
              ].map(section => (
                <div key={section.label}>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-1 mb-2">{section.label}</p>
                  <div className="bg-white rounded-2xl overflow-hidden divide-y divide-gray-100 shadow-sm">
                    {section.items.map(item => (
                      <button key={item.key} onClick={() => { setSettingOpen(false); onNavigate(item.key); }} className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition text-left">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                          {item.sub && <p className="text-[11px] text-gray-400">{item.sub}</p>}
                        </div>
                        <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 pb-8 pt-2">
              <button onClick={() => { setSettingOpen(false); handleLogout(); }} className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-500 hover:bg-red-50 transition py-3 rounded-2xl font-semibold text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slideInRight {
          animation: slideInRight 0.25s cubic-bezier(0.32, 0.72, 0, 1) forwards;
        }
      `}</style>
    </div>
  );
}
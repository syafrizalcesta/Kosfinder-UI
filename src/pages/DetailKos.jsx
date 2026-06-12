import { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import LogoKosfinder from '../assets/Logo-Kosfinder.svg';

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
import IconCari from '../assets/material-symbols-light_search.svg';
import IconWishlist from '../assets/tdesign_heart.svg';
import IconSetting from '../assets/mdi-light_settings.svg';



// Base URL icons dari Laravel public/icons/
const API_BASE = import.meta.env.VITE_API_BASE_URL;
const ICON_BASE_URL = `${import.meta.env.VITE_APP_BASE_URL}/icons/`;
const DEFAULT_ICONS = ['default-icon.svg', 'default-rule.svg', ''];

function ItemBubble({ iconUrl, label, variant = 'facility' }) {
  const borderClass = variant === 'rule'
    ? 'border-amber-200 bg-amber-50'
    : 'border-gray-200 bg-white';

  const isCustomIcon = iconUrl && !DEFAULT_ICONS.includes(iconUrl);
  const fullUrl = isCustomIcon
    ? (iconUrl.startsWith('http') ? iconUrl : `${ICON_BASE_URL}${iconUrl}`)
    : null;

  return (
    <div className={`border ${borderClass} px-4 py-2.5 rounded-xl flex items-center gap-2.5 shadow-sm`}>
      {fullUrl
        ? <img src={fullUrl} className="w-5 h-5 object-contain flex-shrink-0" alt="" aria-hidden="true" />
        : (
          <svg className="w-5 h-5 flex-shrink-0 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z"/>
          </svg>
        )
      }
      <span className="text-sm font-semibold text-gray-700">{label}</span>
    </div>
  );
}

function StarRating({ count = 5, max = 5 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(max)].map((_, i) => (
        <svg key={i} className={`w-4 h-4 ${i < count ? 'text-orange-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function ImageLightbox({ images, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex);

  const prev = useCallback(() => setCurrent(i => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setCurrent(i => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [prev, next, onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/90 flex flex-col items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium">
        {current + 1} / {images.length}
      </div>

      <button
        className="absolute top-4 right-4 text-white/70 hover:text-white text-3xl font-light leading-none transition-colors"
        onClick={onClose}
        aria-label="Tutup"
      >
        ×
      </button>

      <div
        className="relative w-full max-w-4xl px-16 flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={images[current]}
          alt={`Foto ${current + 1}`}
          className="max-h-[80vh] max-w-full object-contain rounded-lg select-none"
        />
      </div>

      {images.length > 1 && (
        <button
          className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
          onClick={(e) => { e.stopPropagation(); prev(); }}
          aria-label="Foto sebelumnya"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {images.length > 1 && (
        <button
          className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
          onClick={(e) => { e.stopPropagation(); next(); }}
          aria-label="Foto berikutnya"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {images.length > 1 && (
        <div
          className="absolute bottom-4 flex gap-2 px-4 overflow-x-auto max-w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((url, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`flex-shrink-0 w-14 h-10 rounded overflow-hidden border-2 transition-all ${i === current ? 'border-white' : 'border-transparent opacity-50 hover:opacity-80'}`}
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DetailKos({ kosId, onBack, onNavigate }) {
  const [kos, setKos] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userAvatar, setUserAvatar] = useState(null);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [settingOpen, setSettingOpen] = useState(false);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxStart, setLightboxStart] = useState(0);

  // ── State Review ─────────────────────────────────────────────
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewLightbox, setReviewLightbox] = useState({ open: false, images: [], index: 0 });

  // Form review baru
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewPhotos, setReviewPhotos] = useState([]);   // File[] dari input
  const [reviewPhotosPrev, setReviewPhotosPrev] = useState([]); // URL preview
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const reviewPhotoRef = useRef(null);

  // Form balasan pemilik
  const [replyTarget, setReplyTarget] = useState(null);  // reviewid yang sedang dibalas
  const [replyText, setReplyText] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);
  // ─────────────────────────────────────────────────────────────

  const mapSectionRef = useRef(null);

  const [openDropdown, setOpenDropdown] = useState(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [filterGenders, setFilterGenders] = useState([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [filterFacilities, setFilterFacilities] = useState([]);

  const listFasilitas = ['Wifi', 'AC', 'Kipas', 'Parkir Mobil', 'Kamar Mandi Dalam', 'Include Listrik', 'Dapur', 'Laundry'];

  const toggleDropdown = (name) => setOpenDropdown(openDropdown === name ? null : name);
  const toggleGender = (item) => setFilterGenders(prev => prev.includes(item) ? prev.filter(g => g !== item) : [...prev, item]);
  const toggleFacility = (item) => setFilterFacilities(prev => prev.includes(item) ? prev.filter(f => f !== item) : [...prev, item]);

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    try {
      if (token) {
        await fetch(`${API_BASE}/logout`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
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
    const handler = () => setOpenDropdown(null);
    if (openDropdown) document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [openDropdown]);

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
  }, []);

  // ── Fetch detail kos + catat riwayat kunjungan ──────────────────────────
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    fetch(`${API_BASE}/kos/${kosId}`, { headers })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setKos(data.data);
          setIsWishlisted(data.data.is_wishlisted ?? false);

          // ── Catat riwayat kunjungan — fire and forget ──────────────────
          // Dipanggil setelah data berhasil dimuat agar kos_id sudah valid.
          // Tidak perlu await; error diabaikan agar tidak mengganggu UI.
          fetch(`${API_BASE}/kos/${kosId}/view`, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }).catch(() => {});
          // ───────────────────────────────────────────────────────────────

        } else {
          setError('Data kos tidak ditemukan.');
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Gagal mengambil detail kos:', err);
        setError('Gagal memuat data. Periksa koneksi ke server.');
        setIsLoading(false);
      });
  }, [kosId]);

  // ── Fetch reviews kos ─────────────────────────────────────────
  useEffect(() => {
    if (!kosId) return;
    setReviewsLoading(true);
    fetch(`${API_BASE}/kos/${kosId}/reviews`, {
      headers: { Accept: 'application/json' },
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) setReviews(data.data || []);
      })
      .catch(() => {})
      .finally(() => setReviewsLoading(false));
  }, [kosId, reviewSuccess]);
  // ─────────────────────────────────────────────────────────────

  // ── Helper: submit review ─────────────────────────────────────
  const handleSubmitReview = async () => {
    if (reviewRating === 0) { setReviewError('Pilih rating terlebih dahulu.'); return; }
    if (!reviewComment.trim()) { setReviewError('Tulis komentar terlebih dahulu.'); return; }
    setReviewError('');
    setReviewSubmitting(true);
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('kos_id', kosId);
    formData.append('rating', reviewRating);
    formData.append('comment', reviewComment);
    reviewPhotos.forEach((file, i) => formData.append(`photos[${i}]`, file));
    try {
      const res = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setReviewRating(0);
        setReviewComment('');
        setReviewPhotos([]);
        setReviewPhotosPrev([]);
        setReviewSuccess(v => !v); // trigger re-fetch
      } else {
        setReviewError(data.message || 'Gagal mengirim ulasan.');
      }
    } catch {
      setReviewError('Gagal menghubungi server.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  // ── Helper: submit balasan pemilik ────────────────────────────
  const handleSubmitReply = async (reviewid) => {
    if (!replyText.trim()) return;
    setReplySubmitting(true);
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
        setReviewSuccess(v => !v); // trigger re-fetch
      }
    } catch {
      // silent fail — bisa tambahkan toast di sini
    } finally {
      setReplySubmitting(false);
    }
  };

  // ── Helper: preview foto sebelum upload ──────────────────────
  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    const remaining = 5 - reviewPhotos.length;
    const added = files.slice(0, remaining);
    setReviewPhotos(prev => [...prev, ...added]);
    const previews = added.map(f => URL.createObjectURL(f));
    setReviewPhotosPrev(prev => [...prev, ...previews]);
  };

  const removePhoto = (index) => {
    setReviewPhotos(prev => prev.filter((_, i) => i !== index));
    setReviewPhotosPrev(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };
  // ─────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex flex-col justify-center items-center gap-3">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        <span className="text-gray-600 font-semibold">Memuat Detail KosFinder...</span>
      </div>
    );
  }

  if (error || !kos) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex flex-col justify-center items-center gap-3">
        <p className="text-red-500 font-bold text-lg">{error || 'Data tidak ditemukan.'}</p>
        <button onClick={onBack} className="bg-blue-600 text-white px-4 py-2 rounded-xl">Kembali</button>
      </div>
    );
  }

  const allImages = kos.images || [];
  const sortedImages = [
    ...allImages.filter(img => img.is_primary),
    ...allImages.filter(img => !img.is_primary),
  ];
  const imageUrls = sortedImages.map(img => img.image_url).filter(Boolean);
  const fallbackUrl = 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=1000&q=80';
  const displayUrls = imageUrls.length > 0 ? imageUrls : [fallbackUrl];

  const mainImage = displayUrls[0];
  const subImages = displayUrls.slice(1);

  const openLightbox = (index) => {
    setLightboxStart(index);
    setLightboxOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24 text-gray-800">

      {lightboxOpen && (
        <ImageLightbox
          images={displayUrls}
          startIndex={lightboxStart}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      {/* === HEADER === */}
      <header className="bg-white px-4 pt-3 pb-1 md:px-8 md:py-4 flex flex-wrap content-start items-center justify-between sticky top-0 z-[60] shadow-sm">
        <div className="order-1 flex justify-start md:flex-1">
          <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }} className="hover:opacity-80 transition-opacity">
            <img src={LogoKosfinder} alt="Logo KosFinder" className="h-8 md:h-10 w-auto" />
          </a>
        </div>

        {/* BAGIAN KANAN NAVBAR */}
        <div className="order-2 md:order-3 flex justify-end md:flex-1">
          {isLoggedIn ? (
            <div className="flex items-center gap-3 md:gap-4 animate-fadeIn">
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                Halo, <span className="font-bold text-blue-600">{userName}</span>
              </span>

              {userRole === 'pemilik' && (
                <button
                  onClick={() => onNavigate('kelola-kos')}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full font-bold transition-colors text-xs md:text-sm shadow-sm flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  Kelola Kos
                </button>
              )}

              <button
                onClick={() => onNavigate('profil')}
                className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center hover:bg-blue-200 transition overflow-hidden border-2 border-blue-200"
              >
                {userAvatar ? (
                  <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                ) : (
                  userName.charAt(0).toUpperCase()
                )}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={() => onNavigate('login')}
                className="text-gray-700 font-medium hover:text-blue-600 transition px-2 py-1 md:px-4 md:py-2 text-xs md:text-sm"
              >
                Masuk
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 md:px-6 md:py-2.5 rounded-full font-bold transition-colors text-xs md:text-sm shadow-sm"
              >
                Daftar
              </button>
            </div>
          )}
        </div>

        <nav className="order-3 md:order-2 w-full md:w-auto mt-2 md:mt-0 flex justify-evenly md:justify-center gap-2 md:gap-16 lg:gap-24 font-medium text-gray-500">
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('search'); }} className="flex flex-col items-center hover:text-blue-600 group cursor-pointer">
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

      {/* === SEARCH PANEL === */}
      {showSearchPanel && (
        <div className="sticky top-[96px] z-40 bg-white border-b border-gray-200 shadow-lg px-4 py-5 md:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-50 p-2 md:p-3 rounded-full flex items-center border border-gray-200 w-full mb-4 focus-within:ring-2 ring-blue-100 transition-all">
              <img src={IconCari} alt="" className="ml-3 w-5 h-5 opacity-60" />
              <input type="text" placeholder="Cari lokasi, kampus, nama kos..." className="w-full px-4 py-1.5 outline-none text-sm md:text-base bg-transparent text-gray-800" />
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-bold transition-colors hidden md:block text-sm">Cari</button>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => toggleDropdown('gender')} className={`px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold border transition-colors ${filterGenders.length > 0 || openDropdown === 'gender' ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                  {filterGenders.length > 0 ? `Tipe (${filterGenders.length}) ▾` : 'Tipe Kos ▾'}
                </button>
                {openDropdown === 'gender' && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl p-3 z-50">
                    {['Pria', 'Wanita', 'Campur'].map(g => (
                      <label key={g} className="flex items-center space-x-3 py-1.5 px-2 hover:bg-blue-50 rounded-lg cursor-pointer">
                        <input type="checkbox" checked={filterGenders.includes(g)} onChange={() => toggleGender(g)} className="w-4 h-4 rounded text-blue-600 border-gray-300" />
                        <span className="text-sm text-gray-700">{g}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => toggleDropdown('price')} className={`px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold border transition-colors ${(minPrice || maxPrice) || openDropdown === 'price' ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                  Harga ▾
                </button>
                {openDropdown === 'price' && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-100 rounded-xl shadow-xl p-4 z-50 flex flex-col gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Min (Rp)</label>
                      <input type="number" placeholder="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Max (Rp)</label>
                      <input type="number" placeholder="Contoh: 2000000" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                    </div>
                  </div>
                )}
              </div>

              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => toggleDropdown('facilities')} className={`px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold border transition-colors ${filterFacilities.length > 0 || openDropdown === 'facilities' ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                  {filterFacilities.length > 0 ? `Fasilitas (${filterFacilities.length}) ▾` : 'Fasilitas ▾'}
                </button>
                {openDropdown === 'facilities' && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl p-3 z-50 max-h-60 overflow-y-auto">
                    {listFasilitas.map(f => (
                      <label key={f} className="flex items-center space-x-3 py-1.5 px-2 hover:bg-blue-50 rounded-lg cursor-pointer">
                        <input type="checkbox" checked={filterFacilities.includes(f)} onChange={() => toggleFacility(f)} className="w-4 h-4 rounded text-blue-600 border-gray-300" />
                        <span className="text-sm text-gray-700">{f}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={() => setIsAvailable(v => !v)} className={`px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold border transition-colors shadow-sm ${isAvailable ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                Tersedia
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === GALERI FOTO === */}
      <div className="w-full max-w-5xl mx-auto bg-white mt-1">
        <div
          className="w-full h-56 md:h-80 overflow-hidden cursor-zoom-in relative group"
          onClick={() => openLightbox(0)}
        >
          <img src={mainImage} alt={kos.kos_name} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 text-white text-xs px-3 py-1.5 rounded-full">
              Lihat semua foto
            </span>
          </div>
        </div>

        <div className="flex w-full h-16 md:h-24">
          {[0, 1, 2, 3].map((slotIndex) => {
            const imgUrl = subImages[slotIndex];
            const lightboxIndex = slotIndex + 1;

            if (!imgUrl) {
              return <div key={slotIndex} className="w-1/4 h-full bg-gray-100 border-r border-white" />;
            }

            const isLastSlot = slotIndex === 3 && subImages.length > 4;

            return (
              <div
                key={slotIndex}
                className="w-1/4 h-full relative cursor-pointer overflow-hidden border-r border-white group"
                onClick={() => openLightbox(lightboxIndex)}
              >
                <img
                  src={imgUrl}
                  alt={`Foto ${lightboxIndex + 1}`}
                  className="w-full h-full object-cover brightness-75 group-hover:brightness-100 transition-all"
                />
                {isLastSlot && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-sm md:text-base">
                    +{subImages.length - 3} Foto
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <main className="max-w-5xl mx-auto p-4 md:p-6">

        {/* === INFO DASAR === */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold">{kos.kos_name}</h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-blue-100 text-blue-700">
              {kos.gender_type}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${kos.available_unit > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
              {kos.available_unit > 0 ? `${kos.available_unit} Kamar Tersedia` : 'Penuh'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm mb-2">
            <StarRating count={4} max={5} />
            <span className="font-bold">4.8</span>
            <span className="text-gray-400">(12 Ulasan)</span>
          </div>

          <p className="text-gray-500 text-sm mb-4">{kos.address}, {kos.city}</p>
          <div className="text-2xl font-black text-blue-600">
            Rp {Number(kos.price).toLocaleString('id-ID')}
            <span className="text-sm text-gray-400 font-normal">/bulan</span>
          </div>
        </div>

        {/* === TOMBOL WISHLIST === */}
        <button
          onClick={async () => {
            if (wishlistLoading) return;
            const token = localStorage.getItem('token');
            if (!token) {
              alert('Silakan masuk terlebih dahulu untuk menyimpan wishlist.');
              return;
            }
            setWishlistLoading(true);
            const prev = isWishlisted;
            setIsWishlisted(v => !v);
            try {
              const res = await fetch(`${API_BASE}/kos/wishlist`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ kos_id: kosId }),
              });
              const data = await res.json();
              if (data.success) {
                setIsWishlisted(data.is_wishlisted);
              } else {
                setIsWishlisted(prev);
              }
            } catch {
              setIsWishlisted(prev);
            } finally {
              setWishlistLoading(false);
            }
          }}
          disabled={wishlistLoading}
          className={`w-full py-3.5 rounded-xl font-bold mb-8 border transition-all disabled:opacity-60 ${isWishlisted ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
        >
          {wishlistLoading ? '⏳ Menyimpan...' : isWishlisted ? '❤️ Ditambahkan ke Wishlist' : '🤍 Masukkan ke Daftar Wishlist'}
        </button>

        {/* === DESKRIPSI === */}
        <div className="mb-8 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-3">Deskripsi</h2>
          <div className="text-sm md:text-base text-gray-600 space-y-3 leading-relaxed">
            {kos.description
              ? <p>{kos.description}</p>
              : <p className="text-gray-400 italic">Belum ada deskripsi dari pemilik.</p>
            }
            <p>
              <strong>Lokasi:</strong> {kos.address}, {kos.city}
              {kos.latitude && kos.longitude && (
                <span className="text-gray-400 text-xs ml-1">({kos.latitude}, {kos.longitude})</span>
              )}
            </p>
          </div>
        </div>

        {/* === PETA LOKASI === */}
        {kos.latitude && kos.longitude && (
          <section ref={mapSectionRef} className="mb-8 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 scroll-mt-24">
            <style>{leafletFixStyle}</style>
            <h2 className="text-lg font-bold mb-3">Lokasi di Peta</h2>
            <div className="relative w-full rounded-xl border border-gray-200 overflow-hidden" style={{ height: '320px' }}>
              {/* Peta selalu dirender agar tidak muncul blank */}
              <MapContainer
                key={`${kos.latitude}-${kos.longitude}`}
                center={[parseFloat(kos.latitude), parseFloat(kos.longitude)]}
                zoom={16}
                style={{ width: '100%', height: '100%', borderRadius: '0.75rem' }}
                scrollWheelZoom={false}
                zoomControl={isLoggedIn}
                dragging={isLoggedIn}
                doubleClickZoom={isLoggedIn}
                keyboard={isLoggedIn}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker
                  position={[parseFloat(kos.latitude), parseFloat(kos.longitude)]}
                  icon={redIcon}
                >
                  <Popup>{kos.kos_name}</Popup>
                </Marker>
              </MapContainer>

              {/* Overlay blur + CTA jika belum login */}
              {!isLoggedIn && (
                <div className="absolute inset-0 z-[999] flex flex-col items-center justify-center backdrop-blur-sm bg-white/60 rounded-xl">
                  <div className="bg-white border border-gray-200 shadow-lg rounded-2xl px-6 py-5 flex flex-col items-center gap-3 max-w-xs text-center">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0-1.657 1.343-3 3-3s3 1.343 3 3-1.343 3-3 3-3-1.343-3-3z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">Masuk untuk melihat lokasi</p>
                      <p className="text-xs text-gray-500 mt-1">Lokasi lengkap hanya tersedia untuk pengguna yang sudah masuk.</p>
                    </div>
                    <button
                      onClick={() => onNavigate('login')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 rounded-xl transition-all active:scale-95"
                    >
                      Masuk Sekarang
                    </button>
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-2 font-medium">
              {kos.address}, {kos.city}
            </p>
          </section>
        )}

        {/* === FASILITAS DINAMIS === */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4">Fasilitas Utama</h2>
          <div className="flex flex-wrap gap-3">
            {kos.facilities && kos.facilities.length > 0
              ? kos.facilities.map((fac) => (
                  <ItemBubble
                    key={fac.facility_id}
                    iconUrl={fac.icon_url}
                    label={fac.facility_name}
                    variant="facility"
                  />
                ))
              : <p className="text-sm text-gray-400">Belum ada informasi fasilitas.</p>
            }
          </div>
        </section>

        {/* === PERATURAN DINAMIS === */}
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4">Peraturan Kos</h2>
          <div className="flex flex-wrap gap-3">
            {kos.rules && kos.rules.length > 0
              ? kos.rules.map((rule) => (
                  <ItemBubble
                    key={rule.rule_id}
                    iconUrl={rule.icon_url}
                    label={rule.rule_name}
                    variant="rule"
                  />
                ))
              : <p className="text-sm text-gray-400">Belum ada peraturan khusus.</p>
            }
          </div>
        </section>

        {/* === ULASAN — sistem review fungsional === */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm mb-10">
          <h2 className="text-lg font-bold mb-1">Ulasan</h2>

          {/* Ringkasan rating */}
          {reviews.length > 0 && (
            <div className="flex items-center gap-3 mb-5">
              <span className="text-4xl font-black text-blue-600">
                {(reviews.reduce((s, r) => s + parseFloat(r.rating), 0) / reviews.length).toFixed(1)}
              </span>
              <div>
                <StarRating
                  count={Math.round(reviews.reduce((s, r) => s + parseFloat(r.rating), 0) / reviews.length)}
                  max={5}
                />
                <p className="text-xs text-gray-400 mt-0.5">{reviews.length} ulasan</p>
              </div>
            </div>
          )}

          {/* ── Daftar review ── */}
          {reviewsLoading ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">Belum ada ulasan untuk kos ini.</p>
          ) : (
            <div className="space-y-6 mb-6">
              {reviews.map((review) => (
                <div key={review.reviewid} className="border-b border-gray-100 pb-5 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                        {(review.user?.user_name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm">{review.user?.user_name || 'Pengguna'}</h3>
                          <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">Penyewa</span>
                        </div>
                        <StarRating count={Math.round(parseFloat(review.rating))} max={5} />
                      </div>
                    </div>
                    <span className="text-[11px] text-gray-400 font-medium flex-shrink-0">
                      {new Date(review.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-3 leading-relaxed">{review.comment}</p>

                  {/* Foto review */}
                  {review.photos && review.photos.length > 0 && (
  <div className="flex gap-2 mb-3 flex-wrap">
    {review.photos.map((photo, idx) => {
      // 1. Pastikan URL selalu menggunakan absolute URL backend
      const imageUrl = photo.photo_url.startsWith('http') 
        ? photo.photo_url 
        : `${import.meta.env.VITE_APP_BASE_URL}${photo.photo_url}`;

      return (
        <img
          key={photo.photo_id}
          src={imageUrl}
          alt={`Foto ulasan ${idx + 1}`}
          referrerPolicy="no-referrer" // Tambahkan ini sebagai pengaman
          className="w-20 h-16 rounded-lg object-cover border cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => setReviewLightbox({
            open: true,
            // 2. Pastikan array untuk lightbox juga menggunakan absolute URL
            images: review.photos.map(p => p.photo_url.startsWith('http') ? p.photo_url : `${import.meta.env.VITE_APP_BASE_URL}${p.photo_url}`),
            index: idx,
          })}
        />
      );
    })}
  </div>
)}

                  {/* Balasan pemilik */}
                  {review.owner_reply && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2">
                      <p className="text-xs font-bold text-amber-700 mb-1">Tanggapan Pemilik Kos</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{review.owner_reply}</p>
                      {review.owner_replied_at && (
                        <p className="text-[10px] text-gray-400 mt-1">
                          {new Date(review.owner_replied_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Tombol balas — hanya pemilik kos yang bisa */}
                  {userRole === 'pemilik' && !review.owner_reply && (
                    <div className="mt-2">
                      {replyTarget === review.reviewid ? (
                        <div className="mt-2">
                          <textarea
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            placeholder="Tulis tanggapan kamu sebagai pemilik kos..."
                            className="w-full border border-gray-200 rounded-lg p-3 text-sm outline-none focus:border-blue-400 resize-none"
                            rows={3}
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleSubmitReply(review.reviewid)}
                              disabled={replySubmitting || !replyText.trim()}
                              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg disabled:opacity-50"
                            >
                              {replySubmitting ? 'Mengirim...' : 'Kirim Balasan'}
                            </button>
                            <button
                              onClick={() => { setReplyTarget(null); setReplyText(''); }}
                              className="text-gray-500 text-xs font-semibold px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                            >
                              Batal
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setReplyTarget(review.reviewid)}
                          className="text-xs text-blue-600 font-semibold hover:underline mt-1"
                        >
                          + Balas ulasan ini
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── Form tambah review — hanya untuk penyewa (role bukan pemilik) ── */}
          {isLoggedIn && userRole !== 'pemilik' ? (
            <div className="border-t border-gray-100 pt-5">
              <h3 className="font-bold text-sm mb-3">Tulis Ulasan Kamu</h3>

              {/* Star selector */}
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onMouseEnter={() => setReviewHover(star)}
                    onMouseLeave={() => setReviewHover(0)}
                    onClick={() => setReviewRating(star)}
                    className="focus:outline-none"
                  >
                    <svg
                      className={`w-7 h-7 transition-colors ${star <= (reviewHover || reviewRating) ? 'text-orange-400' : 'text-gray-200'}`}
                      fill="currentColor" viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
                {reviewRating > 0 && (
                  <span className="text-sm text-gray-500 ml-1">
                    {['', 'Sangat Buruk', 'Kurang', 'Cukup', 'Bagus', 'Sangat Bagus'][reviewRating]}
                  </span>
                )}
              </div>

              {/* Textarea komentar */}
              <textarea
                value={reviewComment}
                onChange={e => setReviewComment(e.target.value)}
                placeholder="Ceritakan pengalamanmu tinggal di kos ini..."
                className="w-full border border-gray-200 rounded-xl p-3.5 text-sm outline-none focus:border-blue-400 resize-none mb-3"
                rows={4}
              />

              {/* Upload foto */}
              <div className="mb-3">
                <div className="flex flex-wrap gap-2 mb-2">
                  {reviewPhotosPrev.map((url, i) => (
                    <div key={i} className="relative w-20 h-16">
                      <img src={url} alt="" className="w-full h-full object-cover rounded-lg border" />
                      <button
                        onClick={() => removePhoto(i)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center leading-none hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {reviewPhotos.length < 5 && (
                    <button
                      onClick={() => reviewPhotoRef.current?.click()}
                      className="w-20 h-16 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-400 transition-colors text-xs gap-1"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                      Foto
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-gray-400">Maks. 5 foto (opsional)</p>
                <input
                  ref={reviewPhotoRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>

              {reviewError && (
                <p className="text-red-500 text-xs mb-2 font-medium">{reviewError}</p>
              )}

              <button
                onClick={handleSubmitReview}
                disabled={reviewSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 active:scale-95"
              >
                {reviewSubmitting ? 'Mengirim...' : 'Kirim Ulasan'}
              </button>
            </div>
          ) : !isLoggedIn ? (
            <div className="border-t border-gray-100 pt-4 text-center">
              <p className="text-sm text-gray-500 mb-2">Masuk untuk menulis ulasan.</p>
              <button
                onClick={() => onNavigate('login')}
                className="bg-blue-600 text-white text-sm font-bold px-6 py-2 rounded-xl hover:bg-blue-700 transition"
              >
                Masuk
              </button>
            </div>
          ) : null}
        </div>

        {/* Lightbox foto review */}
        {reviewLightbox.open && (
          <ImageLightbox
            images={reviewLightbox.images}
            startIndex={reviewLightbox.index}
            onClose={() => setReviewLightbox({ open: false, images: [], index: 0 })}
          />
        )}

      </main>

      {/* === STICKY FOOTER === */}
      <div className="fixed bottom-0 w-full bg-white border-t p-3 z-50">
        <div className="max-w-5xl mx-auto flex gap-3">
          <button
            onClick={() => {
              if (!isLoggedIn) {
                onNavigate('login');
                return;
              }
              if (mapSectionRef.current) {
                mapSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            disabled={isLoggedIn && (!kos.latitude || !kos.longitude)}
            className={`w-1/2 font-bold py-2.5 rounded-xl transition-transform active:scale-95 flex items-center justify-center gap-2 ${
              !isLoggedIn
                ? 'border-2 border-gray-200 text-gray-400 bg-gray-100 cursor-pointer'
                : 'border-2 border-blue-600 text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
          >
            {!isLoggedIn ? (
              <>
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                Lihat Lokasi
              </>
            ) : (
              'Lihat Lokasi'
            )}
          </button>
          <button
            onClick={() => {
              if (!isLoggedIn) {
                onNavigate('login');
                return;
              }
              const raw = kos.whatsapp_contact || '';
              if (!raw) {
                alert('Nomor WhatsApp pemilik belum tersedia.');
                return;
              }
              const digits = raw.replace(/\D/g, '');
              const normalized = digits.startsWith('0')
                ? '62' + digits.slice(1)
                : digits;
              window.open(`https://wa.me/${normalized}`, '_blank');
            }}
            disabled={isLoggedIn && !kos.whatsapp_contact}
            className={`w-1/2 font-bold py-2.5 rounded-xl transition-all active:scale-95 shadow-sm flex items-center justify-center gap-2 ${
              !isLoggedIn
                ? 'bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-pointer'
                : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
          >
            {!isLoggedIn ? (
              <>
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                Hubungi Pemilik
              </>
            ) : (
              'Hubungi Pemilik'
            )}
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════
          SETTING SIDEBAR — identik dengan UserWishlist.jsx
      ════════════════════════════════════════════════════════ */}
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
                    <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
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
                { section: 'Profil',    items: [{ label: 'Ubah Profil', sub: 'Nama, foto, dan info pribadi', key: 'profil' }] },
                { section: 'Riwayat',  items: [{ label: 'Riwayat Pencarian', key: 'riwayat' }] },
                { section: 'Keamanan', items: [{ label: 'Ubah Password', key: 'profil' }] },
                { section: 'Bantuan',  items: [{ label: 'Tanya KosFinder+', key: 'bantuan' }] },
                { section: 'Lainnya',  items: [
                  { label: 'Tentang Kami',      key: 'tentang'   },
                  { label: 'Kebijakan Privasi',  key: 'kebijakan' },
                  { label: 'Kredit & Atribut',   key: 'kredit'    },
                ]},
              ].map(({ section, items }) => (
                <div key={section}>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-1 mb-2">{section}</p>
                  <div className="bg-white rounded-2xl overflow-hidden divide-y divide-gray-100 shadow-sm">
                    {items.map(item => (
                      <button key={item.key} onClick={() => { setSettingOpen(false); onNavigate(item.key); }} className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition text-left">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                          {item.sub && <p className="text-[11px] text-gray-400">{item.sub}</p>}
                        </div>
                        <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
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
          to   { transform: translateX(0);    opacity: 1; }
        }
        .animate-slideInRight {
          animation: slideInRight 0.25s cubic-bezier(0.32,0.72,0,1) forwards;
        }
      `}</style>
    </div>
  );
}
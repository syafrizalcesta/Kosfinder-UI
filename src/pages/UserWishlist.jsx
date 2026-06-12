import { useState, useEffect } from 'react';
import LogoKosfinder from '../assets/Logo-Kosfinder.svg';
import IconCari from '../assets/material-symbols-light_search.svg';
import IconWishlist from '../assets/Icon-Wishlist.svg';
import IconSetting from '../assets/mdi-light_settings.svg';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function UserWishlist({ onNavigateDetail, onNavigate }) {

  // ── Auth state (identik dengan Home) ──────────────────────────────────
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName,   setUserName]   = useState('');
  const [userRole,   setUserRole]   = useState('');
  const [userAvatar, setUserAvatar] = useState(null);

  // ── Setting sidebar (identik dengan Home) ─────────────────────────────
  const [settingOpen, setSettingOpen] = useState(false);

  // ── Wishlist data ──────────────────────────────────────────────────────
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading,     setIsLoading]     = useState(true);
  const [error,         setError]         = useState(null);
  const [removingId,    setRemovingId]    = useState(null);

  // ── Mount: cek login + fetch wishlist ─────────────────────────────────
  useEffect(() => {
    const token   = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        setIsLoggedIn(true);
        const user = JSON.parse(userStr);
        setUserName(user.user_name.split(' ')[0]);
        setUserRole(user.role);
        setUserAvatar(user.avatar_url || null);
      } catch { /* JSON malformed */ }
    }

    if (!token) {
      setIsLoading(false);
      return;
    }

    fetch(`${API_BASE}/kos/wishlist`, {
      headers: {
        'Accept':        'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP_${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setWishlistItems(data.data || []);
        } else {
          setError(data.message || 'Gagal memuat data wishlist.');
        }
        setIsLoading(false);
      })
      .catch((err) => {
        const msg = err.message || '';
        if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
          setError('Tidak dapat terhubung ke server. Pastikan backend Laravel sudah berjalan (php artisan serve).');
        } else if (msg.includes('HTTP_401')) {
          setError('Sesi login sudah habis. Silakan masuk kembali.');
        } else if (msg.includes('HTTP_404')) {
          setError('Endpoint GET /api/kos/wishlist belum ada di Laravel. Tambahkan route-nya terlebih dahulu.');
        } else {
          setError(`Gagal: ${msg}`);
        }
        setIsLoading(false);
      });
  }, []);

  // ── Logout (identik dengan Home) ──────────────────────────────────────
  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    try {
      if (token) {
        await fetch(`${API_BASE}/logout`, {
          method:  'POST',
          headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
        });
      }
    } catch (e) {
      console.error('Gagal logout:', e);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsLoggedIn(false);
      setUserName('');
      window.location.reload();
    }
  };

  // ── Hapus dari wishlist (toggle, optimistic) ──────────────────────────
  const handleRemove = async (kosId) => {
    if (removingId) return;
    const token = localStorage.getItem('token');
    setRemovingId(kosId);
    const prev = [...wishlistItems];
    setWishlistItems(items => items.filter(k => k.kos_id !== kosId));
    try {
      const res  = await fetch(`${API_BASE}/kos/wishlist`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body:    JSON.stringify({ kos_id: kosId }),
      });
      const data = await res.json();
      if (!data.success) setWishlistItems(prev);
    } catch {
      setWishlistItems(prev);
    } finally {
      setRemovingId(null);
    }
  };

  // ─────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col font-sans">

      {/* ════════════════════════════════════════════════════════
          HEADER — identik 100% dengan Home.jsx
      ════════════════════════════════════════════════════════ */}
      <header className="bg-white px-4 pt-3 pb-1 md:px-8 md:py-4 flex flex-wrap content-start items-center justify-between sticky top-0 z-30 shadow-sm">

        {/* Logo */}
        <div className="order-1 flex justify-start md:flex-1">
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} className="hover:opacity-80 transition-opacity">
            <img src={LogoKosfinder} alt="Logo" className="h-8 md:h-10 w-auto" />
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
                  <svg className="w-4 h-4 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
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
              {/* Tombol Logout dihapus dari header */}
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

        {/* Nav bawah */}
        <nav className="order-3 md:order-2 w-full md:w-auto mt-2 md:mt-0 flex justify-evenly md:justify-center gap-2 md:gap-16 lg:gap-24 font-medium text-gray-500">

          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('search'); }} className="flex flex-col items-center hover:text-blue-600 group cursor-pointer">
            <img src={IconCari} className="w-5 h-5 md:w-6 md:h-6 opacity-70 group-hover:opacity-100 transition-opacity" alt="Cari" />
            <span className="mt-1 text-xs md:text-sm">Cari Kos</span>
          </a>

          {/* Wishlist — aktif */}
          <div className="flex flex-col items-center text-blue-600 cursor-default select-none">
            <img src={IconWishlist} className="w-5 h-5 md:w-6 md:h-6" alt="Wishlist" />
            <span className="mt-1 text-xs md:text-sm font-bold">Wishlist</span>
          </div>

          <a href="#" onClick={(e) => { e.preventDefault(); isLoggedIn ? onNavigate('riwayat') : onNavigate('login'); }} className={`flex flex-col items-center group cursor-pointer transition-colors ${isLoggedIn ? 'hover:text-blue-600' : 'opacity-40 hover:opacity-70'}`}>
            <svg className={`w-5 h-5 md:w-6 md:h-6 transition-opacity ${isLoggedIn ? 'opacity-70 group-hover:opacity-100' : 'opacity-50'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="mt-1 text-xs md:text-sm">Riwayat</span>
          </a>

          <button onClick={() => setSettingOpen(true)} className="flex flex-col items-center hover:text-blue-600 group cursor-pointer bg-transparent border-none outline-none">
            <img src={IconSetting} className="w-5 h-5 md:w-6 md:h-6 opacity-70 group-hover:opacity-100 transition-opacity" alt="Setting" />
            <span className="mt-1 text-xs md:text-sm">Setting</span>
          </button>
        </nav>
      </header>

      {/* ════════════════════════════════════════════════════════
          KONTEN UTAMA
      ════════════════════════════════════════════════════════ */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 mt-8 mb-20">

        <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-8 tracking-tight">
          Wishlist Kos
        </h1>

        {/* Belum login */}
        {!isLoggedIn && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <p className="text-gray-700 font-bold text-base mb-1">Masuk untuk melihat wishlist</p>
            <p className="text-gray-400 text-xs mb-6">Simpan kos favoritmu agar mudah ditemukan kembali</p>
            <button onClick={() => onNavigate('login')} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-full font-bold text-sm transition-colors shadow-sm">
              Masuk Sekarang
            </button>
          </div>
        )}

        {/* Loading */}
        {isLoggedIn && isLoading && (
          <div className="flex items-center justify-center py-24 gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            <span className="text-gray-500 font-medium text-sm">Memuat wishlist...</span>
          </div>
        )}

        {/* Error */}
        {isLoggedIn && !isLoading && error && (
          <div className="flex flex-col items-center justify-center py-24 text-center max-w-md mx-auto">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <p className="text-gray-700 font-bold text-sm mb-2">Gagal memuat wishlist</p>
            <p className="text-gray-400 text-xs mb-5 leading-relaxed">{error}</p>
            <button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-bold text-sm transition-colors shadow-sm">
              Coba Lagi
            </button>
          </div>
        )}

        {/* Wishlist kosong */}
        {isLoggedIn && !isLoading && !error && wishlistItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <p className="text-gray-700 font-bold text-base mb-1">Wishlist masih kosong</p>
            <p className="text-gray-400 text-xs mb-6">Tap ikon hati di halaman detail kos untuk menyimpannya</p>
            <button onClick={() => onNavigate('search')} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-full font-bold text-sm transition-colors shadow-sm">
              Mulai Cari Kos
            </button>
          </div>
        )}

        {/* Grid kartu */}
        {isLoggedIn && !isLoading && !error && wishlistItems.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {wishlistItems.map((kos) => (
              <div key={kos.kos_id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group">
                <div className="w-full h-36 sm:h-40 overflow-hidden relative cursor-pointer" onClick={() => onNavigateDetail(kos.kos_id)}>
                  <img
                    src={kos.image_url}
                    alt={kos.kos_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {parseInt(kos.available_unit ?? 0) === 0 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Penuh</span>
                    </div>
                  )}
                  {/* Tombol hapus wishlist */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemove(kos.kos_id); }}
                    disabled={removingId === kos.kos_id}
                    title="Hapus dari Wishlist"
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm border border-red-100 text-red-400 hover:bg-red-50 hover:text-red-600 transition disabled:opacity-50"
                  >
                    {removingId === kos.kos_id
                      ? <span className="text-[9px] font-bold">...</span>
                      : <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                    }
                  </button>
                </div>
                <div className="p-3 flex flex-col gap-1.5 cursor-pointer" onClick={() => onNavigateDetail(kos.kos_id)}>
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

      {/* ════════════════════════════════════════════════════════
          SETTING SIDEBAR — identik dengan Home.jsx
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
                  { label: 'Tentang Kami',     key: 'tentang'   },
                  { label: 'Kebijakan Privasi', key: 'kebijakan' },
                  { label: 'Kredit & Atribut',  key: 'kredit'    },
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
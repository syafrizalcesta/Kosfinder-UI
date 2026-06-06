import { useState, useEffect } from 'react';
import Home from './pages/Home';
import SearchPage from './pages/SearchPage';
import AdminDashboard from './pages/Admin/AdminDashboard';
import UserWishlist from './pages/UserWishlist';
import DetailKos from './pages/DetailKos'; 
import LoginPencari from './pages/LoginPencari'; 
import RegisterPencari from './pages/Register'; 
import Profil from './pages/Profil';
import KelolaKos from './pages/KelolaKos';
import Riwayat from './pages/Riwayat';
import DashboardAdminVerifikasi from './pages/Admin/DashboardAdmin';

// ─── Helper: ambil role user dari localStorage ────────────────────────────────
const getUserRole = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.role || null;
  } catch {
    return null;
  }
};

// ─── Guard: halaman yang hanya boleh diakses role tertentu ───────────────────
const PAGE_GUARDS = {
  'verifikasi-admin': ['admin'],
  'dashboardAdmin':   ['pemilik', 'admin'],
  'dashboard':        ['pemilik', 'admin'],
  'kelola-kos':       ['pemilik', 'admin'],
  'wishlist':         ['pencari', 'pemilik', 'admin'],
  'riwayat':          ['pencari', 'pemilik', 'admin'],
  'profil':           ['pencari', 'pemilik', 'admin'],
};

export default function App() {
  // Persist halaman terakhir: ambil dari localStorage saat pertama load
  const [currentPage, setCurrentPage] = useState(() => {
    return localStorage.getItem('currentPage') || 'home';
  });
  const [searchParams, setSearchParams] = useState(null);
  const [wishlistItems, setWishlistItems] = useState([]);

  useEffect(() => {
    const handlePopState = (e) => {
      const page = e.state?.page || 'home';
      setCurrentPage(page);
      localStorage.setItem('currentPage', page);
    };
    window.addEventListener('popstate', handlePopState);
    // Jangan replace state ke 'home' — biarkan halaman terakhir tetap
    const saved = localStorage.getItem('currentPage') || 'home';
    window.history.replaceState({ page: saved }, '', `/${saved === 'home' ? '' : saved}`);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (page, params = null) => {
    // Cek guard sebelum navigasi
    const allowed = PAGE_GUARDS[page];
    if (allowed) {
      const role = getUserRole();
      if (!role || !allowed.includes(role)) {
        // Tidak punya akses → arahkan ke login
        window.history.pushState({ page: 'login' }, '', '/login');
        setCurrentPage('login');
        localStorage.setItem('currentPage', 'login');
        return;
      }
    }
    window.history.pushState({ page }, '', `/${page === 'home' ? '' : page}`);
    setCurrentPage(page);
    localStorage.setItem('currentPage', page); // ← persist
    if (params) setSearchParams(params); 
    window.scrollTo(0, 0);
  };

  const handleHomeNavigate = (id, params) => {
    if (id === 'search') navigateTo('search', params);
    else if (id === 'register') navigateTo('register');
    else if (id === 'login') navigateTo('login');
    else if (id === 'wishlist') navigateTo('wishlist');
    else if (id === 'riwayat') navigateTo('riwayat');
    else if (id === 'profil') navigateTo('profil');
    else if (id === 'kelola-kos') navigateTo('kelola-kos');
    else if (id === 'ubah-password') navigateTo('ubah-password');
    else if (id === 'bantuan') navigateTo('bantuan');
    else if (id === 'tentang') navigateTo('tentang');
    else if (id === 'kebijakan') navigateTo('kebijakan');
    else if (id === 'kredit') navigateTo('kredit');
    else navigateTo(id.startsWith('detail-') ? id : `detail-${id}`);
  };

  const renderPage = () => {
    // Guard: cek izin akses halaman saat render (termasuk saat refresh/URL langsung)
    const allowed = PAGE_GUARDS[currentPage];
    if (allowed) {
      const role = getUserRole();
      if (!role || !allowed.includes(role)) {
        // Hapus sisa sesi jika token tidak valid / role tidak sesuai
        localStorage.removeItem('currentPage');
        return (
          <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center gap-4">
            <p className="text-2xl font-extrabold text-red-500">403 — Akses Ditolak</p>
            <p className="text-gray-500 text-sm">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
            <button
              onClick={() => { setCurrentPage('login'); localStorage.setItem('currentPage', 'login'); }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-bold text-sm transition-colors shadow-sm"
            >
              Ke Halaman Login
            </button>
          </div>
        );
      }
    }

    if (currentPage.startsWith('detail-')) {
      let kosId = currentPage.replace('detail-', '');
      if (kosId.startsWith('detail-')) {
        kosId = kosId.replace('detail-', '');
      }
      return (
        <DetailKos 
          kosId={kosId} 
          onBack={() => navigateTo('home')} 
          onNavigate={handleHomeNavigate}
          wishlistItems={wishlistItems}
          setWishlistItems={setWishlistItems}
        />
      );
    }

    switch (currentPage) {
      case 'home': 
        return <Home onNavigate={handleHomeNavigate} />;
      
      case 'search':
        return (
          <SearchPage 
            initialParams={searchParams} 
            onNavigate={(id, params) => {
              if (id === 'wishlist') navigateTo('wishlist'); 
              else if (id === 'register') navigateTo('register');
              else if (id === 'login') navigateTo('login');
              else navigateTo(id.startsWith('detail-') ? id : `detail-${id}`); 
            }} 
            onNavigateBack={() => navigateTo('home')} 
          />
        );
        
      case 'login': 
        return (
          <LoginPencari 
            onNavigateBack={() => navigateTo('home')} 
            onNavigateToRegister={() => navigateTo('register')} 
            onLoginSuccess={() => { localStorage.setItem('currentPage', 'home'); navigateTo('home'); }}
            onLoginAsAdmin={() => navigateTo('verifikasi-admin')}
          />
        );

      case 'register':
        return (
          <RegisterPencari 
            onNavigateBack={() => navigateTo('login')} 
            onNavigateToLogin={() => navigateTo('login')} 
            onNavigate={handleHomeNavigate}
          />
        );

      case 'profil':
        return (
          <Profil 
            onNavigateBack={() => navigateTo('home')} 
          />
        );

      // ✅ Route admin yang benar — render AdminDashboard
      case 'dashboardAdmin':
        return (
          <AdminDashboard 
            onNavigateBack={() => navigateTo('home')} 
            onNavigateDetail={(id) => navigateTo(`detail-${id}`)} 
          />
        );

      case 'verifikasi-admin':
        return (
          <DashboardAdminVerifikasi />
        );
      // Legacy case 'dashboard' tetap dipertahankan untuk backward compat
      case 'dashboard': 
        return (
          <AdminDashboard 
            onNavigateBack={() => navigateTo('home')} 
            onNavigateDetail={(id) => navigateTo(`detail-${id}`)} 
          />
        );
      
      case 'kelola-kos': 
        return (
          <KelolaKos 
            onNavigateBack={() => navigateTo('home')} 
          />
        );

      case 'wishlist':
        return (
          <UserWishlist 
            wishlistItems={wishlistItems} 
            onNavigateDetail={(id) => navigateTo(`detail-${id}`)} 
            onNavigate={(id, params) => navigateTo(id, params)}
          />
        );

      case 'riwayat':
        return (
          <Riwayat 
            onNavigateDetail={(id) => navigateTo(`detail-${id}`)}
            onNavigate={(id, params) => navigateTo(id, params)}
            onSearch={(keyword) => navigateTo('search', { keyword })}
          />
        );

      case 'ubah-password':
      case 'bantuan':
      case 'tentang':
      case 'kebijakan':
      case 'kredit':
        return (
          <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center gap-4">
            <p className="text-gray-400 font-semibold text-sm capitalize">
              Halaman <span className="text-blue-600">{currentPage.replace(/-/g, ' ')}</span> belum tersedia
            </p>
            <button
              onClick={() => navigateTo('home')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-bold text-sm transition-colors shadow-sm"
            >
              Kembali ke Beranda
            </button>
          </div>
        );

      default: 
        return <Home onNavigate={(id) => navigateTo(`detail-${id}`)} />;
    } 
  };

  return <>{renderPage()}</>;
}
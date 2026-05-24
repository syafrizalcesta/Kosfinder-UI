import { useState, useEffect } from 'react';
import Home from './pages/Home';
import SearchPage from './pages/SearchPage';
import DetailKosMelati from './pages/DetailKosMelati';
import DetailKosPriaModern from './pages/DetailKosPriaModern';
import DetailKosExclusiveGebang from './pages/DetailKosExclusiveGebang';
import DetailKosPriaStayvie from './pages/DetailKosPriaStayvie';
import RegisterSelect from './pages/RegisterSelect';
import AdminDashboard from './pages/Admin/AdminDashboard';
import UserWishlist from './pages/UserWishlist';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [searchParams, setSearchParams] = useState(null); // Penyimpan data filter
  const [wishlistItems, setWishlistItems] = useState([]);

  useEffect(() => {
    const handlePopState = (e) => setCurrentPage(e.state?.page || 'home');
    window.addEventListener('popstate', handlePopState);
    window.history.replaceState({ page: 'home' }, '', '/');
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fungsi navigasi manual bawaan project kalian
  const navigateTo = (page, params = null) => {
    window.history.pushState({ page }, '', `/${page === 'home' ? '' : page}`);
    setCurrentPage(page);
    if (params) setSearchParams(params); 
    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home': 
        return <Home onNavigate={(id, params) => {
          if (id === 'search') {
            navigateTo('search', params);
          } else if (id === 'register') {
            navigateTo('register'); // <-- Kunci pemutus di sini! Dia langsung ke 'register' tanpa ditambah kata 'detail-'
          } else if (id === 'wishlist') { // <-- TAMBAHKAN BLOK BARU INI
              navigateTo('wishlist');       // Mengarahkan user ke halaman wishlist
          } else {
            navigateTo(`detail-${id}`);
          }
        }} />;
      
      case 'search':
        return <SearchPage 
          initialParams={searchParams} 
          onNavigate={(id, params) => {
            if (id === 'wishlist') {
              navigateTo('wishlist'); 
            } else if (id === 'register') {
              navigateTo('register');
            } else {
              navigateTo(`detail-${id}`); 
            }
          }} 
          onNavigateBack={() => navigateTo('home')} 
        />;

      case 'detail-1': 
        return (
          <DetailKosMelati 
            onNavigateBack={() => navigateTo('home')} 
            wishlistItems={wishlistItems}
            setWishlistItems={setWishlistItems} 
          />
        );
        
      case 'detail-2': 
        return (
          <DetailKosPriaModern 
            onNavigateBack={() => navigateTo('home')} 
            wishlistItems={wishlistItems}
            setWishlistItems={setWishlistItems} 
          />
        );
        
      case 'detail-3': 
        return (
          <DetailKosExclusiveGebang 
            onNavigateBack={() => navigateTo('home')} 
            wishlistItems={wishlistItems}
            setWishlistItems={setWishlistItems} 
          />
        );
        
      case 'detail-4': 
        return (
          <DetailKosPriaStayvie 
            onNavigateBack={() => navigateTo('home')} 
            wishlistItems={wishlistItems}
            setWishlistItems={setWishlistItems} 
          />
        );
      
      // Halaman Pilihan Register
      case 'register': 
        return (
          <RegisterSelect 
            onNavigateBack={() => navigateTo('home')} 
            onNavigateToDashboard={() => navigateTo('dashboard')} 
          />
        );

      // Halaman Admin Dashboard Pemilik Kos
      case 'dashboard': 
        return (
          <AdminDashboard 
            onNavigateBack={() => navigateTo('home')} 
            onNavigateDetail={(id) => navigateTo(`detail-${id}`)} // <-- Tambahkan baris pengoper kunci ini
          />
        );
      
      // Halaman Koleksi Wishlist User
      case 'wishlist':
        return (
          <UserWishlist 
            wishlistItems={wishlistItems} 
            onNavigateDetail={(id) => navigateTo(`detail-${id}`)} 
            onNavigate={(id, params) => navigateTo(id, params)}
          />
        );

      // Default (Jika halaman tidak ditemukan, balik ke Home)
      default: 
        return <Home onNavigate={(id) => navigateTo(`detail-${id}`)} />;
    }
  };

  return <>{renderPage()}</>;
}
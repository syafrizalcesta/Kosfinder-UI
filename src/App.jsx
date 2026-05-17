import { useState, useEffect } from 'react';
import Home from './pages/Home';
import SearchPage from './pages/SearchPage';
import DetailKosMelati from './pages/DetailKosMelati';
import DetailKosPriaModern from './pages/DetailKosPriaModern';
import DetailKosExclusiveGebang from './pages/DetailKosExclusiveGebang';
import DetailKosPriaStayvie from './pages/DetailKosPriaStayvie';
import DetailKos from './pages/DetailKos';

function App() {
  // State untuk melacak halaman ('home' atau 'detail')
  const [page, setPage] = useState('home');
  // State untuk menyimpan ID kos yang sedang dipilih
  const [selectedKosId, setSelectedKosId] = useState(null);

  // Fungsi saat kartu kos diklik
  const handleNavigateToDetail = (id) => {
    setSelectedKosId(id);
    setPage('detail');
  };

  // Fungsi untuk kembali ke halaman utama
  const handleBackToHome = () => {
    setPage('home');
    setSelectedKosId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {page === 'home' ? (
        <Home onNavigate={handleNavigateToDetail} />
      ) : (
        <DetailKos kosId={selectedKosId} onBack={handleBackToHome} />
      )}
    </div>
  );
}

export default App;

// export default function App() {
//   const [currentPage, setCurrentPage] = useState('home');
//   const [searchParams, setSearchParams] = useState(null); // 'Koper' penyimpan data filter

//   useEffect(() => {
//     const handlePopState = (e) => setCurrentPage(e.state?.page || 'home');
//     window.addEventListener('popstate', handlePopState);
//     window.history.replaceState({ page: 'home' }, '', '/');
//     return () => window.removeEventListener('popstate', handlePopState);
//   }, []);

//   // Fungsi navigasi yang sekarang bisa menerima parameter/data
//   const navigateTo = (page, params = null) => {
//     window.history.pushState({ page }, '', `/${page === 'home' ? '' : page}`);
//     setCurrentPage(page);
//     if (params) setSearchParams(params); // Simpan datanya ke state
//     window.scrollTo(0, 0);
//   };

//   const renderPage = () => {
//     switch (currentPage) {
//       case 'home': 
//         return <Home onNavigate={(id, params) => {
//           // Jika id-nya 'search', pindah ke halaman pencarian bawa paramater
//           if (id === 'search') navigateTo('search', params);
//           else navigateTo(`detail-${id}`);
//         }} />;
//       case 'search':
//         return <SearchPage 
//           initialParams={searchParams} 
//           onNavigate={(id) => navigateTo(`detail-${id}`)} 
//           onNavigateBack={() => navigateTo('home')} 
//         />;
//       case 'detail-1': return <DetailKosMelati onNavigateBack={() => navigateTo('home')} />;
//       case 'detail-2': return <DetailKosPriaModern onNavigateBack={() => navigateTo('home')} />;
//       case 'detail-3': return <DetailKosExclusiveGebang onNavigateBack={() => navigateTo('home')} />;
//       case 'detail-4': return <DetailKosPriaStayvie onNavigateBack={() => navigateTo('home')} />;
//       default: return <Home onNavigate={(id) => navigateTo(`detail-${id}`)} />;
//     }
//   };

//   return <>{renderPage()}</>;
// }
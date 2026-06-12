import { useState, useEffect } from 'react';
import LogoKosfinder from '../assets/Logo-Kosfinder.svg';
import BgHero from '../assets/landing kosfinder 1.svg'; 
import IconCari from '../assets/material-symbols-light_search.svg';
import IconWishlist from '../assets/tdesign_heart.svg';
import IconSetting from '../assets/mdi-light_settings.svg';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function Home({ onNavigate }) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [settingOpen, setSettingOpen] = useState(false);
  
  // STATE FILTER
  const [keyword, setKeyword] = useState(''); 
  const [isAvailable, setIsAvailable] = useState(false);
  const [genders, setGenders] = useState([]); 
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [facilities, setFacilities] = useState([]);
  const [rules, setRules] = useState([]);

  // STATE AUTENTIKASI
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userAvatar, setUserAvatar] = useState(null);

  const [listFasilitas, setListFasilitas] = useState([]);
  const [listPeraturan, setListPeraturan] = useState([]);

  const [kosList, setKosList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const toggleDropdown = (name) => setOpenDropdown(openDropdown === name ? null : name);
  const toggleGender = (item) => setGenders(prev => prev.includes(item) ? prev.filter(g => g !== item) : [...prev, item]);
  const toggleFacility = (item) => setFacilities(prev => prev.includes(item) ? prev.filter(f => f !== item) : [...prev, item]);
  const toggleRule = (item) => setRules(prev => prev.includes(item) ? prev.filter(r => r !== item) : [...prev, item]);

  // FUNGSI MEMICU PENCARIAN
  const handleSearch = () => {
    onNavigate('search', { keyword, genders, minPrice, maxPrice, facilities, rules, isAvailable });
  };

  const scrollToSearch = (e) => {
    e.preventDefault();
    const target = document.getElementById('area-pencarian');
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // FUNGSI LOGOUT
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

  // EFFECT FETCH KOS & CEK LOGIN
  useEffect(() => {
    // 1. Cek Token Login
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      setIsLoggedIn(true);
      const user = JSON.parse(userStr);
      setUserName(user.user_name.split(' ')[0]);
      setUserRole(user.role);
      setUserAvatar(user.avatar_url || null);
    }

    // 2. Fetch Data Kos, Fasilitas, dan Rules sekaligus
    const headers = { 'Accept': 'application/json' };
    Promise.all([
      fetch(`${API_BASE}/kos`, { headers }).then(r => r.json()),
      fetch(`${API_BASE}/facilities`, { headers }).then(r => r.json()),
      fetch(`${API_BASE}/rules`, { headers }).then(r => r.json()),
    ])
      .then(([kosData, facData, ruleData]) => {
        if (kosData.success)  setKosList(kosData.data);
        if (facData.success)  setListFasilitas(facData.data);
        if (ruleData.success) setListPeraturan(ruleData.data);
      })
      .catch((error) => console.error('Gagal mengambil data:', error))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
      <header className="bg-white px-4 pt-3 pb-1 md:px-8 md:py-4 flex flex-wrap content-start items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="order-1 flex justify-start md:flex-1">
          <a href="#" onClick={(e) => e.preventDefault()} className="hover:opacity-80 transition-opacity">
            <img src={LogoKosfinder} alt="Logo" className="h-8 md:h-10 w-auto" />
          </a>
        </div>
        
        {/* BAGIAN KANAN NAVBAR (DINAMIS) */}
        {/* PERUBAHAN: Hapus tombol Logout dari navbar, geser avatar & kelola kos */}
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
              {/* DIHAPUS: tombol Logout dari sini — gunakan sidebar Setting */}
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
          
          <a href="#area-pencarian" onClick={scrollToSearch} className="flex flex-col items-center hover:text-blue-600 group cursor-pointer">
            <img src={IconCari} className="w-5 h-5 md:w-6 md:h-6 opacity-70 group-hover:opacity-100 transition-opacity" alt="Cari" />
            <span className="mt-1 text-xs md:text-sm">Cari Kos</span>
          </a>
          
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('wishlist'); }} className={`flex flex-col items-center group cursor-pointer transition-colors ${isLoggedIn ? 'hover:text-blue-600' : 'opacity-40 cursor-not-allowed pointer-events-none'}`}>
            <img src={IconWishlist} className={`w-5 h-5 md:w-6 md:h-6 transition-opacity ${isLoggedIn ? 'opacity-70 group-hover:opacity-100' : 'opacity-50'}`} alt="Wishlist" />
            <span className="mt-1 text-xs md:text-sm">Wishlist</span>
          </a>
          
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('riwayat'); }} className={`flex flex-col items-center group cursor-pointer transition-colors ${isLoggedIn ? 'hover:text-blue-600' : 'opacity-40 cursor-not-allowed pointer-events-none'}`}>
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

      <main className="flex-1 w-full flex flex-col">
        <section className="relative w-full min-h-[500px] md:min-h-[600px] bg-cover bg-top bg-no-repeat flex items-center" style={{ backgroundImage: `url(${BgHero})` }}>
          <div className="absolute inset-0 bg-white/30"></div>
          <div className="absolute inset-x-0 bottom-0 h-32 md:h-48 bg-gradient-to-t from-[#F5F5F5] to-transparent"></div>

          <div className="relative z-10 w-full max-w-6xl mx-auto p-6 md:p-12">
            <div className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs md:text-sm font-bold mb-4 shadow-sm">✓ 100% Review Terverifikasi</div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight drop-shadow-md">Cari Kos <span className="text-blue-600">Tanpa Zonk</span></h1>
            <p className="text-gray-900 text-sm md:text-base max-w-lg mb-8 font-semibold drop-shadow-md">Review asli, Foto nyata, dan perbandingan kos dalam satu aplikasi. Platform pencarian kos terpercaya untuk mahasiswa.</p>

            <div id="area-pencarian" className="bg-white p-2 md:p-3 rounded-full shadow-lg flex items-center border border-gray-100 max-w-3xl relative z-20">
              <img src={IconCari} alt="Cari" className="ml-4 w-6 h-6" />
              <input 
                type="text" 
                placeholder="Cari kos berdasarkan lokasi, kampus..." 
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full px-4 py-2 outline-none text-sm md:text-base bg-transparent text-gray-800 font-medium" 
              />
              <button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-bold transition-colors hidden md:block">
                Cari
              </button>
            </div>

            <div className="flex flex-wrap gap-3 mt-6 relative z-20">
              <div className="relative">
                <button onClick={() => toggleDropdown('gender')} className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors shadow-sm ${genders.length > 0 || openDropdown === 'gender' ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                  {genders.length > 0 ? `Tipe (${genders.length}) ▾` : 'Tipe Kos ▾'}
                </button>
                {openDropdown === 'gender' && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl p-3 z-50">
                    {['Pria', 'Wanita', 'Campur'].map(g => (
                      <label key={g} className="flex items-center space-x-3 py-2 px-2 hover:bg-blue-50 rounded-lg cursor-pointer"><input type="checkbox" checked={genders.includes(g)} onChange={() => toggleGender(g)} className="w-4 h-4 rounded text-blue-600" /><span className="text-sm text-gray-700">{g}</span></label>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <button onClick={() => toggleDropdown('price')} className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors shadow-sm ${(minPrice || maxPrice) || openDropdown === 'price' ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                  Harga ▾
                </button>
                {openDropdown === 'price' && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-xl p-4 z-50 flex flex-col gap-4">
                    {/* PERUBAHAN: Tambah min={0} agar harga tidak bisa minus */}
                    <div><label className="block text-xs font-semibold text-gray-500 mb-1">Min (Rp)</label><input type="number" min={0} placeholder="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" /></div>
                    <div><label className="block text-xs font-semibold text-gray-500 mb-1">Max (Rp)</label><input type="number" min={0} placeholder="2000000" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" /></div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button onClick={() => toggleDropdown('facilities')} className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors shadow-sm ${facilities.length > 0 || openDropdown === 'facilities' ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                  {facilities.length > 0 ? `Fasilitas (${facilities.length}) ▾` : 'Fasilitas ▾'}
                </button>
                {openDropdown === 'facilities' && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl p-3 z-50 max-h-60 overflow-y-auto">
                    {listFasilitas.map(f => (
                      <label key={f.facility_id} className="flex items-center space-x-3 py-1.5 px-2 hover:bg-blue-50 rounded-lg cursor-pointer"><input type="checkbox" checked={facilities.includes(f.facility_id)} onChange={() => toggleFacility(f.facility_id)} className="w-4 h-4 rounded text-blue-600" /><span className="text-sm text-gray-700">{f.facility_name}</span></label>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={() => setIsAvailable(!isAvailable)} className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors shadow-sm ${isAvailable ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                Tersedia
              </button>
            </div>
          </div>
        </section>

        <section className="w-full max-w-6xl mx-auto px-4 md:px-8 mt-8">
          <div className="bg-gradient-to-r from-blue-500 via-indigo-400 to-amber-500 rounded-2xl p-6 md:p-8 flex flex-col justify-center text-white shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-10 -mt-10 opacity-20"><svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z"/></svg></div>
            <div className="relative z-10">
              <span className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold mb-3 border border-white/30">✨ Promo Special</span>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Diskon 20% Bulan Pertama</h2>
              <p className="text-white/90 text-sm md:text-base">Khusus untuk mahasiswa baru. Cek kos dengan label "Promo" sekarang!</p>
            </div>
          </div>
        </section>

        <section className="w-full max-w-6xl mx-auto px-4 md:px-8 mt-12 mb-20">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Kos Populer</h2>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-500 font-medium">Memuat data kos...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {kosList.map((kos) => (
                <div 
                  key={kos.kos_id} 
                  onClick={() => onNavigate(`detail-${kos.kos_id}`)} 
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer"
                >
                  <div className="w-full h-28 sm:h-40 overflow-hidden relative">
                    <img 
                      src={kos.image_url} 
                      alt={kos.kos_name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <span className="absolute bottom-2 left-2 sm:hidden border border-blue-400 bg-white text-blue-600 px-2 py-0.5 rounded-full text-[9px] font-semibold">
                      {kos.gender_type}
                    </span>
                  </div>
                  <div className="p-2 sm:p-3 flex flex-col gap-1 sm:gap-1.5">
                    <div className="flex justify-between items-start gap-1">
                      <div className="flex flex-col gap-0.5 sm:gap-1 min-w-0">
                        <h3 className="font-bold text-xs sm:text-sm text-gray-900 leading-tight truncate">{kos.kos_name}</h3>
                        <span className="hidden sm:inline-flex border border-blue-400 text-blue-600 px-2 py-0.5 rounded-full text-[10px] font-semibold w-fit">
                          {kos.gender_type}
                        </span>
                      </div>
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                      </svg>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 text-[9px] sm:text-[10px] font-medium">
                      <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                      <span className="truncate">{kos.city}</span>
                      <svg className="w-3 h-3 text-orange-400 ml-1 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                      <span className="font-semibold text-gray-700">{kos.average_rating ? Number(kos.average_rating).toFixed(1) : 'Baru'}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(kos.facilities || []).slice(0, 2).map((fac) => (
                        <span key={fac.facility_id} className="bg-blue-50 text-blue-600 text-[9px] px-1.5 py-0.5 rounded-full font-semibold">
                          {fac.facility_name}
                        </span>
                      ))}
                      {(kos.facilities || []).length > 2 && (
                        <span className="bg-gray-100 text-gray-500 text-[9px] px-1.5 py-0.5 rounded-full font-semibold">
                          +{(kos.facilities || []).length - 2}
                        </span>
                      )}
                    </div>
                    {(kos.rules || []).length > 0 && (
                      <div className="hidden sm:flex flex-wrap gap-1">
                        {(kos.rules || []).slice(0, 2).map((rule) => (
                          <span key={rule.rule_id} className="bg-amber-50 text-amber-600 text-[9px] px-2 py-0.5 rounded-full font-semibold">
                            {rule.rule_name}
                          </span>
                        ))}
                        {(kos.rules || []).length > 2 && (
                          <span className="bg-gray-100 text-gray-500 text-[9px] px-2 py-0.5 rounded-full font-semibold">
                            +{(kos.rules || []).length - 2}
                          </span>
                        )}
                      </div>
                    )}
                    <p className="text-[9px] sm:text-[10px] text-gray-500">
                      <span className="text-blue-600 font-extrabold text-xs sm:text-sm mr-0.5">
                        Rp {Number(kos.price).toLocaleString('id-ID')}
                      </span>
                      /bln
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* SETTING SIDEBAR OVERLAY */}
      {settingOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSettingOpen(false)}
          />
          
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
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div className="flex-1 px-4 py-5 space-y-6">

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-1 mb-2">Profil</p>
                <div className="bg-white rounded-2xl overflow-hidden divide-y divide-gray-100 shadow-sm">
                  <button
                    onClick={() => { setSettingOpen(false); onNavigate('profil'); }}
                    className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition text-left"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Ubah Profil</p>
                      <p className="text-[11px] text-gray-400">Nama, foto, dan info pribadi</p>
                    </div>
                    <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-1 mb-2">Riwayat</p>
                <div className="bg-white rounded-2xl overflow-hidden divide-y divide-gray-100 shadow-sm">
                  <button
                    onClick={() => { setSettingOpen(false); onNavigate('riwayat'); }}
                    className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition text-left"
                  >
                    <p className="text-sm font-semibold text-gray-800">Riwayat Pencarian</p>
                    <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-1 mb-2">Keamanan</p>
                <div className="bg-white rounded-2xl overflow-hidden divide-y divide-gray-100 shadow-sm">
                  <button
                    onClick={() => { setSettingOpen(false); onNavigate('profil'); }}
                    className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition text-left"
                  >
                    <p className="text-sm font-semibold text-gray-800">Ubah Password</p>
                    <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-1 mb-2">Bantuan</p>
                <div className="bg-white rounded-2xl overflow-hidden divide-y divide-gray-100 shadow-sm">
                  <button
                    onClick={() => { setSettingOpen(false); onNavigate('bantuan'); }}
                    className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition text-left"
                  >
                    <p className="text-sm font-semibold text-gray-800">Tanya KosFinder+</p>
                    <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-1 mb-2">Lainnya</p>
                <div className="bg-white rounded-2xl overflow-hidden divide-y divide-gray-100 shadow-sm">
                  {[
                    { label: 'Tentang Kami', key: 'tentang' },
                    { label: 'Kebijakan Privasi', key: 'kebijakan' },
                    { label: 'Kredit & Atribut', key: 'kredit' },
                  ].map(item => (
                    <button
                      key={item.key}
                      onClick={() => { setSettingOpen(false); onNavigate(item.key); }}
                      className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition text-left"
                    >
                      <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                      <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-4 pb-8 pt-2">
              <button
                onClick={() => { setSettingOpen(false); handleLogout(); }}
                className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-500 hover:bg-red-50 transition py-3 rounded-2xl font-semibold text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
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
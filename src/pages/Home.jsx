import { useState } from 'react';
import LogoKosfinder from '../assets/Logo-Kosfinder.svg';
import BgHero from '../assets/landing kosfinder 1.svg'; 
import IconCari from '../assets/material-symbols-light_search.svg';
import IconWishlist from '../assets/tdesign_heart.svg';
import IconProfil from '../assets/iconamoon_profile-light.svg';
import IconSetting from '../assets/mdi-light_settings.svg';

export default function Home({ onNavigate }) {
  const [openDropdown, setOpenDropdown] = useState(null);
  
  // STATE FILTER
  const [keyword, setKeyword] = useState(''); // State baru untuk input pencarian
  const [isAvailable, setIsAvailable] = useState(false);
  const [genders, setGenders] = useState([]); 
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [facilities, setFacilities] = useState([]);
  const [rules, setRules] = useState([]);

  const listFasilitas = ['Wifi', 'AC', 'Kipas', 'Parkir Mobil', 'Kamar Mandi Dalam', 'Include Listrik', 'Dapur', 'Laundry'];
  const listPeraturan = ['Dilarang merokok', 'Terdapat jam malam', 'Dilarang membawa lawan jenis', 'Dilarang membawa peliharaan', 'Tamu dilarang menginap'];

  const dummyKos = [
    { id: 1, name: "Kos Melati Wanita Residence", type: "Wanita", location: "Jl. Raya Kampus ITS, Sukolilo, Surabaya Timur", rating: "5.0 (1)", facilities: ["WiFi", "AC", "Parkir Motor"], price: "1.200.000", image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800" },
    { id: 2, name: "Kos Pria Modern Living", type: "Pria", location: "Jl. Keputih, Sukolilo, Surabaya Timur", rating: "4.8 (12)", facilities: ["WiFi", "AC", "Parkir Motor"], price: "980.000", image: "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800" },
    { id: 3, name: "Kos Exclusive Gebang", type: "Wanita", location: "Jl. Gebang, Sukolilo, Surabaya Timur", rating: "4.9 (24)", facilities: ["WiFi", "AC", "Parkir Motor"], price: "1.500.000", image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800" },
    { id: 4, name: "Kos Pria Stayvie", type: "Pria", location: "Jl. Bhaskara Sari, Mulyosari, Surabaya Timur", rating: "4.2 (5)", facilities: ["WiFi", "AC", "Parkir Motor"], price: "2.500.000", image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800" }
  ];

  const toggleDropdown = (name) => setOpenDropdown(openDropdown === name ? null : name);
  const toggleGender = (item) => setGenders(prev => prev.includes(item) ? prev.filter(g => g !== item) : [...prev, item]);
  const toggleFacility = (item) => setFacilities(prev => prev.includes(item) ? prev.filter(f => f !== item) : [...prev, item]);
  const toggleRule = (item) => setRules(prev => prev.includes(item) ? prev.filter(r => r !== item) : [...prev, item]);

  // FUNGSI MEMICU PENCARIAN
  const handleSearch = () => {
    // Pindah ke halaman 'search' sambil membawa koper berisi seluruh state saat ini
    onNavigate('search', { keyword, genders, minPrice, maxPrice, facilities, rules, isAvailable });
  };

  const scrollToSearch = (e) => {
    e.preventDefault();
    const target = document.getElementById('area-pencarian');
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
      <header className="bg-white px-4 pt-3 pb-1 md:px-8 md:py-4 flex flex-wrap content-start items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="order-1 flex justify-start md:flex-1">
          <a href="#" onClick={(e) => e.preventDefault()} className="hover:opacity-80 transition-opacity">
            <img src={LogoKosfinder} alt="Logo" className="h-8 md:h-10 w-auto" />
          </a>
        </div>
        <div className="order-2 md:order-3 flex justify-end md:flex-1">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 md:px-7 md:py-2.5 rounded-full font-bold transition-colors text-sm md:text-base shadow-sm">Masuk</button>
        </div>
        <nav className="order-3 md:order-2 w-full md:w-auto mt-2 md:mt-0 flex justify-evenly md:justify-center gap-2 md:gap-16 lg:gap-24 font-medium text-gray-500">
          <a href="#area-pencarian" onClick={scrollToSearch} className="flex flex-col items-center hover:text-blue-600 group cursor-pointer"><img src={IconCari} className="w-5 h-5 md:w-6 md:h-6 opacity-70 group-hover:opacity-100" /><span className="mt-1 text-xs md:text-sm">Cari Kos</span></a>
          <a href="#" className="flex flex-col items-center hover:text-blue-600 group cursor-pointer"><img src={IconWishlist} className="w-5 h-5 md:w-6 md:h-6 opacity-70 group-hover:opacity-100" /><span className="mt-1 text-xs md:text-sm">Wishlist</span></a>
          <a href="#" className="flex flex-col items-center hover:text-blue-600 group cursor-pointer"><img src={IconProfil} className="w-5 h-5 md:w-6 md:h-6 opacity-70 group-hover:opacity-100" /><span className="mt-1 text-xs md:text-sm">Profil</span></a>
          <a href="#" className="flex flex-col items-center hover:text-blue-600 group cursor-pointer"><img src={IconSetting} className="w-5 h-5 md:w-6 md:h-6 opacity-70 group-hover:opacity-100" /><span className="mt-1 text-xs md:text-sm">Setting</span></a>
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

            {/* SEARCH BAR (Dengan handleSearch) */}
            <div id="area-pencarian" className="bg-white p-2 md:p-3 rounded-full shadow-lg flex items-center border border-gray-100 max-w-3xl relative z-20">
              <img src={IconCari} alt="Cari" className="ml-4 w-6 h-6" />
              <input 
                type="text" 
                placeholder="Cari kos berdasarkan lokasi, kampus..." 
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()} // Eksekusi saat enter ditekan
                className="w-full px-4 py-2 outline-none text-sm md:text-base bg-transparent text-gray-800 font-medium" 
              />
              <button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-bold transition-colors hidden md:block">
                Cari
              </button>
            </div>

            {/* FILTER BUBBLES */}
            <div className="flex flex-wrap gap-3 mt-6 relative z-20">
              <div className="relative">
                <button onClick={() => toggleDropdown('gender')} className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors shadow-sm ${genders.length > 0 || openDropdown === 'gender' ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                  {genders.length > 0 ? `Tipe (${genders.length}) ▾` : 'Jenis Kelamin ▾'}
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
                    <div><label className="block text-xs font-semibold text-gray-500 mb-1">Min (Rp)</label><input type="number" placeholder="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" /></div>
                    <div><label className="block text-xs font-semibold text-gray-500 mb-1">Max (Rp)</label><input type="number" placeholder="2000000" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" /></div>
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
                      <label key={f} className="flex items-center space-x-3 py-1.5 px-2 hover:bg-blue-50 rounded-lg cursor-pointer"><input type="checkbox" checked={facilities.includes(f)} onChange={() => toggleFacility(f)} className="w-4 h-4 rounded text-blue-600" /><span className="text-sm text-gray-700">{f}</span></label>
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

        {/* PROMO BANNER */}
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

        {/* KOS POPULER GRID */}
        <section className="w-full max-w-6xl mx-auto px-4 md:px-8 mt-12 mb-20">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Kos Populer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dummyKos.map((kos) => (
              <div key={kos.id} onClick={() => onNavigate(kos.id)} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer">
                <div className="w-full h-56 md:h-64 overflow-hidden relative"><img src={kos.image} alt={kos.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /></div>
                <div className="p-5 flex flex-col gap-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-lg text-gray-900 leading-tight">{kos.name}</h3>
                      <span className="border border-blue-400 text-blue-600 px-3 py-0.5 rounded-full text-[11px] font-semibold">{kos.type}</span>
                    </div>
                    <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                  </div>
                  <div className="flex items-start gap-1.5 text-gray-500 text-xs font-medium">
                    <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    <span>{kos.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                    <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                    <span>{kos.rating}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {kos.facilities.map((fasilitas, index) => (
                      <span key={index} className="bg-gray-200 text-gray-600 text-[10px] px-2.5 py-1 rounded-full font-semibold">{fasilitas}</span>
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-gray-500"><span className="text-blue-600 font-extrabold text-lg mr-1">Rp {kos.price}</span>/bulan</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
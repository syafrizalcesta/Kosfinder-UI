import { useState } from 'react';
import LogoKosfinder from '../assets/Logo-Kosfinder.svg';
import IconCari from '../assets/material-symbols-light_search.svg';
import IconWishlist from '../assets/tdesign_heart.svg';
import IconProfil from '../assets/iconamoon_profile-light.svg';
import IconSetting from '../assets/mdi-light_settings.svg';
import IconBeranda from '../assets/Icon-Beranda.svg';

export default function SearchPage({ initialParams, onNavigate, onNavigateBack }) {
  const [openDropdown, setOpenDropdown] = useState(null);
  
  // STATE MENGGUNAKAN DATA BAWAAN DARI HOME (Jika ada)
  const [keyword, setKeyword] = useState(initialParams?.keyword || '');
  const [isAvailable, setIsAvailable] = useState(initialParams?.isAvailable || false);
  const [genders, setGenders] = useState(initialParams?.genders || []); 
  const [minPrice, setMinPrice] = useState(initialParams?.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(initialParams?.maxPrice || '');
  const [facilities, setFacilities] = useState(initialParams?.facilities || []);

  const listFasilitas = ['Wifi', 'AC', 'Kipas', 'Parkir Mobil', 'Kamar Mandi Dalam', 'Include Listrik', 'Dapur', 'Laundry'];

  // Dummy Kos (Sama seperti Home agar hasil pencariannya terlihat)
  const dummyKos = [
    { id: 1, name: "Kos Melati Wanita Residence", type: "Wanita", location: "Jl. Raya Kampus ITS, Surabaya Timur", rating: "5.0 (1)", facilities: ["WiFi", "AC", "Parkir Motor"], price: "1.200.000", image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800" },
    { id: 2, name: "Kos Pria Modern Living", type: "Pria", location: "Jl. Keputih, Surabaya Timur", rating: "4.8 (12)", facilities: ["WiFi", "AC", "Parkir Motor"], price: "980.000", image: "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800" },
    { id: 3, name: "Kos Exclusive Gebang", type: "Wanita", location: "Jl. Gebang, Surabaya Timur", rating: "4.9 (24)", facilities: ["WiFi", "AC", "Parkir Motor"], price: "1.500.000", image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800" },
    { id: 4, name: "Kos Pria Stayvie", type: "Pria", location: "Jl. Bhaskara Sari, Surabaya Timur", rating: "4.2 (5)", facilities: ["WiFi", "AC", "Parkir Motor"], price: "2.500.000", image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800" }
  ];

  const toggleDropdown = (name) => setOpenDropdown(openDropdown === name ? null : name);
  const toggleGender = (item) => setGenders(prev => prev.includes(item) ? prev.filter(g => g !== item) : [...prev, item]);
  const toggleFacility = (item) => setFacilities(prev => prev.includes(item) ? prev.filter(f => f !== item) : [...prev, item]);

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
      
      {/* HEADER (KONSISTEN) */}
      <header className="bg-white px-4 py-3 md:px-8 md:py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex-1">
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigateBack(); }}>
            <img src={LogoKosfinder} alt="Logo" className="h-8 md:h-10 w-auto" />
          </a>
        </div>
        <nav className="hidden md:flex gap-12 font-medium text-gray-500">
          <button onClick={() => onNavigateBack()} className="flex flex-col items-center hover:text-blue-600 transition-colors">
            <img src={IconBeranda} className="w-6 h-6 opacity-70" alt="Beranda" />
            <span>Beranda</span>
          </button>
          
          <button className="flex flex-col items-center text-blue-600">
            <img src={IconCari} className="w-6 h-6 opacity-100" />
            <span>Cari</span>
          </button>
          
          {/* SINKRONISASI TOMBOL WISHLIST KAN ALUR NAVIGASINYA */}
          <button onClick={() => onNavigate('wishlist')} className="flex flex-col items-center hover:text-blue-600">
            <img src={IconWishlist} className="w-6 h-6 opacity-70" />
            <span>Wishlist</span>
          </button>
          
          <button className="flex flex-col items-center hover:text-blue-600">
            <img src={IconProfil} className="w-6 h-6 opacity-70" />
            <span>Profil</span>
          </button>
          
          <button className="flex flex-col items-center hover:text-blue-600">
            <img src={IconSetting} className="w-6 h-6 opacity-70" />
            <span>Setting</span>
          </button>
        </nav>
        <div className="flex-1 flex justify-end gap-3">
          <button className="bg-blue-600 text-white px-5 py-2 rounded-full font-bold text-sm">Masuk</button>
        </div>
      </header>

      {/* SEARCH BAR & FILTER DI BAGIAN BODY */}
      <div className="bg-white border-b border-gray-200 shadow-sm pb-6 pt-6 z-40">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          
          <div className="bg-gray-50 p-2 md:p-3 rounded-full flex items-center border border-gray-200 w-full mb-4 focus-within:ring-2 ring-blue-100 transition-all">
            <button onClick={onNavigateBack} className="px-3 text-gray-500 hover:text-gray-800 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            </button>
            <div className="w-[1px] h-6 bg-gray-300 mx-2"></div>
            <img src={IconCari} alt="Cari" className="ml-2 w-5 h-5 opacity-60" />
            <input 
              type="text" 
              placeholder="Cari lokasi, kampus, nama kos..." 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full px-4 py-1.5 outline-none text-sm md:text-base bg-transparent text-gray-800 font-medium" 
            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-full font-bold transition-colors hidden md:block text-sm">
              Cari
            </button>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <div className="relative">
              <button onClick={() => toggleDropdown('gender')} className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${genders.length > 0 || openDropdown === 'gender' ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-white border-gray-300 text-gray-700'}`}>
                {genders.length > 0 ? `Tipe (${genders.length}) ▾` : 'Tipe Kos ▾'}
              </button>
              {openDropdown === 'gender' && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl p-3 z-50">
                  {['Pria', 'Wanita', 'Campur'].map(g => (
                    <label key={g} className="flex items-center space-x-3 py-1.5 px-2 hover:bg-blue-50 rounded-lg cursor-pointer"><input type="checkbox" checked={genders.includes(g)} onChange={() => toggleGender(g)} className="w-4 h-4 rounded text-blue-600" /><span className="text-sm text-gray-700">{g}</span></label>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button onClick={() => toggleDropdown('price')} className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${(minPrice || maxPrice) || openDropdown === 'price' ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-white border-gray-300 text-gray-700'}`}>
                Harga ▾
              </button>
              {openDropdown === 'price' && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-100 rounded-xl shadow-xl p-4 z-50 flex flex-col gap-3">
                  <div><label className="block text-xs font-semibold text-gray-500 mb-1">Min (Rp)</label><input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none" /></div>
                  <div><label className="block text-xs font-semibold text-gray-500 mb-1">Max (Rp)</label><input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none" /></div>
                </div>
              )}
            </div>

            <div className="relative">
              <button onClick={() => toggleDropdown('facilities')} className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${facilities.length > 0 || openDropdown === 'facilities' ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-white border-gray-300 text-gray-700'}`}>
                {facilities.length > 0 ? `Fasilitas (${facilities.length}) ▾` : 'Fasilitas ▾'}
              </button>
              {openDropdown === 'facilities' && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl p-3 z-50 max-h-60 overflow-y-auto">
                  {listFasilitas.map(f => (
                    <label key={f} className="flex items-center space-x-3 py-1.5 px-2 hover:bg-blue-50 rounded-lg cursor-pointer"><input type="checkbox" checked={facilities.includes(f)} onChange={() => toggleFacility(f)} className="w-4 h-4 rounded text-blue-600" /><span className="text-sm text-gray-700">{f}</span></label>
                  ))}
                </div>
              )}
            </div>

            <button onClick={() => setIsAvailable(!isAvailable)} className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors shadow-sm ${isAvailable ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-700'}`}>
              Tersedia
            </button>
          </div>
        </div>
      </div>

      {/* GRID HASIL PENCARIAN */}
      <main className="w-full max-w-6xl mx-auto px-4 md:px-8 mt-8 mb-20 flex-1">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Hasil Pencarian</h1>
            <p className="text-sm text-gray-500 mt-1">Menampilkan {dummyKos.length} kos yang sesuai dengan kriteria Anda.</p>
          </div>
          <select className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg outline-none focus:ring-blue-500 focus:border-blue-500 block px-3 py-2 shadow-sm font-medium">
            <option>Paling Sesuai</option>
            <option>Harga Termurah</option>
            <option>Harga Termahal</option>
            <option>Rating Tertinggi</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dummyKos.map((kos) => (
            <div key={kos.id} onClick={() => onNavigate(kos.id)} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer flex flex-col">
              <div className="w-full h-56 md:h-64 overflow-hidden relative">
                <img src={kos.image} alt={kos.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start gap-2 mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-lg text-gray-900 leading-tight">{kos.name}</h3>
                    <span className="border border-blue-400 text-blue-600 px-3 py-0.5 rounded-full text-[11px] font-semibold tracking-wide">{kos.type}</span>
                  </div>
                </div>
                <div className="flex items-start gap-1.5 text-gray-500 text-xs font-medium mb-1">
                  <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  <span>{kos.location}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-3">
                  <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                  <span>{kos.rating}</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-auto">
                  {kos.facilities.map((fasilitas, index) => (
                    <span key={index} className="bg-gray-100 text-gray-600 text-[10px] px-2.5 py-1 rounded-md font-semibold border border-gray-200">{fasilitas}</span>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <p className="text-sm text-gray-500"><span className="text-blue-600 font-extrabold text-lg mr-1">Rp {kos.price}</span>/bulan</p>
                  <button className="text-blue-600 font-bold text-sm hover:underline">Detail ➔</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
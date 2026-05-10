import { useState } from 'react';
import LogoKosfinder from '../assets/Logo-Kosfinder.svg';
import IconCari from '../assets/material-symbols-light_search.svg';
import IconWishlist from '../assets/tdesign_heart.svg';
import IconProfil from '../assets/iconamoon_profile-light.svg';

import IconWifi from '../assets/Icon-Wifi.svg';
import IconKMLuar from '../assets/Icon-KMLuar.svg';
import IconClean from '../assets/Icon-Clean.svg';
import IconNoPets from '../assets/Icon-NoPets.svg';

export default function DetailKosPriaStayvie({ onNavigateBack }) {
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

// --- KEMBALIKAN STATE FILTER ---
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
  // ---------------------------------

  const data = {
    name: "Kos Pria Stayvie",
    status: "Tersedia 5 Kamar",
    statusColor: "bg-green-100 text-green-700",
    price: "2.500.000",
    address: "Jl. Bhaskara Sari, Mulyosari, Surabaya Timur",
    facilities: [
      { label: "WiFi Cepat", icon: IconWifi },
      { label: "KM Luar", icon: IconKMLuar }
    ],
    rules: [
      { label: "Wajib Bersih", icon: IconClean },
      { label: "No Pets", icon: IconNoPets }
    ]
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24 text-gray-800">
      <header className="bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex-1"><a href="#" onClick={(e) => { e.preventDefault(); onNavigateBack(); }}><img src={LogoKosfinder} alt="Logo" className="h-8 w-auto" /></a></div>
        <nav className="hidden md:flex gap-8 text-gray-500 font-medium">
          <button onClick={() => setShowSearchPanel(!showSearchPanel)} className="flex flex-col items-center hover:text-blue-600"><img src={IconCari} className="w-6 h-6" /><span>Cari</span></button>
          <button className="flex flex-col items-center hover:text-blue-600"><img src={IconWishlist} className="w-6 h-6" /><span>Wishlist</span></button>
          <button className="flex flex-col items-center hover:text-blue-600"><img src={IconProfil} className="w-6 h-6" /><span>Profil</span></button>
        </nav>
        <div className="flex-1 flex justify-end gap-3">
          <button className="bg-blue-600 text-white px-5 py-1.5 rounded-full font-bold text-sm">Masuk</button>
          <button onClick={onNavigateBack} className="bg-gray-100 px-4 py-1.5 rounded-full font-bold text-sm flex items-center gap-1.5">Kembali ➔</button>
        </div>
      </header>

      {/* === SEARCH PANEL & FILTER LENGKAP === */}
      {showSearchPanel && (
        <div className="sticky top-[60px] z-40 bg-white border-b border-gray-200 shadow-lg px-4 py-5 md:px-8 animate-fade-in-down">
          <div className="max-w-4xl mx-auto">
            {/* Search Bar */}
            <div className="bg-gray-50 p-2 md:p-3 rounded-full flex items-center border border-gray-200 w-full mb-4 focus-within:ring-2 ring-blue-100 transition-all">
              <img src={IconCari} alt="Cari" className="ml-3 w-5 h-5 opacity-60" />
              <input type="text" placeholder="Cari lokasi, kampus, nama kos..." className="w-full px-4 py-1.5 outline-none text-sm md:text-base bg-transparent text-gray-800" />
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-bold transition-colors hidden md:block text-sm">
                Cari
              </button>
            </div>

            {/* Filter Bubbles */}
            <div className="flex flex-wrap gap-2.5">
              
              {/* Tipe Kelamin */}
              <div className="relative">
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

              {/* Harga */}
              <div className="relative">
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

              {/* Fasilitas */}
              <div className="relative">
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

              {/* Tombol Tersedia */}
              <button 
                onClick={() => setIsAvailable(!isAvailable)} 
                className={`px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold border transition-colors shadow-sm ${isAvailable ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                Tersedia
              </button>

            </div>
            
            {/* Tombol Terapkan (Khusus HP) */}
            <div className="mt-4 flex justify-end md:hidden">
              <button onClick={() => setShowSearchPanel(false)} className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-bold w-full">
                Terapkan & Cari
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GALERI */}
      <div className="w-full max-w-3xl mx-auto bg-white mt-1">
        <div className="w-full h-56 md:h-80 overflow-hidden relative">
          <img src="https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1000" className="w-full h-full object-cover" alt="Utama" />
        </div>
        <div className="flex w-full h-16 md:h-24">
          <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300" className="w-1/4 h-full object-cover border-r border-white" alt="1" />
          <img src="https://images.unsplash.com/photo-1505693314120-0d443867891c?w=300" className="w-1/4 h-full object-cover border-r border-white" alt="2" />
          <img src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=300" className="w-1/4 h-full object-cover border-r border-white" alt="3" />
          <div className="w-1/4 h-full relative bg-gray-900"><img src="https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=300" className="w-full h-full object-cover opacity-50" alt="4" /><div className="absolute inset-0 flex items-center justify-center text-white font-bold">+1 Foto</div></div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto p-4 md:p-6">
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold">{data.name}</h1>
            <span className={`${data.statusColor} px-3 py-1 rounded-full text-xs font-bold uppercase`}>{data.status}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm mb-2">
            <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
            <span className="font-bold">4.2</span>
            <span className="text-gray-500">(5 Ulasan)</span>
          </div>
          <p className="text-gray-500 text-sm mb-4">{data.address}</p>
          <div className="text-2xl font-black text-blue-600">Rp {data.price}<span className="text-sm text-gray-400 font-normal">/bulan</span></div>
        </div>

        <button onClick={() => setIsWishlisted(!isWishlisted)} className={`w-full py-3.5 rounded-xl font-bold mb-8 border transition-all ${isWishlisted ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-200 text-gray-700'}`}>
          {isWishlisted ? '❤️ Ditambahkan ke Wishlist' : '🤍 Masukkan ke Daftar Wishlist'}
        </button>

        {/* DESKRIPSI LENGKAP */}
        <div className="mb-8 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-3">Deskripsi</h2>
          <div className="text-sm md:text-base text-gray-600 space-y-3 leading-relaxed">
            <p>Kos ekonomis untuk pria yang butuh tempat istirahat tenang setelah seharian beraktivitas. Sangat ideal untuk mahasiswa perantauan yang mengutamakan *budget*.</p>
            <p><strong>Detail Lokasi:</strong> {data.address} (Dekat area Mulyosari, banyak warung murah dan fotokopi).</p>
            <p><strong>Fasilitas Kamar:</strong> Setiap kamar bersih dan mendapat sinar matahari langsung, berisi Kasur Busa, Lemari Pakaian Kecil, Meja Lesehan, dan Kipas Angin Dinding.</p>
          </div>
        </div>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4">Fasilitas Standar</h2>
          <div className="flex flex-wrap gap-3">
            {data.facilities.map((fac, idx) => (
              <div key={idx} className="bg-white border border-gray-200 px-4 py-2.5 rounded-xl flex items-center gap-2.5 shadow-sm">
                <img src={fac.icon} className="w-5 h-5" alt="" />
                <span className="text-sm font-semibold text-gray-700">{fac.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4">Peraturan Kos</h2>
          <div className="flex flex-wrap gap-3">
            {data.rules.map((rule, idx) => (
              <div key={idx} className="bg-white border border-amber-200 px-4 py-2.5 rounded-xl flex items-center gap-2.5 shadow-sm">
                <img src={rule.icon} className="w-5 h-5" alt="" />
                <span className="text-sm font-semibold text-gray-700">{rule.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* REVIEW LENGKAP */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm mb-10">
          <h2 className="text-lg font-bold mb-4">Ulasan</h2>
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <img src="https://i.pravatar.cc/100?img=13" className="w-12 h-12 rounded-full object-cover" alt="" />
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-sm md:text-base">Aditya Pratama</p>
                  <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase">Penyewa</span>
                </div>
                <div className="flex items-center gap-0.5 mt-1 text-orange-400">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                  <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                </div>
              </div>
            </div>
            <span className="text-[11px] text-gray-400 font-medium">1 Minggu yang lalu</span>
          </div>
          
          <p className="text-sm font-semibold mb-2">Foto dari Aditya</p>
          <div className="flex gap-2 mb-4 overflow-x-auto">
            <img src="https://images.unsplash.com/photo-1513694203232-719a280e022f?w=150" className="w-20 h-16 rounded-lg object-cover border" alt="" />
            <img src="https://images.unsplash.com/photo-1556020685-e6319502fc9c?w=150" className="w-20 h-16 rounded-lg object-cover border" alt="" />
          </div>

          <p className="text-sm text-gray-600 mb-5 leading-relaxed">Wifi lumayan kenceng buat streaming atau kerjain tugas. Lingkungan tenang nggak berisik, cuma kamar mandinya kadang antre kalau pagi.</p>

          <p className="text-sm font-semibold mb-2">Fasilitas Umum Terdekat</p>
          <div className="bg-[#F5F5F5] border border-gray-100 rounded-lg p-3.5 text-xs text-gray-700 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2"><span className="text-blue-500 text-base">☕</span> Dekat Warkop (50m)</div>
            <div className="flex items-center gap-2"><span className="text-blue-500 text-base">🖨️</span> Fotokopi & Print (100m)</div>
            <div className="flex items-center gap-2"><span className="text-blue-500 text-base">🛒</span> Alfamidi (200m)</div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 w-full bg-white border-t p-3 z-50">
        <div className="max-w-3xl mx-auto flex gap-3">
          <button onClick={() => window.open('https://maps.app.goo.gl/stCK71fK7Sz8GgEN9', '_blank')} className="w-1/2 border-2 border-blue-600 text-blue-600 font-bold py-2.5 rounded-xl">Lihat Lokasi</button>
          <button onClick={() => window.open('https://wa.me/628113529393', '_blank')} className="w-1/2 bg-gradient-to-r from-blue-600 to-amber-500 text-white font-bold py-2.5 rounded-xl">Hubungi Pemilik</button>
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import LogoKosfinder from '../assets/Logo-Kosfinder.svg';
import IconBeranda from '../assets/Icon-Beranda.svg'; 
import IconCari from '../assets/material-symbols-light_search.svg';
import IconWishlist from '../assets/Icon-Wishlist.svg';
import IconProfil from '../assets/iconamoon_profile-light.svg';
import IconSetting from '../assets/mdi-light_settings.svg';

// Import contoh gambar kosan kamu (Sesuaikan nama file gambar dengan yang ada di assets-mu ya El)
import GambarMelati from '../assets/Kost-Melati.png'; 
import GambarModern from '../assets/Kost-Pria-Modern.png';
import GambarExclusive from '../assets/Kost-Exclusive-Gebang.png';

export default function UserWishlist({ wishlistItems = [], onNavigateDetail, onNavigate }) {
  
  // DATA DUMMY/MOCK BIKINAN: Biar kalau data dari App.jsx masih kosong, layatout grid-nya tetap terisi kosan!
  const contohDataKos = [
    {
      id: 1,
      nama: "Kost Melati Sukolilo",
      tipe: "Campur",
      alamat: "Keputih, Kec. Sukolilo, Surabaya",
      harga: "1.200.000",
      gambar: GambarMelati
    },
    {
      id: 2,
      nama: "Kost Pria Modern",
      tipe: "Putra",
      alamat: "Gebang Putih, Sukolilo, Surabaya",
      harga: "1.500.000",
      gambar: GambarModern
    },
    {
      id: 3,
      nama: "Kost Exclusive Gebang",
      tipe: "Putri",
      alamat: "Jl. Gebang Raya No. 12, Surabaya",
      harga: "2.000.000",
      gambar: GambarExclusive
    }
  ];

  // Gunakan data asli dari backend/App.jsx jika ada, kalau masih kosong pakai contohDataKos di atas
  const displayItems = wishlistItems.length > 0 ? wishlistItems : contohDataKos;

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col font-sans">
      
      {/* HEADER / NAVBAR UTAMA USER */}
      <header className="bg-white px-4 pt-3 pb-1 md:px-12 md:py-4 flex flex-wrap content-start items-center justify-between sticky top-0 z-30 shadow-sm border-b border-gray-100">
        <div className="order-1 flex justify-start md:flex-1">
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              onNavigate('home');
            }} 
            className="hover:opacity-80 transition-opacity"
          >
            <img src={LogoKosfinder} alt="Logo" className="h-8 md:h-10 w-auto" />
          </a>
        </div>
        
        <div className="order-2 md:order-3 flex justify-end md:flex-1">
          <button 
            onClick={() => onNavigate('register')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 md:px-7 md:py-2.5 rounded-full font-bold transition-colors text-sm md:text-base shadow-sm"
          >
            Masuk
          </button>
        </div>
        
        {/* BARIS MENU NAVIGASI (REVISI STRUKTUR TOMBOL AGAR BERANDA DAN PROFIL TIDAK BENTROK KLIK) */}
        <nav className="order-3 md:order-2 w-full md:w-auto mt-2 md:mt-0 flex justify-evenly md:justify-center gap-2 md:gap-16 lg:gap-20 font-bold text-gray-400 text-xs md:text-sm relative z-40">
          
          {/* 1. Beranda */}
          <button 
            onClick={(e) => { 
              e.preventDefault(); 
              onNavigate('search'); 
            }} 
            className="flex flex-col items-center hover:text-blue-600 group cursor-pointer transition-colors bg-transparent border-none outline-none relative z-50"
          >
            <img src={IconBeranda} className="w-5 h-5 md:w-6 md:h-6 opacity-70 group-hover:opacity-100 transition-opacity" alt="Beranda" />
            <span className="mt-1">Beranda</span>
          </button>

          {/* 2. Cari Kos */}
          <button 
            onClick={(e) => { 
              e.preventDefault(); 
              onNavigate('search'); 
            }} 
            className="flex flex-col items-center hover:text-blue-600 group cursor-pointer transition-colors bg-transparent border-none outline-none relative z-50"
          >
            <img src={IconCari} className="w-5 h-5 md:w-6 md:h-6 opacity-70 group-hover:opacity-100 transition-opacity" alt="Cari Kos" />
            <span className="mt-1">Cari Kos</span>
          </button>
          
          {/* 3. Wishlist (Aktif) */}
          <div className="flex flex-col items-center text-blue-600 cursor-default select-none">
            <img src={IconWishlist} className="w-5 h-5 md:w-6 md:h-6" alt="Wishlist" />
            <span className="mt-1">Wishlist</span>
          </div>
          
          {/* 4. Profil (DIKUNCI AGAR TIDAK MENERUSKAN KLIK KE MANA-MANA) */}
          <button 
            onClick={(e) => {
              e.preventDefault();
            }}
            className="flex flex-col items-center hover:text-blue-600 group cursor-pointer transition-colors bg-transparent border-none outline-none"
          >
            <img src={IconProfil} className="w-5 h-5 md:w-6 md:h-6 opacity-70 group-hover:opacity-100 transition-opacity" alt="Profil" />
            <span className="mt-1">Profil</span>
          </button>
          
          {/* 5. Setting */}
          <button 
            onClick={(e) => {
              e.preventDefault();
            }}
            className="flex flex-col items-center hover:text-blue-600 group cursor-pointer transition-colors bg-transparent border-none outline-none"
          >
            <img src={IconSetting} className="w-5 h-5 md:w-6 md:h-6 opacity-70 group-hover:opacity-100 transition-opacity" alt="Setting" />
            <span className="mt-1">Setting</span>
          </button>
        </nav>
      </header>

      {/* AREA UTAMA KONTEN WISHLIST */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 md:px-12 py-10">
        
        {/* JUDUL HALAMAN UTAMA */}
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-8 tracking-tight">
          Wishlist Kos
        </h1>

        {/* LAYOUT GRID KOTAK-KOTAK (3 KOLOM SESUAI MOCKUP BARUMU) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayItems.map((kos) => (
            <div
              key={kos.id}
              onClick={() => onNavigateDetail(kos.id)}
              className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col"
            >
              {/* Bagian Atas: Foto Kamar Kos Besar */}
              <div className="w-full h-48 md:h-52 overflow-hidden bg-slate-100 relative">
                <img 
                  src={kos.gambar} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  alt={kos.nama} 
                />
                {/* Tag Tipe Kos */}
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-blue-600 text-[11px] font-black px-3 py-1 rounded-full shadow-sm border border-blue-100">
                  {kos.tipe}
                </span>
              </div>
              
              {/* Bagian Bawah: Informasi Detail Teks */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  {/* Nama Kos */}
                  <h3 className="font-extrabold text-gray-900 text-lg group-hover:text-blue-600 transition-colors line-clamp-1">
                    {kos.nama}
                  </h3>
                  
                  {/* Alamat / Lokasi */}
                  <p className="text-xs font-semibold text-gray-400 line-clamp-1">
                    {kos.alamat}
                  </p>
                </div>

                {/* Baris Rating & Harga */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                  {/* Rating Bintang */}
                  <div className="flex items-center gap-1 text-xs font-bold text-gray-700">
                    <span className="text-amber-400 text-sm">★</span> 
                    <span>5.0</span>
                  </div>
                  {/* Harga Kamar */}
                  <p className="text-blue-600 font-black text-base">
                    Rp {kos.harga}<span className="text-[11px] text-gray-400 font-medium">/bln</span>
                  </p>
                </div>
              </div>

            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
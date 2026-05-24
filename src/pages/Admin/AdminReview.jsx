import React, { useState } from 'react';
// Import asset ikon bintang & verifikasi lokal milikmu
import IconTotalBintangKos from '../../assets/Icon-TotalBintangKos.svg';
import IconBintang5 from '../../assets/Icon-Bintang5.svg';
import IconVerivied from '../../assets/Icon-Verified.svg';

const AdminReview = () => {
  // 1. LOGIKA PAGINATION: State menjaga nomor halaman aktif
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 4; // 1 halaman memuat maksimal 4 ulasan

  // Mock data review bawaan kamu
  const listReview = [
    { id: 1, nama: 'Freya Evangeline', tanggal: '2 Mei 2026', isi: 'Sangat nyaman dan bersih! Fasilitas lengkap.', properti: 'Kos Melati Putri Residence' },
    { id: 2, nama: 'Syifa Hadju', tanggal: '3 Mei 2026', isi: 'Tempatnya strategis banget dekat gerbang ITS, nyari makan gampang.', properti: 'Kos Melati Putri Residence' },
    { id: 3, nama: 'Tiara Andini', tanggal: '4 Mei 2026', isi: 'Sangat nyaman dan bersih! Fasilitas lengkap.', properti: 'Kos Melati Putri Residence' },
    { id: 4, nama: 'Amanda Manopo', tanggal: '4 Mei 2026', isi: 'Ibu kosnya ramah pol, tanggap kalau ada fasilitas kamar yang rusak.', properti: 'Kos Melati Putri Residence' },
    { id: 5, nama: 'Michelle Zaudith', tanggal: '5 Mei 2026', isi: 'Sangat nyaman dan bersih! Fasilitas lengkap.', properti: 'Kos Melati Putri Residence' },
    { id: 6, nama: 'Nadine Amizah', tanggal: '5 Mei 2026', isi: 'Lingkungannya tenang, cocok banget buat nugas malam tanpa bising.', properti: 'Kos Melati Putri Residence' },
  ];

  // 2. RUMUS PEMOTONGAN ARRAY DATA REVIEW
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  
  // Memotong ulasan untuk hanya memunculkan data sesuai halaman aktif (.slice)
  const currentReviews = listReview.slice(indexOfFirstReview, indexOfLastReview);
  const totalPages = Math.ceil(listReview.length / reviewsPerPage);

  // Fungsi tombol panah Next (❯)
  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* ==================== BARIS JUDUL & RATING ATAS ==================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Review Penghuni
        </h1>
        
        {/* Ringkasan Skor Rating Kanan Atas */}
        <div className="flex items-center gap-4 bg-white border border-slate-100 px-4 py-2 rounded-2xl shadow-sm w-fit">
          <img src={IconTotalBintangKos} className="w-24 h-auto" alt="Rating" />
          
          <div className="border-l border-slate-200 pl-4">
            <div className="text-sm font-bold text-slate-800">
              4.8 <span className="text-slate-400 font-normal">/ 5.0</span>
            </div>
            <span className="text-xs text-slate-400 font-semibold block mt-0.5">{listReview.length} Total ulasan</span>
          </div>

          {/* Filter Tanggal */}
          <div className="border-l border-slate-200 pl-4">
            <select className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 outline-none cursor-pointer">
              <option>02/05/2026</option>
            </select>
          </div>
        </div>
      </div>

      {/* ==================== GRID KARTU REVIEW (MENGGUNAKAN DATA HASIL POTONGAN) ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {currentReviews.map((rev) => (
          <div 
            key={rev.id} 
            className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow min-h-[200px]"
          >
            {/* Baris Atas: Foto Profil, Nama, & Tanggal */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <img 
                  src={`https://i.pravatar.cc/100?img=${rev.id + 10}`} 
                  className="w-10 h-10 rounded-full object-cover border border-slate-100" 
                  alt={rev.nama} 
                />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-extrabold text-sm text-slate-900">{rev.nama}</h3>
                    
                    {/* Badge Verifikasi Desain Kamu yang Keren */}
                    <span className="bg-blue-50 text-blue-600 text-[9px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1.5 border-blue-100">
                      <img src={IconVerivied} className="w-4 h-4" alt="Verified" /> 
                      Penghuni Terverifikasi
                    </span>
                  </div>
                  <img src={IconBintang5} className="w-20 h-auto mt-1" alt="Bintang 5" />
                </div>
              </div>
              <span className="text-xs font-semibold text-slate-400 shrink-0">{rev.tanggal}</span>
            </div>

            {/* Isi Komentar Review */}
            <p className="text-sm font-medium text-slate-700 mt-4 leading-relaxed">
              {rev.isi}
            </p>

            {/* Baris Bawah: Nama Properti & Tombol Interaksi */}
            <div className="flex flex-wrap items-end justify-between gap-4 mt-5 pt-4 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-400">
                Properti:{' '}
                <span className="text-blue-600 hover:underline cursor-pointer block sm:inline mt-0.5 sm:mt-0">
                  {rev.properti}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg shadow-sm transition-colors">
                  Lihat Selengkapnya
                </button>
                <button className="border border-slate-300 text-slate-600 hover:bg-slate-50 font-bold text-[11px] px-2.5 py-1.5 rounded-lg transition-colors">
                  Balas
                </button>
                <button className="border border-slate-300 text-slate-600 hover:bg-slate-50 font-bold text-[11px] px-2.5 py-1.5 rounded-lg transition-colors">
                  Laporkan
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ==================== NOMOR PAGINATION INTERAKTIF (BAWAH) ==================== */}
      <div className="flex items-center justify-center gap-1.5 pt-4">
        
        {/* Tombol Halaman 1 */}
        <button 
          onClick={() => setCurrentPage(1)}
          className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all shadow-sm ${currentPage === 1 ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-50'}`}
        >
          1
        </button>

        {/* Tombol Halaman 2 */}
        <button 
          onClick={() => setCurrentPage(2)}
          className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all shadow-sm ${currentPage === 2 ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-50'}`}
        >
          2
        </button>

        {/* Tombol Halaman 3 (Bisa dipakai kalau datanya bertambah nanti) */}
        <button 
          onClick={() => setCurrentPage(3)}
          className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all shadow-sm ${currentPage === 3 ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-50'}`}
        >
          3
        </button>

        <span className="text-xs text-slate-400 px-1">...</span>
        
        {/* Tombol Panah Kanan */}
        <button 
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs border border-slate-300 text-slate-600 transition-all ${currentPage === totalPages ? 'opacity-40 cursor-not-allowed bg-slate-100' : 'bg-white hover:bg-slate-50'}`}
        >
          ❯
        </button>
      </div>

    </div>
  );
};

export default AdminReview;
import React, { useState } from 'react';
// Import Logo & Ikon Resmi KosFinder (Jalur keluar folder pakai ../../)
import LogoKosfinder from '../../assets/Logo-Kosfinder.svg';
import IconEyeAdmin from '../../assets/Icon-Eye-Admin.svg';
import IconPeopleAdmin from '../../assets/Icon-People-Admin.svg';
import IconStarAdmin from '../../assets/Icon-Star-Admin.svg';
import IconChatAdmin from '../../assets/Icon-Chat-Admin.svg';
import IconeDashboardAdmin from '../../assets/Icon-Dashboard-Admin.svg';
import IconUploadAdmin from '../../assets/Icon-Upload-Admin.svg';
import IconReviewAdmin from '../../assets/Icon-Review-Admin.svg';
import IconKosAdmin from '../../assets/Icon-Kos-Admin.svg';
import IconRatingAktivitas from '../../assets/Icon-Rating-Aktivitas.svg';
import IconPeopleAktivitas from '../../assets/Icon-People-Aktivitas.svg';
import IconEditAktivitas from '../../assets/Icon-Edit-Aktivitas.svg';
import IconUploadAktivitas from '../../assets/Icon-Upload-Aktivitas.svg';
import IconStarRating from '../../assets/Icon-Star-Rating.svg';

// IMPORT SUB-HALAMAN BARU YANG SUDAH KITA PISAH
import AdminKosSaya from './AdminKosSaya';
import AdminUpload from './AdminUpload';
import AdminReview from './AdminReview';

const AdminDashboard = ({ onNavigateBack, onNavigateDetail }) => {
  // State untuk menyimpan tab mana yang sedang aktif klik
  const [activeTab, setActiveTab] = useState('dashboard');

  // FUNGSI PENGENDALI: Menentukan halaman mana yang tampil di bawah navbar
  const renderTabContent = () => {
    switch (activeTab) {
      case 'kos':
        // Memanggil file AdminKosSaya.jsx dan memberikan fungsi kembali ke dashboard
        return <AdminKosSaya onNavigateDetail={onNavigateDetail} />;
      case 'upload':
        return <AdminUpload onNavigateDetail={onNavigateDetail} />;
      case 'review':
        return <AdminReview onNavigateDetail={onNavigateDetail} />;
      case 'dashboard':
      default:
        // Ini adalah isi konten halaman Dashboard utama kamu
        return (
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-6 tracking-tight">Dashboard</h1>
            
            {/* GRID 4 KARTU SUMMARY */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-sm min-h-[140px]">
                <div className="text-slate-400"><img src={IconEyeAdmin} className="w-6 h-6" alt="Pengunjung" /></div>
                <div className="mt-4">
                  <span className="text-4xl font-black text-slate-900 block leading-none mb-1">2</span>
                  <span className="text-sm font-bold text-slate-400">Total Pengunjung</span>
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-sm min-h-[140px]">
                <div className="text-slate-400"><img src={IconPeopleAdmin} className="w-6 h-6" alt="Leads" /></div>
                <div className="mt-4">
                  <span className="text-4xl font-black text-slate-900 block leading-none mb-1">1</span>
                  <span className="text-sm font-bold text-slate-400">Total Leads</span>
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-sm min-h-[140px]">
                <div className="text-slate-400"><img src={IconStarAdmin} className="w-6 h-6" alt="Rating" /></div>
                <div className="mt-4">
                  <span className="text-4xl font-black text-slate-900 inline-flex items-center gap-1.5 leading-none mb-1">
                    5.0 <img src={IconStarRating} className="w-6 h-6" alt="Rating" />
                  </span>
                  <span className="text-sm font-bold text-slate-400 block">Rating Rata-rata</span>
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-sm min-h-[140px]">
                <div className="text-slate-400"><img src={IconChatAdmin} className="w-6 h-6" alt="Review" /></div>
                <div className="mt-4">
                  <span className="text-4xl font-black text-slate-900 block leading-none mb-1">1</span>
                  <span className="text-sm font-bold text-slate-400">Total Review</span>
                </div>
              </div>
            </div>

            {/* KARTU AKTIVITAS TERBARU */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
              <h2 className="text-xl font-extrabold text-slate-900 mb-6">Aktivitas Terbaru</h2>
              <div className="mb-8">
                <h3 className="text-base font-bold text-slate-900 mb-4">Hari Ini</h3>
                <div className="flex flex-col">
                  <div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0">
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl mt-0.5"><img src={IconRatingAktivitas} className="w-6 h-6" alt="Ulasan" /></div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">Ulasan Baru</h4>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">
                          Freya memberikan ulasan bintang 5 untuk <span className="font-bold text-slate-700">Kos Melati Putri Residence.</span> <span onClick={() => onNavigateDetail('1')} className="text-blue-600 cursor-pointer hover:underline">lihat detail ulasan</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-xs text-slate-400 font-semibold">2 jam yang lalu</span>
                      <div className="flex gap-1.5">
                        <button onClick={() => onNavigateDetail('1')} className="border border-blue-600 text-blue-600 font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">Lihat</button>
                        <button className="bg-blue-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">Balas</button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0">
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl mt-0.5"><img src={IconPeopleAktivitas} className="w-6 h-6" alt="Leads" /></div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">Leads Baru</h4>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium"><span className="font-bold text-slate-700">Joline</span> tertarik pada <span className="font-bold text-slate-700">Kos Melati Putri Residence.</span> <span className="text-blue-600 cursor-pointer hover:underline">lihat pesan</span></p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-xs text-slate-400 font-semibold">3 jam yang lalu</span>
                      <span className="bg-slate-200 text-slate-600 text-[11px] font-bold px-2.5 py-1 rounded-full border border-slate-300">belum dibaca</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 mb-4">Kemarin</h3>
                <div className="flex flex-col">
                  <div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0">
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl mt-0.5"><img src={IconEditAktivitas} className="w-6 h-6" alt="Edit" /></div>
                      <div className="flex flex-col justify-center">
                        <h4 className="font-bold text-sm text-slate-900 leading-normal">Anda Baru Saja Mengedit Kos Melati Putri Residence</h4>
                        <div onClick={() => onNavigateDetail('1')} className="border border-blue-600 rounded-lg px-2.5 py-1 mt-1 inline-flex items-center w-fit cursor-pointer hover:bg-blue-50 transition-colors">
                          <span className="text-[11px] font-bold text-blue-600">Lihat Detail Halaman Kos ❯</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0"><span className="text-emerald-500 text-sm">✔</span><span className="text-xs text-slate-400 font-semibold">14:03 WIB</span></div>
                  </div>
                  <div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0">
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl mt-0.5"><img src={IconUploadAktivitas} className="w-6 h-6" alt="Upload" /></div>
                      <div className="flex flex-col justify-center">
                        <h4 className="font-bold text-sm text-slate-900 leading-normal">Anda Baru Saja Menambahkan Kos Putri Melati Residence</h4>
                        <div onClick={() => onNavigateDetail('1')} className="border border-blue-600 rounded-lg px-2.5 py-1 mt-1 inline-flex items-center w-fit cursor-pointer hover:bg-blue-50 transition-colors">
                          <span className="text-[11px] font-bold text-blue-600">Lihat Detail Halaman Kos ❯</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0"><img src={IconUploadAktivitas} className="w-4 h-4 text-slate-400" alt="Upload" /><span className="text-xs text-slate-400 font-semibold">11:17 WIB</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased text-slate-800">
      
      {/* HEADER NAVBAR FIXED */}
      <header className="flex items-center justify-between px-12 py-5 bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img src={LogoKosfinder} alt="Logo" className="h-8 md:h-10 w-auto" />
          <span className="ml-2 bg-slate-200 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-slate-300">Admin</span>
        </div>
        <button onClick={onNavigateBack} className="flex items-center gap-2 text-slate-600 font-semibold hover:text-blue-600 transition-colors group">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-200">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Kembali
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-12 py-8">
        
        {/* NAVIGASI MENU UTAMA (4 Tombol Navbar Admin) */}
        <div className="bg-slate-200/80 p-2 rounded-2xl flex gap-2 mb-10 shadow-inner">
          <button onClick={() => setActiveTab('dashboard')} className={`flex items-center justify-center gap-2 flex-1 py-3.5 px-4 rounded-xl font-bold text-sm transition-all ${activeTab === 'dashboard' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}><img src={IconeDashboardAdmin} className="w-6 h-6" alt="" /> Dashboard</button>
          <button onClick={() => setActiveTab('kos')} className={`flex items-center justify-center gap-2 flex-1 py-3.5 px-4 rounded-xl font-bold text-sm transition-all ${activeTab === 'kos' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}><img src={IconKosAdmin} className="w-6 h-6" alt="" /> Kos Saya</button>
          <button onClick={() => setActiveTab('upload')} className={`flex items-center justify-center gap-2 flex-1 py-3.5 px-4 rounded-xl font-bold text-sm transition-all ${activeTab === 'upload' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}><img src={IconUploadAdmin} className="w-6 h-6" alt="" /> Upload</button>
          <button onClick={() => setActiveTab('review')} className={`flex items-center justify-center gap-2 flex-1 py-3.5 px-4 rounded-xl font-bold text-sm transition-all ${activeTab === 'review' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}><img src={IconReviewAdmin} className="w-6 h-6" alt="" /> Review</button>
        </div>

        {/* TEMPAT PEMANGGIL KONTEN HALAMAN SECARA OTOMATIS */}
        {renderTabContent()}

      </main>
    </div>
  );
};

export default AdminDashboard;
import React from 'react';
import LogoKosfinder from '../assets/Logo-Kosfinder.svg';

const RegisterSelect = ({ onNavigateBack, onNavigateToDashboard }) => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased selection:bg-blue-500 selection:text-white">
      {/* Header / Navbar Atas */}
      <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        {/* Bagian Logo yang Sudah Diganti */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={onNavigateBack}>
          <img src={LogoKosfinder} alt="KosFinder+ Logo" className="h-8 md:h-10 w-auto" />
        </div>

        {/* Tombol Kembali Atas */}
        <button 
          onClick={onNavigateBack} 
          className="flex items-center gap-2 text-slate-600 font-semibold hover:text-blue-600 transition-colors duration-200 group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-200">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Kembali
        </button>
      </header>

      {/* Konten Utama */}
      <main className="max-w-6xl mx-auto px-4 py-12 flex flex-col items-center">
        {/* Tombol Kembali di Area Konten */}
        <div className="w-full mb-6 flex justify-start">
          <button 
            onClick={onNavigateBack} 
            className="flex items-center gap-2 text-slate-500 font-medium hover:text-slate-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Kembali
          </button>
        </div>

        {/* Judul Utama */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            Selamat Datang di KosFinder+
          </h1>
          <p className="text-lg text-slate-500 font-medium">
            Pilih cara anda bergabung bersama kami
          </p>
        </div>

        {/* Grid Dua Kartu Pilihan */}
        <div className="grid md:grid-cols-2 gap-8 w-full max-w-5xl">
          
          {/* Kartu 1: Pencari Kos */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col items-center text-center shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1">
            <span className="text-lg font-bold text-slate-400 uppercase tracking-wider mb-1">Masuk sebagai</span>
            <h2 className="text-3xl font-black text-blue-600 mb-6 tracking-tight">Pencari Kos</h2>
            
            {/* Ilustrasi Area */}
            <div className="w-full aspect-[4/3] bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-500 p-6">
              <div className="text-center">
                <p className="text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full inline-block mb-2">Ilustrasi Pencari Kos</p>
                <p className="text-xs text-blue-400">Kamu sedang mencari kamar kos impian</p>
              </div>
            </div>

            <h3 className="text-xl font-bold text-slate-800 mb-2">Saya sedang mencari Kos</h3>
            <p className="text-sm text-slate-500 mb-8 max-w-xs leading-relaxed">
              Temukan kamar kos impian Anda dengan mudah, cepat, dan terpercaya.
            </p>

            <button className="w-full mt-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-[0.98]">
              Masuk / Daftar sebagai Pencari Kos
            </button>
          </div>

          {/* Kartu 2: Pemilik Kos */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col items-center text-center shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1">
            <span className="text-lg font-bold text-slate-400 uppercase tracking-wider mb-1">Masuk sebagai</span>
            <h2 className="text-3xl font-black text-blue-600 mb-6 tracking-tight">Pemilik Kos</h2>
            
            {/* Ilustrasi Area */}
            <div className="w-full aspect-[4/3] bg-orange-50 rounded-2xl flex items-center justify-center mb-6 text-orange-500 p-6">
              <div className="text-center">
                <p className="text-sm font-semibold text-orange-600 bg-orange-100 px-3 py-1 rounded-full inline-block mb-2">Ilustrasi Pemilik Kos</p>
                <p className="text-xs text-orange-400">Kamu sedang mengelola properti kos</p>
              </div>
            </div>

            <h3 className="text-xl font-bold text-slate-800 mb-2">Saya sedang mengelola Kos</h3>
            <p className="text-sm text-slate-500 mb-8 max-w-xs leading-relaxed">
              Kelola dan promosikan properti kos Anda dengan platform terpercaya.
            </p>

            <button 
              onClick={onNavigateToDashboard}
              className="w-full mt-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-[0.98]">
              Masuk / Daftar sebagai Pemilik Kos
            </button>
          </div>

        </div>
      </main>
    </div>
  );
};

export default RegisterSelect;
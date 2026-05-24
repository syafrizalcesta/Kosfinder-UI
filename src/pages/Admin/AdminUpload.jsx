import React, { useState } from 'react';

const AdminUpload = () => {
  // Menyiapkan State Form (Biar inputan bisa diketik)
  const [formData, setFormData] = useState({
    namaKos: '',
    harga: '',
    tipe: '',
    alamat: '',
    deskripsi: '',
    fasilitasInput: '',
    peraturanInput: ''
  });

  // Fungsi untuk membaca ketikan user
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Fungsi pura-pura submit form (Simulasi sebelum dicolok backend)
  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Sukses! Data Kos "${formData.namaKos}" berhasil disimpan di Frontend.`);
    console.log('Data yang siap dikirim ke Backend:', formData);
  };

  return (
    <div>
      {/* JUDUL HALAMAN */}
      <h1 className="text-3xl font-extrabold text-slate-900 mb-6 tracking-tight">
        Upload Kos Baru
      </h1>

      {/* FORM UTAMA */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-8">
        
        {/* ==================== 1. INFORMASI DASAR ==================== */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Informasi Dasar</h2>
          
          {/* Nama Kos */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-700">Nama Kos *</label>
            <input 
              type="text"
              name="namaKos"
              value={formData.namaKos}
              onChange={handleChange}
              placeholder="Contoh: Kos Kurnia Lestari"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-blue-500 focus:bg-white transition-all"
              required
            />
          </div>

          {/* Harga & Tipe (Baris Sejajar) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700">Harga /bulan *</label>
              <input 
                type="number"
                name="harga"
                value={formData.harga}
                onChange={handleChange}
                placeholder="Rp"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-blue-500 focus:bg-white transition-all"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700">Tipe *</label>
              <select 
                name="tipe"
                value={formData.tipe}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-600"
                required
              >
                <option value="">Pilih Tipe Kos</option>
                <option value="Putri">Putri</option>
                <option value="Putra">Putra</option>
                <option value="Campuran">Campuran</option>
              </select>
            </div>
          </div>

          {/* Alamat */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-700">Alamat *</label>
            <input 
              type="text"
              name="alamat"
              value={formData.alamat}
              onChange={handleChange}
              placeholder="Jl. Raya Kampus No. 123, Sukolilo, Surabaya Timur"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-blue-500 focus:bg-white transition-all"
              required
            />
          </div>

          {/* Deskripsi */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-700">Deskripsi *</label>
            <textarea 
              name="deskripsi"
              value={formData.deskripsi}
              onChange={handleChange}
              placeholder="Deskripsikan Kos Anda..."
              rows={5}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-blue-500 focus:bg-white transition-all resize-none"
              required
            />
          </div>
        </div>

        {/* ==================== 2. FOTO & VIDEO ==================== */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Foto & Video</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Box Upload Foto */}
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all min-h-[160px]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-slate-400 mb-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375’ .375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              <span className="text-sm font-bold text-slate-700">Upload Foto</span>
              <span className="text-xs text-slate-400 mt-0.5">Maks. 10 foto (0/10)</span>
            </div>

            {/* Box Upload Video */}
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all min-h-[160px]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-slate-400 mb-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
              <span className="text-sm font-bold text-slate-700">Upload Video</span>
              <span className="text-xs text-slate-400 mt-0.5">Maks. 1 Video</span>
            </div>
          </div>
        </div>

        {/* ==================== 3. FASILITAS ==================== */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Fasilitas</h2>
          
          {/* Gelembung Tag Fasilitas Rekomendasi */}
          <div className="flex flex-wrap gap-2">
            {['WiFi', 'AC', 'Parkir Motor', 'Keamanan 24 Jam', 'Dapur Bersama', 'Listrik Token', 'K. Mandi Dalam'].map((fasilitas, index) => (
              <span 
                key={index}
                className="border border-slate-300 bg-white text-slate-700 text-xs font-bold px-3 py-1.5 rounded-full cursor-pointer hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all"
              >
                {fasilitas}
              </span>
            ))}
          </div>

          {/* Input Ketik Manual Fasilitas */}
          <input 
            type="text"
            name="fasilitasInput"
            value={formData.fasilitasInput}
            onChange={handleChange}
            placeholder="Masukkan Fasilitas Kos Anda..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>

        {/* ==================== 4. PERATURAN KOS (BARU) ==================== */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Peraturan Kos</h2>
          
          {/* Gelembung Tag Peraturan Rekomendasi (Border Kuning Sesuai Gambar Detail Kos) */}
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Dilarang Merokok', icon: '🚭' },
              { label: 'Jam Malam 23.00', icon: '🕒' },
              { label: 'Wanita Only', icon: '🚺' }
            ].map((rule, index) => (
              <span 
                key={index}
                className="border border-amber-300 bg-white text-slate-700 text-xs font-bold px-3 py-1.5 rounded-full cursor-pointer hover:bg-amber-50 hover:text-amber-700 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <span>{rule.icon}</span>
                {rule.label}
              </span>
            ))}
          </div>

          {/* Input Ketik Manual Peraturan */}
          <input 
            type="text"
            name="peraturanInput"
            value={formData.peraturanInput || ''}
            onChange={handleChange}
            placeholder="Masukkan Peraturan Kos Anda..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>

        {/* ==================== TOMBOL ACTION SUBMIT ==================== */}
        <button 
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm"
        >
          {/* Ikon panah ke atas (Upload) */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
          </svg>
          Upload Kos
        </button>

      </form>
    </div>
  );
};

export default AdminUpload;
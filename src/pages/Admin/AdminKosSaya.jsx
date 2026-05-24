import React from 'react';
import IconEditAktivitas from '../../assets/Icon-Edit-Aktivitas.svg';
import IconEditKos from '../../assets/Icon-EditKos.svg';
import IconHapusKos from '../../assets/Icon-HapusKos.svg';

const AdminKosSaya = ({ onNavigateDetail }) => {
  return (
    <div>
      {/* JUDUL HALAMAN */}
      <h1 className="text-3xl font-extrabold text-slate-900 mb-6 tracking-tight">
        Kos Saya
      </h1>
      
      <div className="flex flex-col gap-6">
        {/* ==================== KARTU KOS 1: TIPE PUTRI ==================== */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col md:flex-row gap-6 shadow-sm overflow-hidden">
          <div className="w-full md:w-64 h-44 shrink-0 rounded-2xl overflow-hidden">
            <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500" className="w-full h-full object-cover" alt="Kos Putri" />
          </div>
          <div className="flex-1 flex flex-col justify-between py-1">
            <div>
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-extrabold text-slate-900">Kos Melati Putri Residence</h2>
                <span className="bg-blue-600 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm">Aktif</span>
              </div>
              <p className="text-blue-600 font-extrabold text-base mt-1">Rp 1.200.000<span className="text-slate-400 font-normal text-xs">/bulan</span></p>
              
              <div className="flex flex-wrap gap-2 mt-3">
                {['WiFi', 'AC', 'Parkir Motor', 'Keamanan 24 Jam', 'Dapur Bersama'].map((f, i) => (
                  <span key={i} className="border border-slate-300 text-slate-600 font-semibold text-xs px-2.5 py-1 rounded-full bg-gray-50">{f}</span>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-4 mt-4 pt-4 border-t border-slate-100">
              <div className="flex gap-12">
                <div><span className="text-xs text-slate-400 font-bold block">Pengunjung</span><span className="text-xl font-black text-slate-900">0</span></div>
                <div><span className="text-xs text-slate-400 font-bold block">Leads</span><span className="text-xl font-black text-slate-900">0</span></div>
                <div><span className="text-xs text-slate-400 font-bold block">Tipe</span><span className="text-base font-black text-slate-900">Putri</span></div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onNavigateDetail('1')} className="border border-slate-300 hover:border-slate-400 font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all bg-white text-slate-700">
                  <img src={IconEditKos} className="w-3.5 h-3.5" alt="" /> Edit
                </button>
                <button className="border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all">
                  <img src={IconHapusKos} className="w-3.5 h-3.5" alt="" /> Hapus
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== KARTU KOS 2: TIPE PUTRA ==================== */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col md:flex-row gap-6 shadow-sm overflow-hidden">
          <div className="w-full md:w-64 h-44 shrink-0 rounded-2xl overflow-hidden">
            <img src="https://images.unsplash.com/photo-1505693314120-0d443867891c?w=500" className="w-full h-full object-cover" alt="Kos Putra" />
          </div>
          <div className="flex-1 flex flex-col justify-between py-1">
            <div>
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-extrabold text-slate-900">Kos Melati Putra Residence</h2>
                <span className="bg-blue-600 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm">Aktif</span>
              </div>
              <p className="text-blue-600 font-extrabold text-base mt-1">Rp 1.200.000<span className="text-slate-400 font-normal text-xs">/bulan</span></p>
              
              <div className="flex flex-wrap gap-2 mt-3">
                {['WiFi', 'AC', 'Parkir Motor', 'Keamanan 24 Jam', 'Dapur Bersama'].map((f, i) => (
                  <span key={i} className="border border-slate-300 text-slate-600 font-semibold text-xs px-2.5 py-1 rounded-full bg-gray-50">{f}</span>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-4 mt-4 pt-4 border-t border-slate-100">
              <div className="flex gap-12">
                <div><span className="text-xs text-slate-400 font-bold block">Pengunjung</span><span className="text-xl font-black text-slate-900">0</span></div>
                <div><span className="text-xs text-slate-400 font-bold block">Leads</span><span className="text-xl font-black text-slate-900">0</span></div>
                <div><span className="text-xs text-slate-400 font-bold block">Tipe</span><span className="text-base font-black text-slate-900">Putra</span></div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onNavigateDetail('1')} className="border border-slate-300 hover:border-slate-400 font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all bg-white text-slate-700">
                  <img src={IconEditKos} className="w-3.5 h-3.5" alt="" /> Edit
                </button>
                <button className="border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all">
                  <img src={IconHapusKos} className="w-3.5 h-3.5" alt="" /> Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminKosSaya;
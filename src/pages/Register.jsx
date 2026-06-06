import React, { useState } from 'react';
import LogoKosfinder from '../assets/Logo-Kosfinder.svg';

const RegisterPencari = ({ onNavigateBack, onNavigateToLogin }) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [nomorTelepon, setNomorTelepon] = useState('');

  // ==========================================================
  // TAHAP 1: VALIDASI EMAIL & PASSWORD
  // ==========================================================
  const handleStep1Submit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.endsWith('@gmail.com')) {
      setErrorMessage('Email harus menggunakan domain @gmail.com');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Password dan Konfirmasi Password tidak cocok!');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password minimal 6 karakter.');
      return;
    }

    setStep(2);
  };

  // ==========================================================
  // TAHAP 2: REGISTRASI FINAL KE DATABASE
  // ==========================================================
  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (nomorTelepon.length < 10) {
      setErrorMessage('Nomor WhatsApp terlalu pendek (minimal 10 angka).');
      return;
    }
    if (!nomorTelepon.startsWith('08') && !nomorTelepon.startsWith('62')) {
      setErrorMessage('Nomor WhatsApp harus diawali dengan 08 atau 62.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          user_name: userName,
          email: email,
          password: password,
          phone_whatsapp: nomorTelepon,
          role: 'pencari'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Terjadi kesalahan saat mendaftar.');
      }

      alert('Pendaftaran Berhasil! Silakan Login dengan akun baru Anda.');
      onNavigateToLogin();

    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased">
      <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2 cursor-pointer" onClick={onNavigateBack}>
          <img src={LogoKosfinder} alt="KosFinder+ Logo" className="h-8 md:h-10 w-auto" />
        </div>
      </header>

      <main className="max-w-lg w-full mx-auto px-4 py-10 flex flex-col">
        <button
          onClick={step === 1 ? onNavigateBack : () => setStep(step - 1)}
          className="flex items-center gap-2 text-slate-700 font-medium hover:text-blue-600 transition-colors mb-6 self-start"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Kembali
        </button>

        <div className="bg-white border border-gray-200 rounded-3xl p-8 md:p-10 shadow-sm w-full transition-all duration-300">

          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
              {step === 1 ? "Daftar Akun" : "Lengkapi Profil"}
            </h1>
            <p className="text-gray-500">
              {step === 1 ? "Mulai perjalanan mencari kos impianmu" : "Satu langkah lagi untuk selesai"}
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm font-semibold text-red-700">{errorMessage}</p>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-5 animate-fadeIn">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#E8E8E8] text-gray-800 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="contoh@gmail.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#E8E8E8] text-gray-800 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">Konfirmasi Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#E8E8E8] text-gray-800 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full text-white font-bold py-3.5 rounded-xl transition-colors mt-4 bg-blue-600 hover:bg-blue-700"
              >
                Lanjutkan
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-5 animate-fadeIn">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">Nama Lengkap</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-[#E8E8E8] text-gray-800 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan Nama Anda"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">Nomor Telepon / WA</label>
                <input
                  type="text"
                  value={nomorTelepon}
                  onChange={(e) => setNomorTelepon(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-[#E8E8E8] text-gray-800 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="081234567890"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full text-white font-bold py-3.5 rounded-xl transition-colors mt-4 ${isLoading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
              >
                {isLoading ? "Menyimpan..." : "Selesaikan Pendaftaran"}
              </button>
            </form>
          )}

        </div>
      </main>
    </div>
  );
};

export default RegisterPencari;
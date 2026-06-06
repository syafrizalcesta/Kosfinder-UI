import React, { useState } from 'react';
import LogoKosfinder from '../assets/Logo-Kosfinder.svg';

// Tambah prop baru: onLoginAsAdmin
const LoginPencari = ({ onNavigateBack, onNavigateToRegister, onLoginSuccess, onLoginAsAdmin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // 1. VALIDASI FRONTEND
    if (!email.endsWith('@gmail.com')) {
      setErrorMessage('Email harus menggunakan domain @gmail.com');
      return;
    }

    // 2. VALIDASI BACKEND
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error('Email atau Password yang Anda masukkan salah.');
      }

      // Simpan token & data user ke localStorage (sama seperti sebelumnya)
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // 3. ROUTING BERDASARKAN ROLE
      const role = data.user.role;

      if (role === 'admin') {
        // Admin langsung ke DashboardAdmin, tanpa alert
        if (onLoginAsAdmin) {
          onLoginAsAdmin();
        }
      } else {
        // Pencari & pemilik kos tetap seperti sebelumnya
        alert(`Login Berhasil! Selamat datang kembali, ${data.user.user_name}.`);
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      }

    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    alert('Mohon maaf, fitur Login dengan Google saat ini sedang dalam masa pengembangan. Silakan gunakan email dan password manual untuk sementara waktu ya! 🛠️');
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
          onClick={onNavigateBack} 
          className="flex items-center gap-2 text-slate-700 font-medium hover:text-blue-600 transition-colors mb-6 self-start"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Kembali
        </button>

        <div className="bg-white border border-gray-200 rounded-3xl p-8 md:p-10 shadow-sm w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Selamat Datang</h1>
            <p className="text-gray-500">Login atau daftar untuk mencari kos</p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm font-semibold text-red-700">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">Email</label>
              <div className="relative flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#E8E8E8] text-gray-800 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="contoh@gmail.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">Password</label>
              <div className="relative flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#E8E8E8] text-gray-800 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full text-white font-bold py-3.5 rounded-xl transition-colors mt-2 flex justify-center items-center gap-2 
                ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          <div className="relative flex py-6 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">Atau</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <button 
            type="button" 
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 font-bold py-3.5 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            Lanjutkan dengan Google
          </button>

          <p className="text-center mt-6 text-gray-700">
            Belum punya akun? <button onClick={onNavigateToRegister} className="text-blue-600 font-semibold hover:underline italic">daftar disini</button>
          </p>
        </div>
      </main>
    </div>
  );
};

export default LoginPencari;
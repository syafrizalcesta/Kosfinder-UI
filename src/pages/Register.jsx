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
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Countdown timer untuk resend OTP
  React.useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // ==========================================================
  // TAHAP 1: VALIDASI EMAIL & PASSWORD → KIRIM OTP
  // ==========================================================
  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Format email tidak valid. Contoh: nama@email.com');
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

    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal mengirim OTP.');
      }

      setResendCooldown(60);
      setStep(2);

    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================================
  // TAHAP 2: VERIFIKASI OTP
  // ==========================================================
  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (otp.length !== 4) {
      setErrorMessage('Kode OTP harus 4 digit.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'OTP tidak valid.');
      }

      setStep(3);

    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Kirim ulang OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setErrorMessage('');
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Gagal mengirim ulang OTP.');

      setOtp('');
      setResendCooldown(60);

    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================================
  // TAHAP 3: REGISTRASI FINAL KE DATABASE
  // ==========================================================
  const handleStep3Submit = async (e) => {
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
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
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

  const stepTitles = {
    1: { title: 'Daftar Akun', subtitle: 'Mulai perjalanan mencari kos impianmu' },
    2: { title: 'Verifikasi Email', subtitle: `Kode OTP dikirim ke ${email}` },
    3: { title: 'Lengkapi Profil', subtitle: 'Satu langkah lagi untuk selesai' },
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
          onClick={step === 1 ? onNavigateBack : () => { setErrorMessage(''); setStep(step - 1); }}
          className="flex items-center gap-2 text-slate-700 font-medium hover:text-blue-600 transition-colors mb-6 self-start"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Kembali
        </button>

        <div className="bg-white border border-gray-200 rounded-3xl p-8 md:p-10 shadow-sm w-full transition-all duration-300">

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                  ${step === s ? 'bg-blue-600 text-white' : step > s ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                  {step > s ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : s}
                </div>
                {s < 3 && <div className={`h-0.5 w-10 transition-colors ${step > s ? 'bg-green-500' : 'bg-gray-200'}`} />}
              </React.Fragment>
            ))}
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{stepTitles[step].title}</h1>
            <p className="text-gray-500 text-sm">{stepTitles[step].subtitle}</p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm font-semibold text-red-700">{errorMessage}</p>
            </div>
          )}

          {/* STEP 1: Email & Password */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#E8E8E8] text-gray-800 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="contoh@email.com"
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
                disabled={isLoading}
                className={`w-full text-white font-bold py-3.5 rounded-xl transition-colors mt-4 flex justify-center items-center gap-2
                  ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Mengirim OTP...
                  </>
                ) : 'Lanjutkan'}
              </button>
            </form>
          )}

          {/* STEP 2: Verifikasi OTP */}
          {step === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">Kode OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="w-full bg-[#E8E8E8] text-gray-800 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl font-bold tracking-widest"
                  placeholder="----"
                  maxLength={4}
                  required
                />
                <p className="text-xs text-gray-400 text-center">Masukkan 4 digit kode yang dikirim ke email kamu</p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full text-white font-bold py-3.5 rounded-xl transition-colors flex justify-center items-center gap-2
                  ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memverifikasi...
                  </>
                ) : 'Verifikasi OTP'}
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Tidak menerima kode?{' '}
                  {resendCooldown > 0 ? (
                    <span className="text-gray-400 font-semibold">Kirim ulang ({resendCooldown}s)</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isLoading}
                      className="text-blue-600 font-semibold hover:underline"
                    >
                      Kirim ulang
                    </button>
                  )}
                </p>
              </div>
            </form>
          )}

          {/* STEP 3: Nama & Nomor WA */}
          {step === 3 && (
            <form onSubmit={handleStep3Submit} className="space-y-5">
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
                className={`w-full text-white font-bold py-3.5 rounded-xl transition-colors mt-4 flex justify-center items-center gap-2
                  ${isLoading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Menyimpan...
                  </>
                ) : 'Selesaikan Pendaftaran'}
              </button>
            </form>
          )}

          {step === 1 && (
            <p className="text-center mt-6 text-gray-700">
              Sudah punya akun? <button onClick={onNavigateToLogin} className="text-blue-600 font-semibold hover:underline italic">login disini</button>
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default RegisterPencari;
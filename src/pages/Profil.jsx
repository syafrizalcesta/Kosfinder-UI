import React, { useState, useEffect, useRef } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// ─── ICONS ───────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);
const IC = {
  back:   "M19 12H5M12 5l-7 7 7 7",
  camera: ["M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z","M12 17a4 4 0 100-8 4 4 0 000 8z"],
  edit:   ["M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7","M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"],
  user:   ["M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2","M12 11a4 4 0 100-8 4 4 0 000 8z"],
  phone:  "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.02 1.18 2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.11 7.94a16 16 0 006 6l1.21-1.21a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z",
  shield: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"],
  upload: ["M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4","M17 8l-5-5-5 5","M12 3v12"],
  check:  "M20 6L9 17l-5-5",
  clock:  ["M12 22a10 10 0 100-20 10 10 0 000 20z","M12 6v6l4 2"],
  star:   "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  x:      "M18 6L6 18M6 6l12 12",
  save:   ["M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z","M17 21v-8H7v8","M7 3v5h8"],
  id:     ["M2 3h20v14H2z","M8 21h8","M12 17v4"],
  lock:   ["M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z","M7 11V7a5 5 0 0110 0v4"],
  eye:    ["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z","M12 15a3 3 0 100-6 3 3 0 000 6z"],
  eyeoff: ["M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94","M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19","M1 1l22 22"],
  email:  ["M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z","M22 6l-10 7L2 6"],
};

// ─── TOAST ───────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  const bg = { success: '#16a34a', error: '#dc2626', info: '#2563eb' }[type] || '#2563eb';
  return (
    <div style={{
      position:'fixed', bottom:28, left:'50%', transform:'translateX(-50%)',
      background: bg, color:'#fff', padding:'11px 20px', borderRadius:10,
      fontWeight:600, fontSize:14, boxShadow:'0 4px 24px rgba(0,0,0,0.15)',
      zIndex:9999, display:'flex', alignItems:'center', gap:8, whiteSpace:'nowrap',
      animation:'slideUp 0.25s ease'
    }}>
      <Icon d={type === 'error' ? IC.x : IC.check} size={15} />
      {message}
    </div>
  );
}

// ─── CARD ─────────────────────────────────────────────────────────────────────
function Card({ children, style = {} }) {
  return (
    <div style={{
      background:'#fff', borderRadius:12, border:'1px solid #e5e7eb',
      boxShadow:'0 1px 4px rgba(0,0,0,0.06)', padding:'24px', marginBottom:16, ...style
    }}>
      {children}
    </div>
  );
}

// ─── SECTION HEADER ──────────────────────────────────────────────────────────
function SectionHeader({ title, action }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
      <h3 style={{ fontSize:13, fontWeight:700, color:'#6b7280', letterSpacing:'0.05em', textTransform:'uppercase' }}>{title}</h3>
      {action}
    </div>
  );
}

// ─── FIELD ───────────────────────────────────────────────────────────────────
function Field({ label, icon, value, onChange, type = 'text', placeholder, disabled, hint, rightEl }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom:16 }}>
      <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#374151', marginBottom:5 }}>{label}</label>
      <div style={{
        display:'flex', alignItems:'center', gap:8,
        border:`1.5px solid ${focused ? '#2563eb' : '#d1d5db'}`,
        borderRadius:8, padding:'9px 12px',
        background: disabled ? '#f9fafb' : '#fff',
        transition:'border-color 0.15s, box-shadow 0.15s',
        boxShadow: focused ? '0 0 0 3px rgba(37,99,235,0.1)' : 'none'
      }}>
        <span style={{ color: focused ? '#2563eb' : '#9ca3af', flexShrink:0 }}><Icon d={icon} size={15} /></span>
        <input
          type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ flex:1, border:'none', outline:'none', background:'transparent', fontSize:14, color: disabled ? '#9ca3af' : '#111827', fontFamily:'inherit' }}
        />
        {rightEl}
      </div>
      {hint && <p style={{ fontSize:11, color:'#9ca3af', marginTop:4 }}>{hint}</p>}
    </div>
  );
}

// ─── AVATAR ──────────────────────────────────────────────────────────────────
function Avatar({ user, avatarUrl, onAvatarChange, isUploading }) {
  const ref = useRef();
  const initials = user?.user_name ? user.user_name.slice(0, 2).toUpperCase() : '??';
  return (
    <div style={{ position:'relative', width:88, height:88, flexShrink:0 }}>
      <div style={{
        width:88, height:88, borderRadius:'50%',
        background: avatarUrl ? 'transparent' : 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:28, fontWeight:700, color:'#fff', overflow:'hidden',
        border:'3px solid #e5e7eb'
      }}>
        {avatarUrl ? <img src={avatarUrl} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : initials}
      </div>
      <button onClick={() => ref.current?.click()} disabled={isUploading} style={{
        position:'absolute', bottom:0, right:0, width:26, height:26, borderRadius:'50%',
        background: isUploading ? '#93c5fd' : '#2563eb', border:'2.5px solid #fff',
        cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff'
      }}>
        {isUploading
          ? <div style={{ width:11, height:11, border:'2px solid #fff', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
          : <Icon d={IC.camera} size={12} />
        }
      </button>
      <input ref={ref} type="file" accept="image/*" style={{ display:'none' }}
        onChange={e => e.target.files[0] && onAvatarChange(e.target.files[0])} />
    </div>
  );
}

// ─── DROP ZONE ───────────────────────────────────────────────────────────────
function DropZone({ label, sublabel, file, onChange, icon }) {
  const [hover, setHover] = useState(false);
  const ref = useRef();
  return (
    <div onClick={() => ref.current?.click()}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        border:`2px dashed ${file ? '#16a34a' : hover ? '#2563eb' : '#d1d5db'}`,
        borderRadius:10, padding:'24px 16px', textAlign:'center', cursor:'pointer',
        background: file ? '#f0fdf4' : hover ? '#eff6ff' : '#fafafa', transition:'all 0.15s'
      }}>
      <input ref={ref} type="file" accept="image/*" style={{ display:'none' }} onChange={onChange} />
      <div style={{ color: file ? '#16a34a' : hover ? '#2563eb' : '#9ca3af', marginBottom:6 }}>
        {file ? <Icon d={IC.check} size={28} /> : <Icon d={icon} size={28} />}
      </div>
      <p style={{ fontWeight:700, fontSize:13, color: file ? '#15803d' : '#374151', margin:'0 0 3px' }}>{label}</p>
      <p style={{ fontSize:11, color:'#6b7280', margin:0 }}>{file ? file.name : sublabel}</p>
    </div>
  );
}

// ─── STATUS BADGE ────────────────────────────────────────────────────────────
function StatusBadge({ status, role }) {
  const map = {
    pemilik:  { label:'Pemilik Kos',          bg:'#dcfce7', color:'#15803d' },
    pencari:  { label:'Pencari Kos',           bg:'#dbeafe', color:'#1d4ed8' },
    pending:  { label:'Menunggu Verifikasi',   bg:'#fef9c3', color:'#a16207' },
    verified: { label:'Terverifikasi',         bg:'#dcfce7', color:'#15803d' },
    rejected: { label:'Ditolak',               bg:'#fee2e2', color:'#b91c1c' },
  };
  const cfg = map[status] || map[role] || map.pencari;
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:5,
      background: cfg.bg, color: cfg.color,
      padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:600
    }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background:cfg.color, display:'inline-block' }} />
      {cfg.label}
    </span>
  );
}

// ─── BTN ─────────────────────────────────────────────────────────────────────
function Btn({ onClick, disabled, loading, children, variant = 'primary', style: s = {} }) {
  const base = {
    display:'flex', alignItems:'center', justifyContent:'center', gap:6,
    border:'none', borderRadius:8, padding:'10px 18px', fontWeight:600, fontSize:14,
    cursor: disabled || loading ? 'not-allowed' : 'pointer', fontFamily:'inherit',
    transition:'background 0.15s', ...s
  };
  const variants = {
    primary: { background: disabled || loading ? '#93c5fd' : '#2563eb', color:'#fff' },
    ghost:   { background:'#f3f4f6', color:'#374151' },
    danger:  { background: disabled || loading ? '#fca5a5' : '#dc2626', color:'#fff' },
  };
  return (
    <button onClick={onClick} disabled={disabled || loading} style={{ ...base, ...variants[variant] }}>
      {loading && <div style={{ width:14, height:14, border:'2px solid currentColor', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />}
      {children}
    </button>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
export default function Profil({ onNavigateBack }) {
  const [user, setUser]           = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);

  // Edit profil
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm]     = useState({ user_name:'', phone_whatsapp:'' });
  const [isSaving, setIsSaving]     = useState(false);

  // Ubah password
  const [isPassMode, setIsPassMode]   = useState(false);
  const [passForm, setPassForm]       = useState({ current_password:'', new_password:'', confirm_password:'' });
  const [showPass, setShowPass]       = useState({ current:false, new:false, confirm:false });
  const [isSavingPass, setIsSavingPass] = useState(false);

  // Upgrade akun
  const [isUpgradeMode, setIsUpgradeMode] = useState(false);
  const [ktpFile, setKtpFile]             = useState(null);
  const [selfieFile, setSelfieFile]       = useState(null);
  const [isSubmitting, setIsSubmitting]   = useState(false);

  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => setToast({ message, type });

  useEffect(() => {
    const s = localStorage.getItem('user');
    if (s) {
      const u = JSON.parse(s);
      setUser(u);
      setEditForm({ user_name: u.user_name || '', phone_whatsapp: u.phone_whatsapp || '' });
      if (u.avatar_url) setAvatarUrl(u.avatar_url);
    }
  }, []);

  // ── Avatar ──
  const handleAvatarChange = async (file) => {
    setAvatarUrl(URL.createObjectURL(file));
    setIsAvatarUploading(true);
    const fd = new FormData(); fd.append('avatar', file);
    try {
      const r = await fetch(`${API_BASE}/update-avatar`, {
        method:'POST', headers:{ Authorization:`Bearer ${localStorage.getItem('token')}`, Accept:'application/json' }, body:fd
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message);
      const upd = { ...user, avatar_url: d.avatar_url };
      setUser(upd); localStorage.setItem('user', JSON.stringify(upd));
      showToast('Foto profil berhasil diperbarui.');
    } catch (e) { showToast(e.message, 'error'); }
    finally { setIsAvatarUploading(false); }
  };

  // ── Simpan profil ──
  const handleSaveProfile = async () => {
    if (!editForm.user_name.trim()) return showToast('Nama tidak boleh kosong.', 'error');

    // Validasi: cek jika nomor telepon berbeda dari nomor saat ini
    const newPhone = editForm.phone_whatsapp.trim();
    const currentPhone = (user.phone_whatsapp || '').trim();

    if (newPhone && newPhone !== currentPhone) {
      // Format check
      if (!/^(08|62)\d{8,12}$/.test(newPhone)) {
        return showToast('Format nomor tidak valid. Gunakan 08xx atau 62xx.', 'error');
      }

      // Cek duplikasi nomor ke server
      setIsSaving(true);
      try {
        const checkRes = await fetch(`${API_BASE}/check-phone`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ phone_whatsapp: newPhone }),
        });
        const checkData = await checkRes.json();
        if (!checkRes.ok) throw new Error(checkData.message);
        if (checkData.exists) {
          setIsSaving(false);
          return showToast('Nomor WhatsApp sudah digunakan oleh akun lain.', 'error');
        }
      } catch (e) {
        setIsSaving(false);
        // Jika endpoint check-phone tidak tersedia, lanjutkan dan biarkan server menolak saat save
        if (!e.message.includes('already') && !e.message.includes('sudah')) {
          // Lanjut ke proses simpan, biarkan server validasi
        } else {
          return showToast(e.message, 'error');
        }
      }
    }

    setIsSaving(true);
    try {
      const r = await fetch(`${API_BASE}/update-profile`, {
        method:'PUT',
        headers:{ Authorization:`Bearer ${localStorage.getItem('token')}`, 'Content-Type':'application/json', Accept:'application/json' },
        body: JSON.stringify(editForm)
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message);
      const upd = { ...user, ...editForm };
      setUser(upd); localStorage.setItem('user', JSON.stringify(upd));
      setIsEditMode(false);
      showToast('Profil berhasil diperbarui.');
    } catch (e) {
      // Tangkap pesan error duplikasi nomor dari server
      const msg = e.message.toLowerCase();
      if (msg.includes('phone') || msg.includes('telepon') || msg.includes('whatsapp') || msg.includes('nomor')) {
        showToast('Nomor WhatsApp sudah digunakan oleh akun lain.', 'error');
      } else {
        showToast(e.message, 'error');
      }
    }
    finally { setIsSaving(false); }
  };

  // ── Ubah password ──
  const handleChangePassword = async () => {
    if (!passForm.current_password) return showToast('Masukkan password saat ini.', 'error');
    if (passForm.new_password.length < 6) return showToast('Password baru minimal 6 karakter.', 'error');
    if (passForm.new_password !== passForm.confirm_password) return showToast('Konfirmasi password tidak cocok.', 'error');
    setIsSavingPass(true);
    try {
      const r = await fetch(`${API_BASE}/change-password`, {
        method:'PUT',
        headers:{ Authorization:`Bearer ${localStorage.getItem('token')}`, 'Content-Type':'application/json', Accept:'application/json' },
        body: JSON.stringify({ current_password: passForm.current_password, new_password: passForm.new_password })
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message);
      setPassForm({ current_password:'', new_password:'', confirm_password:'' });
      setIsPassMode(false);
      showToast('Password berhasil diubah.');
    } catch (e) { showToast(e.message, 'error'); }
    finally { setIsSavingPass(false); }
  };

  // ── Upgrade akun ──
  const handleUpgradeSubmit = async () => {
    if (!ktpFile || !selfieFile) return showToast('Harap unggah foto KTP dan Selfie.', 'error');
    setIsSubmitting(true);
    const fd = new FormData(); fd.append('ktp_image', ktpFile); fd.append('selfie_image', selfieFile);
    try {
      const r = await fetch(`${API_BASE}/upgrade-account`, {
        method:'POST', headers:{ Authorization:`Bearer ${localStorage.getItem('token')}`, Accept:'application/json' }, body:fd
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message);
      setUser(d.user); localStorage.setItem('user', JSON.stringify(d.user));
      setIsUpgradeMode(false);
      showToast('Dokumen terkirim! Verifikasi 1×24 jam.');
    } catch (e) { showToast(e.message, 'error'); }
    finally { setIsSubmitting(false); }
  };

  const togglePass = (field) => setShowPass(p => ({ ...p, [field]: !p[field] }));
  const EyeBtn = ({ field }) => (
    <button type="button" onClick={() => togglePass(field)}
      style={{ background:'none', border:'none', cursor:'pointer', color:'#9ca3af', padding:0, display:'flex' }}>
      <Icon d={showPass[field] ? IC.eyeoff : IC.eye} size={15} />
    </button>
  );

  if (!user) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center', color:'#6b7280', fontFamily:'system-ui' }}>
        <div style={{ width:36, height:36, border:'3px solid #e5e7eb', borderTopColor:'#2563eb', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 10px' }} />
        Memuat profil...
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes slideUp { from { opacity:0; transform:translateX(-50%) translateY(12px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
      `}</style>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div style={{ minHeight:'100vh', background:'#f3f4f6', fontFamily:"'Inter', system-ui, sans-serif" }}>

        {/* ── HEADER ── */}
        <header style={{
          display:'flex', alignItems:'center', padding:'0 24px', height:56,
          background:'#fff', borderBottom:'1px solid #e5e7eb',
          position:'sticky', top:0, zIndex:100
        }}>
          <button onClick={onNavigateBack} style={{
            display:'flex', alignItems:'center', gap:6, color:'#374151',
            background:'none', border:'none', cursor:'pointer', fontWeight:500,
            fontSize:14, padding:'6px 10px', borderRadius:6, fontFamily:'inherit'
          }}>
            <Icon d={IC.back} size={17} /> Kembali
          </button>
          <h1 style={{ position:'absolute', left:'50%', transform:'translateX(-50%)', fontSize:15, fontWeight:700, color:'#111827' }}>
            Profil Saya
          </h1>
        </header>

        {/* ── BODY ── */}
        <div style={{ maxWidth:960, margin:'0 auto', padding:'28px 20px 60px' }}>

          {/* Desktop: 2-column grid */}
          <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)', gap:16, alignItems:'start' }}
               className="profil-grid">

            {/* ── LEFT COLUMN ── */}
            <div>
              {/* Hero Card */}
              <Card>
                <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:18 }}>
                  <Avatar user={user} avatarUrl={avatarUrl} onAvatarChange={handleAvatarChange} isUploading={isAvatarUploading} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <h2 style={{ fontSize:18, fontWeight:700, color:'#111827', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                      {user.user_name}
                    </h2>
                    <p style={{ fontSize:13, color:'#6b7280', marginTop:2, marginBottom:8 }}>{user.email}</p>
                    <StatusBadge status={user.verification_status} role={user.role} />
                  </div>
                </div>

                {/* Info rows */}
                {[
                  { icon: IC.user,   label:'Nama',         val: user.user_name },
                  { icon: IC.email,  label:'Email',        val: user.email },
                  { icon: IC.phone,  label:'WhatsApp',     val: user.phone_whatsapp || '—' },
                  { icon: IC.star,   label:'Peran',        val: user.role === 'pemilik' ? 'Pemilik Kos' : 'Pencari Kos' },
                ].map(({ icon, label, val }) => (
                  <div key={label} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0', borderTop:'1px solid #f3f4f6' }}>
                    <span style={{ color:'#9ca3af' }}><Icon d={icon} size={14} /></span>
                    <span style={{ fontSize:13, color:'#9ca3af', width:80, flexShrink:0 }}>{label}</span>
                    <span style={{ fontSize:13, fontWeight:500, color:'#111827', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{val}</span>
                  </div>
                ))}

                {/* Action buttons */}
                <div style={{ display:'flex', gap:8, marginTop:18 }}>
                  <Btn onClick={() => { setIsEditMode(true); setIsPassMode(false); }} variant="ghost" style={{ flex:1 }}>
                    <Icon d={IC.edit} size={14} /> Edit Profil
                  </Btn>
                  <Btn onClick={() => { setIsPassMode(true); setIsEditMode(false); }} variant="ghost" style={{ flex:1 }}>
                    <Icon d={IC.lock} size={14} /> Ubah Password
                  </Btn>
                </div>
              </Card>

              {/* Upgrade Banner (mobile: shown here too, desktop: right col) */}
              {user.role === 'pencari' && !isUpgradeMode && (
                <div style={{ display:'none' }} className="upgrade-mobile">
                  <UpgradeBanner user={user} onUpgrade={() => setIsUpgradeMode(true)} />
                </div>
              )}
            </div>

            {/* ── RIGHT COLUMN ── */}
            <div>
              {/* Edit Profil Form */}
              {isEditMode && (
                <Card style={{ animation:'fadeIn 0.2s ease', border:'1.5px solid #bfdbfe' }}>
                  <SectionHeader title="Edit Data Diri"
                    action={
                      <button onClick={() => setIsEditMode(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#9ca3af' }}>
                        <Icon d={IC.x} size={17} />
                      </button>
                    }
                  />
                  <Field label="Nama Pengguna" icon={IC.user} value={editForm.user_name}
                    onChange={e => setEditForm(f => ({ ...f, user_name: e.target.value }))}
                    placeholder="Nama lengkap" />
                  <Field label="No. WhatsApp" icon={IC.phone} value={editForm.phone_whatsapp}
                    onChange={e => setEditForm(f => ({ ...f, phone_whatsapp: e.target.value }))}
                    placeholder="08xx atau 62xx" hint="Format: 08xxxxxxxx atau 62xxxxxxxx" />
                  <Field label="Email" icon={IC.email} value={user.email} disabled hint="Email tidak dapat diubah" />
                  <div style={{ display:'flex', gap:8, marginTop:4 }}>
                    <Btn onClick={() => setIsEditMode(false)} variant="ghost" style={{ flex:1 }}>Batal</Btn>
                    <Btn onClick={handleSaveProfile} loading={isSaving} style={{ flex:2 }}>
                      <Icon d={IC.save} size={14} /> Simpan Perubahan
                    </Btn>
                  </div>
                </Card>
              )}

              {/* Ubah Password Form */}
              {isPassMode && (
                <Card style={{ animation:'fadeIn 0.2s ease', border:'1.5px solid #bfdbfe' }}>
                  <SectionHeader title="Ubah Password"
                    action={
                      <button onClick={() => { setIsPassMode(false); setPassForm({ current_password:'', new_password:'', confirm_password:'' }); }}
                        style={{ background:'none', border:'none', cursor:'pointer', color:'#9ca3af' }}>
                        <Icon d={IC.x} size={17} />
                      </button>
                    }
                  />
                  <Field label="Password Saat Ini" icon={IC.lock}
                    type={showPass.current ? 'text' : 'password'}
                    value={passForm.current_password}
                    onChange={e => setPassForm(f => ({ ...f, current_password: e.target.value }))}
                    placeholder="Masukkan password lama"
                    rightEl={<EyeBtn field="current" />}
                  />
                  <Field label="Password Baru" icon={IC.lock}
                    type={showPass.new ? 'text' : 'password'}
                    value={passForm.new_password}
                    onChange={e => setPassForm(f => ({ ...f, new_password: e.target.value }))}
                    placeholder="Minimal 6 karakter"
                    hint="Minimal 6 karakter"
                    rightEl={<EyeBtn field="new" />}
                  />
                  <Field label="Konfirmasi Password Baru" icon={IC.lock}
                    type={showPass.confirm ? 'text' : 'password'}
                    value={passForm.confirm_password}
                    onChange={e => setPassForm(f => ({ ...f, confirm_password: e.target.value }))}
                    placeholder="Ulangi password baru"
                    rightEl={<EyeBtn field="confirm" />}
                  />

                  {/* Strength indicator */}
                  {passForm.new_password && (
                    <div style={{ marginBottom:16 }}>
                      <div style={{ display:'flex', gap:4, marginBottom:4 }}>
                        {[1,2,3,4].map(i => {
                          const len = passForm.new_password.length;
                          const hasUpper = /[A-Z]/.test(passForm.new_password);
                          const hasNum = /[0-9]/.test(passForm.new_password);
                          const score = (len >= 6 ? 1 : 0) + (len >= 10 ? 1 : 0) + (hasUpper ? 1 : 0) + (hasNum ? 1 : 0);
                          const colors = ['#ef4444','#f97316','#eab308','#16a34a'];
                          return <div key={i} style={{ flex:1, height:3, borderRadius:2, background: i <= score ? colors[score-1] : '#e5e7eb', transition:'background 0.2s' }} />;
                        })}
                      </div>
                      <p style={{ fontSize:11, color:'#6b7280' }}>
                        {(() => {
                          const len = passForm.new_password.length;
                          const hasUpper = /[A-Z]/.test(passForm.new_password);
                          const hasNum = /[0-9]/.test(passForm.new_password);
                          const score = (len >= 6 ? 1 : 0) + (len >= 10 ? 1 : 0) + (hasUpper ? 1 : 0) + (hasNum ? 1 : 0);
                          return ['Terlalu lemah','Lemah','Cukup kuat','Kuat'][score - 1] || 'Terlalu lemah';
                        })()}
                      </p>
                    </div>
                  )}

                  <div style={{ display:'flex', gap:8, marginTop:4 }}>
                    <Btn onClick={() => { setIsPassMode(false); setPassForm({ current_password:'', new_password:'', confirm_password:'' }); }} variant="ghost" style={{ flex:1 }}>Batal</Btn>
                    <Btn onClick={handleChangePassword} loading={isSavingPass} style={{ flex:2 }}>
                      <Icon d={IC.lock} size={14} /> Simpan Password
                    </Btn>
                  </div>
                </Card>
              )}

              {/* Placeholder card when nothing active */}
              {!isEditMode && !isPassMode && !isUpgradeMode && (
                <Card style={{ border:'1px dashed #e5e7eb', background:'#fafafa', textAlign:'center', padding:'40px 24px' }}>
                  <div style={{ color:'#d1d5db', marginBottom:10 }}><Icon d={IC.user} size={32} /></div>
                  <p style={{ fontSize:13, color:'#9ca3af', fontWeight:500 }}>Pilih aksi di sebelah kiri untuk mengelola akun Anda.</p>
                </Card>
              )}

              {/* Upgrade Akun */}
              {user.role === 'pencari' && !isEditMode && !isPassMode && (
                !isUpgradeMode ? (
                  <UpgradeBanner user={user} onUpgrade={() => setIsUpgradeMode(true)} />
                ) : (
                  <Card style={{ animation:'fadeIn 0.2s ease', border:'1.5px solid #bfdbfe' }}>
                    <SectionHeader title="Verifikasi Identitas"
                      action={
                        <button onClick={() => setIsUpgradeMode(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#9ca3af' }}>
                          <Icon d={IC.x} size={17} />
                        </button>
                      }
                    />
                    <p style={{ fontSize:13, color:'#6b7280', marginBottom:16 }}>Upload dokumen untuk proses upgrade akun menjadi Pemilik Kos.</p>

                    {/* Steps */}
                    <div style={{ display:'flex', gap:6, marginBottom:18, background:'#f9fafb', borderRadius:8, padding:10 }}>
                      {['Upload KTP','Upload Selfie','Kirim'].map((s, i) => (
                        <div key={s} style={{ flex:1, textAlign:'center' }}>
                          <div style={{
                            width:22, height:22, borderRadius:'50%', margin:'0 auto 4px',
                            background:(i===0&&ktpFile)||(i===1&&selfieFile) ? '#16a34a' : '#e5e7eb',
                            display:'flex', alignItems:'center', justifyContent:'center',
                            fontSize:10, fontWeight:700, color:'#fff', transition:'background 0.3s'
                          }}>
                            {(i===0&&ktpFile)||(i===1&&selfieFile) ? <Icon d={IC.check} size={11} /> : i+1}
                          </div>
                          <p style={{ fontSize:10, color:'#6b7280', fontWeight:600 }}>{s}</p>
                        </div>
                      ))}
                    </div>

                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
                      <DropZone label="Foto KTP Asli" sublabel="Klik untuk unggah" icon={IC.id} file={ktpFile}
                        onChange={e => e.target.files[0] && setKtpFile(e.target.files[0])} />
                      <DropZone label="Selfie + KTP" sublabel="Wajah & KTP terlihat" icon={IC.camera} file={selfieFile}
                        onChange={e => e.target.files[0] && setSelfieFile(e.target.files[0])} />
                    </div>

                    <div style={{ background:'#fefce8', border:'1px solid #fde047', borderRadius:8, padding:'9px 12px', fontSize:12, color:'#854d0e', marginBottom:14, display:'flex', gap:6, lineHeight:1.5 }}>
                      <Icon d={IC.shield} size={13} />
                      Dokumen Anda dienkripsi dan hanya digunakan untuk keperluan verifikasi.
                    </div>

                    <Btn onClick={handleUpgradeSubmit} loading={isSubmitting} disabled={!ktpFile || !selfieFile} style={{ width:'100%' }}>
                      <Icon d={IC.upload} size={14} /> Kirim Pengajuan Verifikasi
                    </Btn>
                  </Card>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Responsive: stack to single column on mobile */}
      <style>{`
        @media (max-width: 680px) {
          .profil-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}

// ─── UPGRADE BANNER ──────────────────────────────────────────────────────────
function UpgradeBanner({ user, onUpgrade }) {
  const isPending = user.verification_status === 'pending';
  return (
    <Card style={{
      background: isPending ? '#fefce8' : '#eff6ff',
      border: `1px solid ${isPending ? '#fde047' : '#bfdbfe'}`
    }}>
      <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
        <div style={{
          width:40, height:40, borderRadius:10, flexShrink:0,
          background: isPending ? '#fef9c3' : '#dbeafe',
          display:'flex', alignItems:'center', justifyContent:'center',
          color: isPending ? '#a16207' : '#1d4ed8'
        }}>
          <Icon d={isPending ? IC.clock : IC.shield} size={20} />
        </div>
        <div style={{ flex:1 }}>
          <p style={{ fontWeight:700, fontSize:14, color:'#111827', marginBottom:3 }}>
            {isPending ? 'Sedang Diverifikasi' : 'Punya Kos untuk Disewakan?'}
          </p>
          <p style={{ fontSize:12, color:'#6b7280', lineHeight:1.6 }}>
            {isPending
              ? 'Dokumen Anda sedang kami periksa. Harap tunggu hingga 1×24 jam.'
              : 'Upgrade akun menjadi Pemilik Kos untuk mulai mengiklankan properti Anda.'}
          </p>
          {!isPending && (
            <button onClick={onUpgrade} style={{
              marginTop:10, background:'#2563eb', color:'#fff', border:'none',
              borderRadius:7, padding:'7px 14px', fontWeight:600, fontSize:13,
              cursor:'pointer', fontFamily:'inherit'
            }}>
              Upgrade Akun
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}
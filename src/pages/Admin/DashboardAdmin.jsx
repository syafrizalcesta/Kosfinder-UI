import React, { useState, useEffect } from 'react';

// ─── ICONS ───────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);
const IC = {
  check:   "M20 6L9 17l-5-5",
  x:       "M18 6L6 18M6 6l12 12",
  logout:  ["M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4","M16 17l5-5-5-5","M21 12H9"],
  user:    ["M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2","M12 11a4 4 0 100-8 4 4 0 000 8z"],
  shield:  ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"],
  clock:   ["M12 22a10 10 0 100-20 10 10 0 000 20z","M12 6v6l4 2"],
  eye:     ["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z","M12 15a3 3 0 100-6 3 3 0 000 6z"],
  id:      ["M2 3h20v14H2z","M8 21h8","M12 17v4"],
  camera:  ["M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z","M12 17a4 4 0 100-8 4 4 0 000 8z"],
  search:  ["M11 19a8 8 0 100-16 8 8 0 000 16z","M21 21l-4.35-4.35"],
  refresh: ["M23 4v6h-6","M1 20v-6h6","M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"],
  phone:   "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.02 1.18 2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.11 7.94a16 16 0 006 6l1.21-1.21a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z",
  email:   ["M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z","M22 6l-10 7L2 6"],
  warning: ["M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z","M12 9v4","M12 17h.01"],
};

// ─── TOAST ───────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  const bg = { success: '#16a34a', error: '#dc2626', info: '#2563eb', warning: '#d97706' }[type] || '#2563eb';
  return (
    <div style={{
      position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
      background: bg, color: '#fff', padding: '11px 20px', borderRadius: 10,
      fontWeight: 600, fontSize: 14, boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
      zIndex: 9999, display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap',
    }}>
      <Icon d={type === 'error' ? IC.x : type === 'warning' ? IC.warning : IC.check} size={15} />
      {message}
    </div>
  );
}

// ─── CONFIRM MODAL ───────────────────────────────────────────────────────────
function ConfirmModal({ title, message, confirmLabel, confirmColor, onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        background: '#fff', borderRadius: 14, padding: '28px 28px 22px',
        maxWidth: 380, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        animation: 'fadeIn 0.15s ease',
      }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: confirmColor === '#dc2626' ? '#fee2e2' : '#dcfce7',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: confirmColor,
          }}>
            <Icon d={confirmColor === '#dc2626' ? IC.x : IC.check} size={20} />
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 15, color: '#111827', marginBottom: 4 }}>{title}</p>
            <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>{message}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 18 }}>
          <button onClick={onCancel} style={{
            padding: '8px 16px', borderRadius: 8, border: '1.5px solid #d1d5db',
            background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>Batal</button>
          <button onClick={onConfirm} style={{
            padding: '8px 16px', borderRadius: 8, border: 'none',
            background: confirmColor, color: '#fff', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ─── IMAGE PREVIEW MODAL ─────────────────────────────────────────────────────
function ImageModal({ src, label, onClose }) {
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 14, overflow: 'hidden',
        maxWidth: 520, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 18px', borderBottom: '1px solid #e5e7eb',
        }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>{label}</p>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4,
          }}><Icon d={IC.x} size={18} /></button>
        </div>
        <div style={{ padding: 16, background: '#f9fafb', minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {src
            ? <img src={src} alt={label} style={{ maxWidth: '100%', maxHeight: 460, borderRadius: 8, objectFit: 'contain' }} />
            : <div style={{ textAlign: 'center', color: '#9ca3af' }}>
                <Icon d={IC.eye} size={36} />
                <p style={{ marginTop: 10, fontSize: 13 }}>Gambar tidak tersedia</p>
              </div>
          }
        </div>
      </div>
    </div>
  );
}

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    pending:  { bg: '#fef9c3', color: '#854d0e', label: 'Menunggu Review' },
    approved: { bg: '#dcfce7', color: '#15803d', label: 'Diverifikasi' },
    rejected: { bg: '#fee2e2', color: '#991b1b', label: 'Ditolak' },
    none:     { bg: '#f3f4f6', color: '#6b7280', label: 'Belum Mengajukan' },
  };
  const s = map[status] || map.none;
  return (
    <span style={{
      background: s.bg, color: s.color, fontSize: 11, fontWeight: 700,
      padding: '3px 9px', borderRadius: 20, letterSpacing: '0.03em',
      whiteSpace: 'nowrap',
    }}>{s.label}</span>
  );
}

// ─── IMAGE THUMB ─────────────────────────────────────────────────────────────
function ImageThumb({ src, label, icon, onClick }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <button onClick={onClick} style={{
      flex: 1, border: '1.5px solid #e5e7eb', borderRadius: 10, overflow: 'hidden',
      background: '#f9fafb', cursor: src ? 'pointer' : 'default',
      display: 'flex', flexDirection: 'column', transition: 'border-color 0.15s',
      minWidth: 0,
    }}
      onMouseEnter={e => src && (e.currentTarget.style.borderColor = '#2563eb')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
    >
      <div style={{ height: 110, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        {src ? (
          <>
            {!loaded && <div style={{ color: '#d1d5db' }}><Icon d={icon} size={28} /></div>}
            <img
              src={src} alt={label}
              onLoad={() => setLoaded(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: loaded ? 'block' : 'none' }}
            />
            {loaded && (
              <div style={{
                position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.3)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0)')}
              >
                <Icon d={IC.eye} size={22} />
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', color: '#d1d5db' }}>
            <Icon d={icon} size={28} />
            <p style={{ fontSize: 10, marginTop: 4, color: '#9ca3af' }}>Tidak ada foto</p>
          </div>
        )}
      </div>
      <div style={{ padding: '7px 10px', borderTop: '1px solid #e5e7eb' }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: '#374151', margin: 0 }}>{label}</p>
      </div>
    </button>
  );
}

// ─── USER CARD ────────────────────────────────────────────────────────────────
function UserCard({ user, onApprove, onReject, onPreviewImage }) {
  const initials = user.user_name ? user.user_name.slice(0, 2).toUpperCase() : '??';
  const isPending = user.verification_status === 'pending';

  return (
    <div style={{
      background: '#fff', borderRadius: 14, border: `1.5px solid ${isPending ? '#fde68a' : '#e5e7eb'}`,
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden',
      transition: 'box-shadow 0.2s, transform 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.10)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {/* Header */}
      <div style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #f3f4f6' }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
          background: user.avatar_url ? 'transparent' : 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15, fontWeight: 700, color: '#fff', overflow: 'hidden',
          border: '2px solid #e5e7eb',
        }}>
          {user.avatar_url
            ? <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : initials
          }
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: '#111827', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.user_name}
          </p>
          <p style={{ fontSize: 12, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.email}
          </p>
        </div>
        <StatusBadge status={user.verification_status || 'none'} />
      </div>

      {/* Info */}
      <div style={{ padding: '12px 18px', borderBottom: '1px solid #f3f4f6' }}>
        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#6b7280', flexWrap: 'wrap' }}>
          {user.phone_whatsapp && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Icon d={IC.phone} size={12} /> {user.phone_whatsapp}
            </span>
          )}
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Icon d={IC.user} size={12} /> {user.role || 'pencari'}
          </span>
          {user.user_id && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'monospace', fontSize: 11, color: '#9ca3af' }}>
              ID: {user.user_id}
            </span>
          )}
        </div>
      </div>

      {/* Foto Dokumen */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid #f3f4f6' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>Dokumen Identitas</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <ImageThumb
            src={user.ktp_image_url || null}
            label="Foto KTP"
            icon={IC.id}
            onClick={() => user.ktp_image_url && onPreviewImage(user.ktp_image_url, 'Foto KTP – ' + user.user_name)}
          />
          <ImageThumb
            src={user.selfie_image_url || null}
            label="Selfie + KTP"
            icon={IC.camera}
            onClick={() => user.selfie_image_url && onPreviewImage(user.selfie_image_url, 'Selfie + KTP – ' + user.user_name)}
          />
        </div>
      </div>

      {/* Action Buttons */}
      {isPending && (
        <div style={{ padding: '12px 18px', display: 'flex', gap: 8 }}>
          <button onClick={() => onReject(user)} style={{
            flex: 1, padding: '9px 0', borderRadius: 8,
            border: '1.5px solid #fca5a5', background: '#fff',
            color: '#dc2626', fontWeight: 700, fontSize: 13,
            cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            transition: 'background 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = '#fee2e2')}
            onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
          >
            <Icon d={IC.x} size={14} /> Tolak
          </button>
          <button onClick={() => onApprove(user)} style={{
            flex: 2, padding: '9px 0', borderRadius: 8,
            border: 'none', background: '#2563eb',
            color: '#fff', fontWeight: 700, fontSize: 13,
            cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            transition: 'background 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = '#1d4ed8')}
            onMouseLeave={e => (e.currentTarget.style.background = '#2563eb')}
          >
            <Icon d={IC.check} size={14} /> Verifikasi
          </button>
        </div>
      )}

      {!isPending && (
        <div style={{ padding: '12px 18px' }}>
          <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', fontStyle: 'italic' }}>
            {user.verification_status === 'approved' ? 'Verifikasi telah disetujui.' : user.verification_status === 'rejected' ? 'Pengajuan telah ditolak.' : 'Belum ada pengajuan verifikasi.'}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, bg, color }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb',
      padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14,
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 11, background: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color, flexShrink: 0,
      }}>
        <Icon d={icon} size={20} />
      </div>
      <div>
        <p style={{ fontSize: 22, fontWeight: 800, color: '#111827', lineHeight: 1 }}>{value}</p>
        <p style={{ fontSize: 12, color: '#6b7280', marginTop: 3 }}>{label}</p>
      </div>
    </div>
  );
}

// ─── EMPTY STATE ─────────────────────────────────────────────────────────────
function EmptyState({ message }) {
  return (
    <div style={{
      gridColumn: '1 / -1', padding: '60px 24px', textAlign: 'center',
      background: '#fff', borderRadius: 14, border: '1.5px dashed #e5e7eb',
    }}>
      <div style={{ color: '#d1d5db', marginBottom: 12 }}><Icon d={IC.shield} size={40} /></div>
      <p style={{ fontWeight: 700, fontSize: 15, color: '#374151', marginBottom: 6 }}>Tidak Ada Data</p>
      <p style={{ fontSize: 13, color: '#9ca3af' }}>{message}</p>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function DashboardAdmin({ onNavigate }) {
  const [users, setUsers]             = useState([]);
  const [adminUser, setAdminUser]     = useState(null);
  const [loading, setLoading]         = useState(true);
  const [toast, setToast]             = useState(null);
  const [confirm, setConfirm]         = useState(null);   // { user, action }
  const [preview, setPreview]         = useState(null);   // { src, label }
  const [activeTab, setActiveTab]     = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [processing, setProcessing]   = useState({});

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const showToast = (message, type = 'info') => setToast({ message, type });

  // ─── Fetch admin info ──
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await fetch(`${API_BASE}/user`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (res.ok) {
          const data = await res.json();
          setAdminUser(data);
        }
      } catch (_) {}
    };
    fetchAdmin();
  }, []);

  // ─── Fetch users pending verifikasi ──
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/verifications`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          Accept: 'application/json',
        },
      });
      if (!res.ok) throw new Error('Gagal memuat data');
      const data = await res.json();
      setUsers(data.data || data);
    } catch (err) {
      showToast('Gagal memuat data pengguna: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // ─── Approve ──
  const handleApprove = async (user) => {
    setProcessing(p => ({ ...p, [user.user_id]: true }));
    setConfirm(null);
    try {
      const res = await fetch(`${API_BASE}/admin/verifications/${user.user_id}/approve`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          Accept: 'application/json',
        },
      });
      if (!res.ok) throw new Error('Gagal memverifikasi');
      setUsers(prev => prev.map(u =>
        u.user_id === user.user_id ? { ...u, verification_status: 'approved', role: 'pemilik' } : u
      ));
      showToast(`${user.user_name} berhasil diverifikasi sebagai Pemilik Kos!`, 'success');
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    } finally {
      setProcessing(p => { const n = { ...p }; delete n[user.user_id]; return n; });
    }
  };

  // ─── Reject ──
  const handleReject = async (user) => {
    setProcessing(p => ({ ...p, [user.user_id]: true }));
    setConfirm(null);
    try {
      const res = await fetch(`${API_BASE}/admin/verifications/${user.user_id}/reject`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          Accept: 'application/json',
        },
      });
      if (!res.ok) throw new Error('Gagal menolak verifikasi');
      setUsers(prev => prev.map(u =>
        u.user_id === user.user_id ? { ...u, verification_status: 'rejected' } : u
      ));
      showToast(`Pengajuan ${user.user_name} telah ditolak.`, 'warning');
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    } finally {
      setProcessing(p => { const n = { ...p }; delete n[user.user_id]; return n; });
    }
  };

  // ─── Logout ──
  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          Accept: 'application/json',
        },
      });
    } catch (_) {}
    // Bersihkan seluruh sesi
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('currentPage');
    setConfirm(null);
    // Navigasi ke home via App.jsx router (bukan hard redirect)
    if (onNavigate) {
      onNavigate('home');
    } else {
      window.location.href = '/';
    }
  };

  // ─── Filter & Stats ──
  const pendingUsers  = users.filter(u => u.verification_status === 'pending');
  const approvedUsers = users.filter(u => u.verification_status === 'approved');
  const rejectedUsers = users.filter(u => u.verification_status === 'rejected');

  const tabUsers = {
    pending: pendingUsers,
    approved: approvedUsers,
    rejected: rejectedUsers,
    all: users,
  }[activeTab] || [];

  const filteredUsers = tabUsers.filter(u => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (u.user_name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.user_id || '').toLowerCase().includes(q)
    );
  });

  const tabs = [
    { key: 'pending',  label: 'Menunggu Review', count: pendingUsers.length,  color: '#d97706' },
    { key: 'approved', label: 'Diverifikasi',     count: approvedUsers.length, color: '#16a34a' },
    { key: 'rejected', label: 'Ditolak',          count: rejectedUsers.length, color: '#dc2626' },
    { key: 'all',      label: 'Semua',            count: users.length,         color: '#2563eb' },
  ];

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{ opacity:1; } 50%{ opacity:.4; } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 18px;
        }
        .stat-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }
        @media (max-width: 900px) {
          .stat-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .stat-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#f3f4f6' }}>

        {/* ─── NAVBAR ─── */}
        <style>{`
          @media (max-width: 480px) { .admin-name-text { display: none !important; } }
        `}</style>
        <nav style={{
          background: '#fff', borderBottom: '1px solid #e5e7eb',
          padding: '0 16px', height: 60, minHeight: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 100,
          boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
            }}>
              <Icon d={IC.shield} size={16} />
            </div>
            <div>
              <p style={{ fontWeight: 800, fontSize: 15, color: '#111827', lineHeight: 1.1 }}>Admin Panel</p>
              <p style={{ fontSize: 11, color: '#9ca3af' }}>Manajemen Verifikasi</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            {adminUser && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: adminUser.avatar_url ? 'transparent' : 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: '#fff', overflow: 'hidden', border: '2px solid #e5e7eb',
                }}>
                  {adminUser.avatar_url
                    ? <img src={adminUser.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : (adminUser.user_name || 'A').slice(0, 2).toUpperCase()
                  }
                </div>
                <div className="admin-name-text" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#111827', lineHeight: 1.2 }}>{adminUser.user_name}</span>
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>Administrator</span>
                </div>
              </div>
            )}
            <button onClick={() => setConfirm({ action: 'logout' })} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 13px', borderRadius: 8,
              border: '1.5px solid #e5e7eb', background: '#fff',
              color: '#dc2626', fontWeight: 600, fontSize: 13,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = '#fee2e2')}
              onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
            >
              <Icon d={IC.logout} size={14} /> Logout
            </button>
          </div>
        </nav>

        {/* ─── CONTENT ─── */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(16px, 4vw, 28px) clamp(12px, 4vw, 24px)' }}>

          {/* Page Title */}
          <div style={{ marginBottom: 22 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>Verifikasi Pengguna</h1>
            <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>Tinjau dan setujui pengajuan verifikasi identitas pengguna.</p>
          </div>

          {/* Stat Cards */}
          <div className="stat-grid">
            <StatCard label="Menunggu Review" value={pendingUsers.length}  icon={IC.clock}  bg="#fef9c3" color="#d97706" />
            <StatCard label="Diverifikasi"    value={approvedUsers.length} icon={IC.check}  bg="#dcfce7" color="#16a34a" />
            <StatCard label="Ditolak"         value={rejectedUsers.length} icon={IC.x}      bg="#fee2e2" color="#dc2626" />
            <StatCard label="Total Pengajuan" value={users.length}         icon={IC.user}   bg="#dbeafe" color="#2563eb" />
          </div>

          {/* Tabs + Search */}
          <div style={{
            display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap',
            alignItems: 'center', justifyContent: 'space-between',
          }}>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {tabs.map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                  padding: '7px 14px', borderRadius: 8,
                  border: activeTab === tab.key ? `1.5px solid ${tab.color}` : '1.5px solid #e5e7eb',
                  background: activeTab === tab.key ? `${tab.color}15` : '#fff',
                  color: activeTab === tab.key ? tab.color : '#6b7280',
                  fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s',
                }}>
                  {tab.label}
                  <span style={{
                    background: activeTab === tab.key ? tab.color : '#e5e7eb',
                    color: activeTab === tab.key ? '#fff' : '#6b7280',
                    borderRadius: 10, fontSize: 11, fontWeight: 700,
                    padding: '1px 7px', minWidth: 22, textAlign: 'center',
                  }}>{tab.count}</span>
                </button>
              ))}
            </div>

            {/* Search + Refresh */}
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                border: '1.5px solid #d1d5db', borderRadius: 8,
                padding: '7px 12px', background: '#fff',
              }}>
                <span style={{ color: '#9ca3af' }}><Icon d={IC.search} size={14} /></span>
                <input
                  type="text" placeholder="Cari nama / email / ID..."
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    border: 'none', outline: 'none', fontSize: 13, color: '#111827',
                    fontFamily: 'inherit', background: 'transparent', width: 190,
                  }}
                />
              </div>
              <button onClick={fetchUsers} title="Refresh" style={{
                width: 38, height: 38, borderRadius: 8, border: '1.5px solid #d1d5db',
                background: '#fff', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: '#6b7280',
                transition: 'background 0.15s',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f3f4f6')}
                onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
              >
                <Icon d={IC.refresh} size={15} />
              </button>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="dashboard-grid">
              {[1, 2, 3].map(i => (
                <div key={i} style={{
                  background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb',
                  padding: '20px', animation: 'pulse 1.4s ease-in-out infinite',
                }}>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#f3f4f6' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 14, background: '#f3f4f6', borderRadius: 6, marginBottom: 8 }} />
                      <div style={{ height: 11, background: '#f3f4f6', borderRadius: 6, width: '60%' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div style={{ flex: 1, height: 110, background: '#f3f4f6', borderRadius: 10 }} />
                    <div style={{ flex: 1, height: 110, background: '#f3f4f6', borderRadius: 10 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="dashboard-grid">
              {filteredUsers.length === 0
                ? <EmptyState message={
                    searchQuery
                      ? 'Tidak ada hasil untuk pencarian tersebut.'
                      : activeTab === 'pending'
                        ? 'Tidak ada pengajuan verifikasi yang menunggu review.'
                        : 'Tidak ada data di kategori ini.'
                  } />
                : filteredUsers.map(user => (
                  <div key={user.user_id} style={{ animation: 'fadeIn 0.2s ease', opacity: processing[user.user_id] ? 0.6 : 1, transition: 'opacity 0.2s' }}>
                    <UserCard
                      user={user}
                      onApprove={u => setConfirm({ user: u, action: 'approve' })}
                      onReject={u => setConfirm({ user: u, action: 'reject' })}
                      onPreviewImage={(src, label) => setPreview({ src, label })}
                    />
                  </div>
                ))
              }
            </div>
          )}
        </div>
      </div>

      {/* ─── MODALS & OVERLAYS ─── */}

      {/* Confirm Modal */}
      {confirm && (
        confirm.action === 'logout'
          ? <ConfirmModal
              title="Konfirmasi Logout"
              message="Anda akan keluar dari sesi admin. Lanjutkan?"
              confirmLabel="Ya, Logout"
              confirmColor="#dc2626"
              onConfirm={handleLogout}
              onCancel={() => setConfirm(null)}
            />
          : confirm.action === 'approve'
            ? <ConfirmModal
                title="Verifikasi Pengguna"
                message={`Setujui pengajuan dari ${confirm.user.user_name} dan ubah role menjadi Pemilik Kos?`}
                confirmLabel="Ya, Verifikasi"
                confirmColor="#2563eb"
                onConfirm={() => handleApprove(confirm.user)}
                onCancel={() => setConfirm(null)}
              />
            : <ConfirmModal
                title="Tolak Pengajuan"
                message={`Tolak pengajuan verifikasi dari ${confirm.user.user_name}? Pengguna dapat mengajukan ulang.`}
                confirmLabel="Ya, Tolak"
                confirmColor="#dc2626"
                onConfirm={() => handleReject(confirm.user)}
                onCancel={() => setConfirm(null)}
              />
      )}

      {/* Image Preview Modal */}
      {preview && (
        <ImageModal
          src={preview.src}
          label={preview.label}
          onClose={() => setPreview(null)}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}
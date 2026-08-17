import React, { useState } from 'react';
import { Check, KeyRound, Mail, Save, UserRound } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

function Ayarlar() {
  const { user, token, checkAuth } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const input = 'h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10';

  const updateProfile = async e => {
    e.preventDefault(); setProfileLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/user/update-profile`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ name, email }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Profil güncellenemedi.');
      if (typeof checkAuth === 'function') await checkAuth();
      Swal.fire({ icon: 'success', title: 'Profil güncellendi', confirmButtonColor: '#0f172a' });
    } catch (error) { Swal.fire({ icon: 'error', title: 'Güncellenemedi', text: error.message, confirmButtonColor: '#0f172a' }); }
    finally { setProfileLoading(false); }
  };

  const updatePassword = async e => {
    e.preventDefault();
    if (newPassword !== newPasswordConfirmation) {
      Swal.fire({ icon: 'warning', title: 'Şifreler eşleşmiyor', confirmButtonColor: '#0f172a' }); return;
    }
    setPasswordLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/user/update-password`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ current_password: currentPassword, new_password: newPassword, new_password_confirmation: newPasswordConfirmation }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Şifre değiştirilemedi.');
      setCurrentPassword(''); setNewPassword(''); setNewPasswordConfirmation('');
      Swal.fire({ icon: 'success', title: 'Şifre güncellendi', confirmButtonColor: '#0f172a' });
    } catch (error) { Swal.fire({ icon: 'error', title: 'İşlem başarısız', text: error.message, confirmButtonColor: '#0f172a' }); }
    finally { setPasswordLoading(false); }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6"><p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Hesap</p><h1 className="text-2xl font-black tracking-tight">Ayarlar</h1><p className="mt-1 text-sm text-slate-500">Profilini ve giriş bilgilerini yönet.</p></div>
      <div className="space-y-4">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><UserRound size={18} /></span><div><h2 className="font-black">Profil bilgileri</h2><p className="text-xs text-slate-400">Toplulukta görünen bilgilerin.</p></div></div>
          <form onSubmit={updateProfile} className="space-y-4">
            <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-600">Ad</span><input className={input} value={name} onChange={e => setName(e.target.value)} required /></label>
            <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-600">E-posta</span><span className="relative block"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><input className={`${input} pl-11`} type="email" value={email} onChange={e => setEmail(e.target.value)} required /></span></label>
            <button disabled={profileLoading} className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-black text-white hover:bg-indigo-700 disabled:opacity-60"><Save size={16} /> {profileLoading ? 'Kaydediliyor...' : 'Değişiklikleri kaydet'}</button>
          </form>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600"><KeyRound size={18} /></span><div><h2 className="font-black">Şifre güvenliği</h2><p className="text-xs text-slate-400">Giriş şifreni burada güncelle.</p></div></div>
          <form onSubmit={updatePassword} className="space-y-4">
            <input className={input} type="password" placeholder="Mevcut şifre" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
            <input className={input} type="password" placeholder="Yeni şifre (en az 6 karakter)" value={newPassword} onChange={e => setNewPassword(e.target.value)} minLength={6} required />
            <input className={input} type="password" placeholder="Yeni şifre tekrar" value={newPasswordConfirmation} onChange={e => setNewPasswordConfirmation(e.target.value)} minLength={6} required />
            <button disabled={passwordLoading} className="inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-black text-white hover:bg-emerald-700 disabled:opacity-60"><Check size={16} /> {passwordLoading ? 'Güncelleniyor...' : 'Şifreyi güncelle'}</button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default Ayarlar;

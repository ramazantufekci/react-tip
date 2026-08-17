import React, { useState } from 'react';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, Sparkles, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = isRegister ? 'register' : 'login';
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Bir hata oluştu.');
      login(data.user, data.access_token);
      navigate('/anketler');
    } catch (err) {
      setError(err.message || 'Sunucu bağlantı hatası.');
    } finally {
      setLoading(false);
    }
  };

  const field = 'h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10';

  return (
    <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-200/60 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="relative hidden overflow-hidden bg-slate-950 p-10 text-white lg:block">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-600/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="relative flex h-full flex-col justify-between">
          <div>
            <div className="mb-12 grid h-11 w-11 place-items-center rounded-2xl bg-white/10"><Sparkles size={20} /></div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">Kararsız kalma</p>
            <h1 className="max-w-sm text-4xl font-black leading-tight">Kararını tek başına verme.</h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">Sorunu paylaş, insanların gerçek tercihlerini gör ve birlikte daha iyi karar ver.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">“Bazen doğru cevap, çoğunluğun fikrini duymaktır.”</div>
        </div>
      </div>

      <div className="p-6 sm:p-10">
        <div className="mb-8">
          <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-black text-indigo-600">{isRegister ? 'YENİ HESAP' : 'HOŞ GELDİN'}</span>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">{isRegister ? 'Topluluğa katıl.' : 'Tekrar hoş geldin.'}</h2>
          <p className="mt-1 text-sm text-slate-500">{isRegister ? 'İlk anketini birkaç saniyede oluştur.' : 'Anketlere oy ver ve fikirleri keşfet.'}</p>
        </div>

        {error && <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-600">Adın</span><span className="relative block"><UserRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} /><input className={`${field} pl-11`} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required placeholder="Nasıl hitap edelim?" /></span></label>
          )}
          <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-600">E-posta</span><span className="relative block"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} /><input type="email" className={`${field} pl-11`} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required placeholder="ornek@mail.com" /></span></label>
          <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-600">Şifre</span><span className="relative block"><LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} /><input type={showPassword ? 'text' : 'password'} className={`${field} pl-11 pr-11`} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required placeholder="••••••••" /><button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span></label>
          <button disabled={loading} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 text-sm font-black text-white shadow-xl shadow-slate-950/10 transition hover:bg-indigo-700 disabled:opacity-60">{loading ? 'Bekleyin...' : isRegister ? 'Hesap oluştur' : 'Giriş yap'} {!loading && <ArrowRight size={17} />}</button>
        </form>

        <button onClick={() => { setIsRegister(v => !v); setError(''); }} className="mt-6 w-full text-center text-sm font-bold text-slate-500 hover:text-indigo-600">{isRegister ? 'Zaten hesabın var mı? Giriş yap' : 'Henüz hesabın yok mu? Ücretsiz kayıt ol'}</button>
      </div>
    </div>
  );
}

export default Login;

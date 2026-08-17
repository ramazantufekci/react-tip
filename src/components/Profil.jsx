import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Settings, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

function Profil({ onDeletePoll }) {
  const { user, token } = useAuth();
  const [created, setCreated] = useState([]);
  const [voted, setVoted] = useState([]);
  const [tab, setTab] = useState('created');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [profileRes, pollsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/user/profile`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/polls`),
        ]);
        if (!profileRes.ok || !pollsRes.ok) return;
        const profile = await profileRes.json();
        const allPolls = await pollsRes.json();
        const votedIds = JSON.parse(localStorage.getItem('my_votes') || '[]');
        const parse = poll => ({ ...poll, options: typeof poll.options === 'string' ? JSON.parse(poll.options) : poll.options });
        setCreated((profile.my_polls || []).map(parse));
        setVoted(allPolls.filter(p => votedIds.includes(p.id)).map(p => ({ ...parse(p), voted: true })));
      } finally { setLoading(false); }
    })();
  }, [token]);

  const remove = async id => {
    await onDeletePoll(id);
    setCreated(prev => prev.filter(p => p.id !== id));
  };

  if (loading) return <div className="grid min-h-80 place-items-center rounded-3xl border border-slate-200 bg-white text-sm font-semibold text-slate-500">Profil yükleniyor...</div>;

  const list = tab === 'created' ? created : voted;

  return (
    <div className="mx-auto max-w-4xl">
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-xl shadow-slate-200 sm:p-8">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/25 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white/10 text-2xl font-black ring-1 ring-white/10">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
            <div><p className="text-xs font-bold uppercase tracking-widest text-indigo-300">Profil</p><h1 className="mt-1 text-2xl font-black">{user?.name}</h1><p className="mt-1 text-sm text-slate-400">{user?.email}</p></div>
          </div>
          <Link to="/ayarlar" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/15"><Settings size={15} /> Hesap ayarları</Link>
        </div>
      </section>

      <div className="mt-5 grid grid-cols-2 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
        <button onClick={() => setTab('created')} className={`rounded-xl px-4 py-3 text-sm font-black transition ${tab === 'created' ? 'bg-slate-950 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>Açtığım anketler <span className="ml-1 opacity-60">{created.length}</span></button>
        <button onClick={() => setTab('voted')} className={`rounded-xl px-4 py-3 text-sm font-black transition ${tab === 'voted' ? 'bg-slate-950 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>Oy verdiklerim <span className="ml-1 opacity-60">{voted.length}</span></button>
      </div>

      <div className="mt-4 space-y-3">
        {list.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center"><p className="font-bold text-slate-800">Henüz burada bir şey yok.</p><Link to={tab === 'created' ? '/sor-sor' : '/anketler'} className="mt-3 inline-flex items-center gap-1 text-sm font-black text-indigo-600">Keşfet <ArrowRight size={15} /></Link></div>
        ) : list.map(poll => (
          <div key={poll.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="min-w-0"><span className="text-[10px] font-black uppercase tracking-wider text-indigo-600">#{poll.category || 'Genel'}</span><Link to={`/anketler/${poll.id}`} className="mt-1 block truncate font-extrabold text-slate-900 hover:text-indigo-600">{poll.question}</Link>{tab === 'voted' && <span className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-emerald-600"><CheckCircle2 size={13} /> Oy kullanıldı</span>}</div>
            {tab === 'created' && <button onClick={() => remove(poll.id)} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={15} /></button>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Profil;

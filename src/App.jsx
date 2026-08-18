import React, { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, NavLink, Route, Routes } from 'react-router-dom';
import { BarChart3, CircleUserRound, LogIn, LogOut, Plus, Sparkles, UsersRound } from 'lucide-react';
import Swal from 'sweetalert2';
import Anketler from './components/Anketler';
import SorSor from './components/SorSor';
import AnketDetay from './components/AnketDetay';
import Login from './components/Login';
import Profil from './components/Profil';
import Ayarlar from './components/Ayarlar';
import { useAuth } from './context/AuthContext';
import { API_BASE_URL } from './config';

const navBase = 'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all';
const navClass = ({ isActive }) =>
  `${navBase} ${isActive ? 'bg-slate-950 text-white shadow-lg shadow-slate-950/10' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`;

function App() {
  const { user, token, logout, isAuthenticated, loading: authLoading } = useAuth();
  const [polls, setPolls] = useState([]);
  const handlePollsDeleted = (deletedIds) => {
  setPolls((prev) =>
    prev.filter((poll) => !deletedIds.includes(poll.id))
  );
};
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('latest');
  const [myVotes, setMyVotes] = useState(() => JSON.parse(localStorage.getItem('my_votes') || '[]'));
  const [myUpvotes, setMyUpvotes] = useState(() => JSON.parse(localStorage.getItem('my_upvotes') || '[]'));

  const fetchPolls = async (currentSort = sortBy) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/polls?sort=${currentSort}&_t=${Date.now()}`);
      if (!response.ok) throw new Error('Anketler alınamadı');
      const data = await response.json();
      setPolls(data.map(poll => ({
        ...poll,
        options: typeof poll.options === 'string' ? JSON.parse(poll.options) : poll.options,
        voted: myVotes.includes(poll.id),
        upvotedByMe: myUpvotes.includes(poll.id),
      })));
    } catch (error) {
      console.error('API hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPolls(sortBy); }, [myVotes, myUpvotes, sortBy]);

  const handleVote = async (poll, optionIndex) => {
    if (!isAuthenticated) {
      Swal.fire({ icon: 'info', title: 'Oy vermek için giriş yapın', text: 'Topluluğa katılmak yalnızca birkaç saniye sürer.', confirmButtonColor: '#0f172a' });
      return;
    }
    console.log("vote",poll);
    if (myVotes.includes(poll.id)) return;
    const slug = poll.slug;

  if (!slug) {
    console.error('Anket slug bulunamadı:', poll);
    return;
  }
    try {
      const response = await fetch(`${API_BASE_URL}/polls/${encodeURIComponent(slug)}/vote`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ option_index: optionIndex }),
      });
      if (!response.ok) return;
      const result = await response.json();
      /*
     * API güncel anketi döndürdüğü için
     * listedeki anketi de güncelleyebiliriz.
     */
      console.log(result.poll);
    if (result.poll) {
      setPolls(prev =>
        prev.map(item =>
          item.id === result.poll.id
            ? {
                ...item,
                ...result.poll,
                slug: result.poll.slug,
                options:
                  typeof result.poll.options === 'string'
                    ? JSON.parse(result.poll.options)
                    : result.poll.options,
                voted: true,
              }
            : item
        )
      );
    }

    const updated = [...myVotes, poll.id];

    setMyVotes(updated);

    localStorage.setItem(
      'my_votes',
      JSON.stringify(updated)
    );

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Oyun kaydedildi',
      showConfirmButton: false,
      timer: 1600,
    });
  } catch (error) {
    console.error('Oy verilemedi:', error);
  }
};

  const handleUpvote = async (poll) => {
    if (!isAuthenticated) {
      Swal.fire({ icon: 'info', title: 'Giriş gerekli', text: 'Anketleri öne çıkarmak için giriş yapın.', confirmButtonColor: '#0f172a' });
      return;
    }
      const slug = poll.slug;

  if (!slug) {
    console.error('Anket slug bulunamadı:', poll);
    return;
  }
    const isUpvoted = myUpvotes.includes(poll.id);
    try {
      const response = await fetch(`${API_BASE_URL}/polls/${encodeURIComponent(slug)}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: isUpvoted ? 'remove' : 'add' }),
      });
      if (!response.ok) return;
      const result = await response.json();

    /*
     * API'den dönen güncel upvote sayısını
     * direkt state'e yansıt.
     */
    setPolls(prev =>
      prev.map(item =>
        item.id === poll.id
          ? {
              ...item,
              upvotes: result.upvotes,
            }
          : item
      )
    );

    const updated = isUpvoted
      ? myUpvotes.filter(id => id !== poll.id)
      : [...myUpvotes, poll.id];

    setMyUpvotes(updated);

    localStorage.setItem(
      'my_upvotes',
      JSON.stringify(updated)
    );
  } catch (error) {
    console.error('Upvote hatası:', error);
  }
};

  const handleDeletePoll = async (poll) => {
    const result = await Swal.fire({
      title: 'Anket silinsin mi?',
      text: 'Bu işlem geri alınamaz.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Evet, sil',
      cancelButtonText: 'Vazgeç',
    });
    if (!result.isConfirmed) return;
const slug = poll.slug;

  if (!slug) {
    console.error('Anket slug bulunamadı:', poll);
    return;
  }
    try {
      const response = await fetch(`${API_BASE_URL}/polls/${encodeURIComponent(slug)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
      const error = await response.json().catch(() => ({}));

      Swal.fire({
        icon: 'error',
        title: 'Silinemedi',
        text: error.message || 'Anket silinemedi.',
        confirmButtonColor: '#0f172a',
      });

      return;
    }
      setPolls(prev =>
      prev.filter(item => item.id !== poll.id)
    );

    Swal.fire({
      icon: 'success',
      title: 'Anket silindi',
      confirmButtonColor: '#0f172a',
    });
    } catch (error) {
      console.error('Silme hatası:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 grid place-items-center">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-600 shadow-sm">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-indigo-500" />
          Kararsızlar topluluğu hazırlanıyor...
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#eef2ff_0,_#f8fafc_38%,_#f8fafc_100%)] text-slate-900">
        <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8">
          <header className="mb-4 overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur">
            <div className="flex flex-col gap-5 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <NavLink to="/anketler" className="group flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/10">
                  <Sparkles size={20} />
                </span>
                <span>
                  <span className="block text-lg font-black tracking-tight text-slate-950">kararsizkaldim<span className="text-indigo-600">.com</span></span>
                  <span className="block text-xs font-medium text-slate-500">Karar veremediğinde, topluluğa sor.</span>
                </span>
              </NavLink>
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5"><BarChart3 size={14} /> {polls.length} anket</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700"><UsersRound size={14} /> Topluluk aktif</span>
              </div>
            </div>
          </header>

          <nav className="sticky top-3 z-30 mb-6 flex flex-col gap-2 rounded-2xl border border-slate-200/80 bg-white/90 p-2 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-1 overflow-x-auto">
              <NavLink to="/anketler" className={navClass}><BarChart3 size={16} /> Anketler</NavLink>
              {isAuthenticated && <NavLink to="/sor-sor" className={navClass}><Plus size={16} /> Soru Sor</NavLink>}
            </div>
            <div className="flex items-center gap-1">
              {isAuthenticated ? (
                <>
                  <NavLink to="/profil" className={navClass}><CircleUserRound size={16} /> <span className="max-w-32 truncate">{user?.name || 'Profil'}</span></NavLink>
                  <button onClick={logout} className={`${navBase} text-rose-600 hover:bg-rose-50`}><LogOut size={16} /> Çıkış</button>
                </>
              ) : (
                <NavLink to="/login" className={`${navBase} bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700`}><LogIn size={16} /> Giriş / Kayıt</NavLink>
              )}
            </div>
          </nav>

          <main className="min-h-[520px]">
            <Routes>
              <Route path="/" element={<Navigate to="/anketler" replace />} />
              <Route path="/anketler" element={<Anketler polls={polls} onVote={handleVote} onUpvote={handleUpvote} sortBy={sortBy} setSortBy={setSortBy} fetchPolls={fetchPolls} onDeletePoll={handleDeletePoll} />} />
              <Route path="/anketler/:slug" element={<AnketDetay polls={polls} onVote={handleVote} onUpvote={handleUpvote} />} />
              <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/anketler" replace />} />
              <Route path="/sor-sor" element={isAuthenticated ? (<SorSor onPollCreated={(poll) => {setPolls((prev) => [poll,...prev,]);}}/>): <Navigate to="/login" replace />} />
              <Route path="/profil" element={isAuthenticated ? <Profil onDeletePoll={handleDeletePoll} onPollsDeleted={handlePollsDeleted} /> : <Navigate to="/login" replace />} />
              <Route path="/ayarlar" element={isAuthenticated ? <Ayarlar /> : <Navigate to="/login" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;

// src/App.jsx

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Anketler from './components/Anketler';
import SorSor from './components/SorSor';
import AnketDetay from './components/AnketDetay';
import Login from './components/Login'; 
import Profil from './components/Profil';
import Ayarlar from './components/Ayarlar';
import { useAuth } from './context/AuthContext'; 
import { API_BASE_URL } from './config';
import Swal from 'sweetalert2';

function App() {
  const { user, token, logout, isAuthenticated, loading: authLoading } = useAuth();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('latest');

  const [myVotes, setMyVotes] = useState(() => {
    const savedVotes = localStorage.getItem('my_votes');
    return savedVotes ? JSON.parse(savedVotes) : [];
  });

  const [myUpvotes, setMyUpvotes] = useState(() => {
    const savedUpvotes = localStorage.getItem('my_upvotes');
    return savedUpvotes ? JSON.parse(savedUpvotes) : [];
  });

  const fetchPolls = async (currentSort = sortBy) => {
    setLoading(true);
    try {
      const timestamp = new Date().getTime();
      const response = await fetch(`${API_BASE_URL}/polls?sort=${currentSort}&_t=${timestamp}`);
      if (response.ok) {
        const data = await response.json();
        const formattedPolls = data.map(poll => ({
          ...poll,
          options: typeof poll.options === 'string' ? JSON.parse(poll.options) : poll.options,
          voted: myVotes.includes(poll.id),       
          upvotedByMe: myUpvotes.includes(poll.id)  
        }));
        setPolls(formattedPolls);
      }
    } catch (error) {
      console.error("API hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls(sortBy);
  }, [myVotes, myUpvotes, sortBy]);

  const handleVote = async (pollId, optionIndex) => {
    if (!isAuthenticated) {
      Swal.fire({
        icon: 'warning',
        title: 'Oturum Açın',
        text: 'Oy kullanabilmek için lütfen giriş yapın!',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }
    if (myVotes.includes(pollId)) return;

    try {
      const response = await fetch(`${API_BASE_URL}/polls/${pollId}/vote`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ option_index: optionIndex })
      });

      if (response.ok) {
        const updatedVotes = [...myVotes, pollId];
        setMyVotes(updatedVotes);
        localStorage.setItem('my_votes', JSON.stringify(updatedVotes));
        
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Oyunuz başarıyla kaydedildi!',
          showConfirmButton: false,
          timer: 2000
        });
      }
    } catch (error) {
      console.error("Oy verilemedi:", error);
    }
  };

  const handleUpvote = async (pollId) => {
    if (!isAuthenticated) {
      Swal.fire({
        icon: 'warning',
        title: 'Giriş Gerekli',
        text: 'Yukarı taşıma işlemi için lütfen giriş yapın!',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }
    const isAlreadyUpvoted = myUpvotes.includes(pollId);
    const actionType = isAlreadyUpvoted ? 'remove' : 'add';

    try {
      const response = await fetch(`${API_BASE_URL}/polls/${pollId}/upvote`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: actionType })
      });

      if (response.ok) {
        let updatedUpvotes = isAlreadyUpvoted 
          ? myUpvotes.filter(id => id !== pollId) 
          : [...myUpvotes, pollId];
        
        setMyUpvotes(updatedUpvotes);
        localStorage.setItem('my_upvotes', JSON.stringify(updatedUpvotes));
      }
    } catch (error) {
      console.error("Upvote hatası:", error);
    }
  };

  const handleDeletePoll = async (pollId) => {
    Swal.fire({
      title: 'Emin misiniz?',
      text: "Bu anketi tamamen silmek istediğinize emin misiniz? Bu işlem geri alınamaz.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Evet, Sil!',
      cancelButtonText: 'Vazgeç'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`${API_BASE_URL}/polls/${pollId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            setPolls(prevPolls => prevPolls.filter(poll => poll.id !== pollId));
            Swal.fire({
              icon: 'success',
              title: 'Silindi!',
              text: 'Anket başarıyla silindi.',
              confirmButtonColor: '#10b981'
            });
          }
        } catch (error) {
          console.error("Silme hatası:", error);
        }
      }
    });
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-lg font-medium text-gray-500 bg-gray-50">
        Oturum kontrol ediliyor... ⏳
      </div>
    );
  }

  const navLinkClass = ({ isActive }) => 
    `px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 text-center flex-1 sm:flex-none ${
      isActive 
        ? 'bg-blue-600 text-white shadow-sm border border-blue-600' 
        : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
    }`;

  return (
    <BrowserRouter>
      {/* Arka planı hafif gri ton yaparak masaüstünde kartları belirginleştiriyoruz */}
      <div className="w-full min-h-screen bg-gray-50/50 antialiased">
        <div className="w-full max-w-6xl mx-auto px-4 py-6">
          
          {/* Üst Logo ve Slogan Alanı */}
          <header className="flex flex-col sm:flex-row justify-between items-center py-5 px-6 bg-white border border-gray-200 rounded-2xl mb-4 shadow-sm">
            <div className="text-center sm:text-left mb-3 sm:mb-0">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-blue-600">://kararsizkaldim.com</h1>
              <p className="text-xs text-gray-500 mt-0.5">Topluluğun Ortak Aklı İle İkilemlere Son 🌐</p>
            </div>
            {/* Masaüstünde hızlı istatistik rozeti */}
            <div className="hidden md:flex gap-4 text-xs font-semibold text-gray-500 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
              <span>📊 Toplam Anket: {polls.length}</span>
              <span>🔥 Canlı Oylama Aktif</span>
            </div>
          </header>

          {/* Menü Barı */}
          <nav className="flex flex-col sm:flex-row gap-3 bg-white p-2.5 rounded-2xl border border-gray-200 mb-6 shadow-sm justify-between items-center">
            <div className="flex gap-1.5 w-full sm:w-auto">
              <NavLink to="/anketler" className={navLinkClass}>Anketleri Oyla</NavLink>
              <NavLink to="/sor-sor" className={navLinkClass}>Kararsız Kaldım?</NavLink>
            </div>

            <div className="w-full sm:w-auto flex justify-end">
              {isAuthenticated ? (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                  <NavLink to="/profil" className={navLinkClass}>
                    👤 Profilim (<strong>{user?.name}</strong>)
                  </NavLink>
                  <button 
                    onClick={logout} 
                    className="px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition"
                  >
                    Çıkış Yap
                  </button>
                </div>
              ) : (
                <NavLink 
                  to="/login" 
                  className="w-full sm:w-auto text-center px-5 py-2 text-sm font-bold border border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition"
                >
                  Giriş Yap / Üye Ol
                </NavLink>
              )}
            </div>
          </nav>

          {/* Ana İçerik Bölümü */}
          <main className="min-h-[500px]">
            <Routes>
              <Route path="/" element={<Navigate to="/anketler" replace />} />
              <Route path="/anketler" element={<Anketler polls={polls} onVote={handleVote} onUpvote={handleUpvote} sortBy={sortBy} setSortBy={setSortBy} fetchPolls={fetchPolls} onDeletePoll={handleDeletePoll} />} />
              <Route path="/anketler/:id" element={<AnketDetay polls={polls} onVote={handleVote} onUpvote={handleUpvote} />} />
              <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/anketler" replace />} />
              <Route path="/sor-sor" element={isAuthenticated ? <SorSor onPollCreated={() => fetchPolls('latest')} /> : <Navigate to="/login" replace />} />
              <Route path="/profil" element={isAuthenticated ? <Profil onDeletePoll={handleDeletePoll} /> : <Navigate to="/login" replace />} />
              <Route path="/ayarlar" element={isAuthenticated ? <Ayarlar /> : <Navigate to="/login" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;

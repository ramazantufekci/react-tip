import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Anketler from './components/Anketler';
import SorSor from './components/SorSor';
import AnketDetay from './components/AnketDetay';
import Login from './components/Login'; 
import { useAuth } from './context/AuthContext'; 
import { API_BASE_URL } from './config'; // Merkezi URL dosyanız
import Swal from 'sweetalert2';
import './App.css';

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

  // Anketleri API'den çeken merkezi fonksiyon
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

  // Filtre veya oylar değiştikçe listeyi tazeleyin
  useEffect(() => {
    fetchPolls(sortBy);
  }, [myVotes, myUpvotes, sortBy]);

  // Oy verme işlemi
  const handleVote = async (pollId, optionIndex) => {
    if (!isAuthenticated) {
      Swal.fire({
      icon: 'warning',
      title: 'Oturum Açın',
      text: 'Oy kullanabilmek için lütfen giriş yapın!',
      confirmButtonColor: '#007bff'
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

  // Upvote işlemi
  const handleUpvote = async (pollId) => {
    if (!isAuthenticated) {
      Swal.fire({
      icon: 'warning',
      title: 'Giriş Gerekli',
      text: 'Yukarı taşıma işlemi için lütfen giriş yapın!',
      confirmButtonColor: '#007bff'
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

  if (authLoading || loading) {
    return <div className="loading-screen">Oturum kontrol ediliyor... ⏳</div>;
  }
  const handleDeletePoll = async (pollId) => {
  // 🌟 Klasik window.confirm yerine harika bir modern onay kutusu popup'ı:
  Swal.fire({
    title: 'Emin misiniz?',
    text: "Bu anketi tamamen silmek istediğinize emin misiniz? Bu işlem geri alınamaz.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Evet, Sil!',
    cancelButtonText: 'Vazgeç',
    background: '#ffffff'
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
          // Başarılı popup'ı
          Swal.fire({
            icon: 'success',
            title: 'Silindi!',
            text: 'Anket başarıyla silindi.',
            confirmButtonColor: '#28a745'
          });
        } else {
          const errData = await response.json();
          Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: errData.message || "Anket silinirken bir hata oluştu.",
            confirmButtonColor: '#007bff'
          });
        }
      } catch (error) {
        console.error("Silme hatası:", error);
      }
    }
  });
};
  return (
    <BrowserRouter>
      <div className="app-container">
        <header className="header">
          <h1>://kararsizkaldim.com</h1>
          <p>Her Konuda İkilemlerinizi Topluluk Çözüyor ve Oyluyor 🌐</p>
        </header>

        <nav className="navbar">
          <div className="nav-links-left">
            <NavLink to="/anketler" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}>
              Anketleri Oyla
            </NavLink>
            <NavLink to="/sor-sor" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}>
              Kararsız Kaldım?
            </NavLink>
          </div>

          <div className="nav-auth-right">
            {isAuthenticated ? (
              <div className="user-profile-menu">
                <span className="welcome-text">Hoş geldin, <strong>{user?.name}</strong> 👋</span>
                <button onClick={logout} className="logout-btn">Çıkış Yap</button>
              </div>
            ) : (
              <NavLink to="/login" className={({ isActive }) => `nav-btn auth-nav-btn ${isActive ? 'active' : ''}`}>
                Giriş Yap / Üye Ol
              </NavLink>
            )}
          </div>
        </nav>

        <main className="content">
          <Routes>
            <Route path="/" element={<Navigate to="/anketler" replace />} />
             <Route path="/anketler" element={<Anketler polls={polls} onVote={handleVote} onUpvote={handleUpvote} sortBy={sortBy} setSortBy={setSortBy} onDeletePoll={handleDeletePoll}/>} />
            <Route path="/anketler/:id" element={<AnketDetay polls={polls} onVote={handleVote} onUpvote={handleUpvote} onDeletePoll={handleDeletePoll}/>} />
            <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/anketler" replace />} />
            <Route path="/sor-sor" element={isAuthenticated ? <SorSor onPollCreated={fetchPolls} /> : <Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;

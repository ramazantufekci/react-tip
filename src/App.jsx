import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Anketler from './components/Anketler';
import SorSor from './components/SorSor';
import AnketDetay from './components/AnketDetay';
import Login from './components/Login'; // Giriş bileşenini içe aktarıyoruz
import { useAuth } from './context/AuthContext'; // Auth hook'unu çağırıyoruz
import './App.css';

const API_BASE_URL = 'http://localhost:8000/api';

function App() {
  const { user, token, logout, isAuthenticated, loading: authLoading } = useAuth();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  const [myVotes, setMyVotes] = useState(() => {
    const savedVotes = localStorage.getItem('my_votes');
    return savedVotes ? JSON.parse(savedVotes) : [];
  });

  const [myUpvotes, setMyUpvotes] = useState(() => {
    const savedUpvotes = localStorage.getItem('my_upvotes');
    return savedUpvotes ? JSON.parse(savedUpvotes) : [];
  });

  // Verileri çekme mantığı
  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/polls`);
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

    fetchPolls();
  }, [myVotes, myUpvotes]);

  // Oy verme işlemi (Token korumalı)
  const handleVote = async (pollId, optionIndex) => {
    if (!isAuthenticated) {
      alert("Oy kullanabilmek için lütfen giriş yapın!");
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
      }
    } catch (error) {
      console.error("Oy verilemedi:", error);
    }
  };

  // Upvote işlemi (Token korumalı)
  const handleUpvote = async (pollId) => {
    if (!isAuthenticated) {
      alert("Yukarı taşıma işlemi için lütfen giriş yapın!");
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

  // Auth durumu yüklenirken bekleme ekranı
  if (authLoading || loading) return <div className="loading-screen">Oturum kontrol ediliyor... ⏳</div>;

  return (
    <BrowserRouter>
      <div className="app-container">
        <header className="header">
          <h1>://kararsizkaldim.com</h1>
          <p>Her Konuda İkilemlerinizi Topluluk Çözüyor ve Oyluyor 🌐</p>
        </header>

        {/* 🌟 GÜNCELLENEN DİNAMİK NAVBAR YAPISI */}
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
            <Route path="/anketler" element={<Anketler polls={polls} onVote={handleVote} onUpvote={handleUpvote} />} />
            <Route path="/anketler/:id" element={<AnketDetay polls={polls} onVote={handleVote} onUpvote={handleUpvote} />} />
            <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/anketler" replace />} />
            
            {/* 🔒 Korumalı Rota: Giriş yapmayan kullanıcı soru soramaz, login sayfasına fırlatılır */}
            <Route path="/sor-sor" element={isAuthenticated ? <SorSor /> : <Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;

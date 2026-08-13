// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Anketler from './components/Anketler';
import SorSor from './components/SorSor';
import AnketDetay from './components/AnketDetay';
import Login from './components/Login'; // Giriş bileşenini içe aktarıyoruz
import { useAuth } from './context/AuthContext'; // Auth hook'unu çağırıyoruz
import './App.css';
// En üstte API_BASE_URL'i merkezi dosyadan aldığınızdan emin olun
import { API_BASE_URL } from './config'; 

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

  // 🌟 1. DEĞİŞİKLİK: fetchPolls fonksiyonunu useEffect dışına çıkartıp bağımsız yapıyoruz
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

  // Sayfa ilk açıldığında veya oylarım değiştiğinde tetiklenir
  useEffect(() => {
    fetchPolls();
  }, [myVotes, myUpvotes]);
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
  // handleVote ve handleUpvote kodları aynen kalıyor...

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
        {/* Header ve Navbar alanları aynen kalıyor... */}

        <main className="content">
          <Routes>
            <Route path="/" element={<Navigate to="/anketler" replace />} />
            <Route path="/anketler" element={<Anketler polls={polls} onVote={handleVote} onUpvote={handleUpvote} />} />
            <Route path="/anketler/:id" element={<AnketDetay polls={polls} onVote={handleVote} onUpvote={handleUpvote} />} />
            <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/anketler" replace />} />
            
            {/* 🌟 2. DEĞİŞİKLİK: SorSor bileşenine onPollCreated prop'u ile fonksiyonu paslıyoruz */}
            <Route 
              path="/sor-sor" 
              element={isAuthenticated ? <SorSor onPollCreated={fetchPolls} /> : <Navigate to="/login" replace />} 
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;

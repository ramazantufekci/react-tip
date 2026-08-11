import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Anketler from './components/Anketler';
import SorSor from './components/SorSor';
import AnketDetay from './components/AnketDetay';
import Login from './components/Login'; // Giriş bileşenini içe aktarıyoruz
import { useAuth } from './context/AuthContext'; // Auth hook'unu çağırıyoruz
import './App.css';

const API_BASE_URL = 'https://smarttools.kararsizkaldim.com/api';

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
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Anketler from './components/Anketler';
import SorSor from './components/SorSor';
import AnketDetay from './components/AnketDetay';
import './App.css';
import { useAuth } from './context/AuthContext';

// Laravel API'nizin temel URL adresi
const API_BASE_URL = 'https://smarttools.kararsizkaldim.com/api';

function App() {
  const [polls, setPolls] = useState([]);
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  // 1. ADIM: useEffect ile Verileri Laravel'den Çekme
  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/polls`);
        if (response.ok) {
          const data = await response.json();
          
          // Laravel'den gelen ham 'options' string/object kontrolü
          const formattedPolls = data.map(poll => ({
            ...poll,
            options: typeof poll.options === 'string' ? JSON.parse(poll.options) : poll.options,
            voted: false,       // Tarayıcı oturum kontrolü için geçici state
            upvotedByMe: false  // Tarayıcı oturum kontrolü için geçici state
          }));
          
          setPolls(formattedPolls);
        }
      } catch (error) {
        console.error("Anketler yüklenirken API hatası oluştu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPolls();
  }, []); // Boş array: Sadece sayfa ilk açıldığında 1 kere çalışır

  // 2. ADIM: Anketteki Şıklara Oy Verme (Laravel Entegrasyonu)
  const handleVote = async (pollId, optionIndex) => {
    try {
      // Laravel tarafında kuracağınız '/polls/{id}/vote' ucuna istek atıyoruz
      const response = await fetch(`${API_BASE_URL}/polls/${pollId}/vote`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json',
                 'Authorization': `Bearer ${token}`},
        body: JSON.stringify({ option_index: optionIndex })
      });

      if (response.ok) {
        // API başarılı döndüyse arayüzdeki state'i güncelliyoruz
        setPolls(polls.map(poll => {
          if (poll.id === pollId) {
            const updatedOptions = [...poll.options];
            updatedOptions[optionIndex].votes += 1;
            const newTotalVotes = (poll.totalVotes || 0) + 1;
            return { ...poll, options: updatedOptions, totalVotes: newTotalVotes, voted: true };
          }
          return poll;
        }));
      }
    } catch (error) {
      console.error("Oy verilirken hata oluştu:", error);
    }
  };

  // 3. ADIM: Anketi Yukarı Taşıma / Upvote (Laravel Entegrasyonu)
  const handleUpvote = async (pollId) => {
    // Arayüzde bekleme hissi yaratmamak için mevcut durumu alalım
    const targetPoll = polls.find(p => p.id === pollId);
    if (!targetPoll) return;
    const actionType = targetPoll.upvotedByMe ? 'remove':'add';
    try {
      // Laravel tarafındaki upvote ucuna istek atıyoruz
      const response = await fetch(`${API_BASE_URL}/polls/${pollId}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
                 'Authorization': `Bearer ${token}`},
        body: JSON.stringify({ action: actionType }) // Laravel'e ne yapacağını söylüyoruz
      });

      if (response.ok) {
        setPolls(polls.map(poll => {
          if (poll.id === pollId) {
            const hasUpvoted = poll.upvotedByMe;
            return {
              ...poll,
              upvotes: hasUpvoted ? Math.Max(0,poll.upvotes - 1) : poll.upvotes + 1,
              upvotedByMe: !hasUpvoted
            };
          }
          return poll;
        }));
      }
    } catch (error) {
      console.error("Upvote işlemi başarısız oldu:", error);
    }
  };

  // 4. ADIM: Yeni Yorum Ekleme (Laravel Entegrasyonu)
  const handleAddComment = async (pollId, commentText) => {
    try {
      // Gelecekte Laravel'de hazırlayacağınız yorum ucu için şablon
      const response = await fetch(`${API_BASE_URL}/polls/${pollId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
                 'Authorization': `Bearer ${token}`},
        body: JSON.stringify({ text: commentText, user: "Misafir Kullanıcı" })
      });

      if (response.ok) {
        const newComment = await response.json();
        setComments({
          ...comments,
          [pollId]: [...(comments[pollId] || []), newComment]
        });
      }
    } catch (error) {
      // API entegrasyonu tamamen bitene kadar frontend'in çökmemesi için fallback yapısı
      const fallbackComment = { id: Date.now(), user: "Misafir Kullanıcı", text: commentText };
      setComments({
        ...comments,
        [pollId]: [...(comments[pollId] || []), fallbackComment]
      });
    }
  };

  if (loading) {
    return <div className="loading-screen">Veriler veri tabanından yükleniyor... ⏳</div>;
  }

  return (
    <BrowserRouter>
      <div className="app-container">
        <header className="header">
          <h1>://kararsizkaldim.com</h1>
          <p>Her Konuda İkilemlerinizi Topluluk Çözüyor ve Oyluyor 🌐</p>
        </header>

        <nav className="navbar">
          <NavLink to="/anketler" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}>
            Anketleri Oyla
          </NavLink>
          <NavLink to="/sor-sor" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}>
            Kararsız Kaldım?
          </NavLink>
        </nav>

        <main className="content">
          <Routes>
            <Route path="/" element={<Navigate to="/anketler" replace />} />
            <Route 
              path="/anketler" 
              element={<Anketler polls={polls} onVote={handleVote} onUpvote={handleUpvote} />} 
            />
            <Route 
              path="/sor-sor" 
              element={<SorSor />} // onAddPoll artık Laravel içinde doğrudan çözülüyor
            />
            <Route 
              path="/anketler/:id" 
              element={<AnketDetay polls={polls} comments={comments} onVote={handleVote} onAddComment={handleAddComment} onUpvote={handleUpvote} />} 
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;

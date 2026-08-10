import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Anketler from './components/Anketler';
import SorSor from './components/SorSor';
import AnketDetay from './components/AnketDetay';
import './App.css';

// Laravel API'nizin temel URL adresi
const API_BASE_URL = 'https://smarttools.kararsizkaldim.com/api';

function App() {
  const [polls, setPolls] = useState([]);
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(true);

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
        headers: { 'Content-Type': 'application/json' },
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

    try {
      // Laravel tarafındaki upvote ucuna istek atıyoruz
      const response = await fetch(`${API_BASE_URL}/polls/${pollId}/upvote`, {
        method: 'POST'
      });

      if (response.ok) {
        setPolls(polls.map(poll => {
          if (poll.id === pollId) {
            const hasUpvoted = poll.upvotedByMe;
            return {
              ...poll,
              upvotes: hasUpvoted ? poll.upvotes - 1 : poll.upvotes + 1,
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
        headers: { 'Content-Type': 'application/json' },
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

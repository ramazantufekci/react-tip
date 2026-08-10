import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Anketler from './components/Anketler';
import SorSor from './components/SorSor';
import AnketDetay from './components/AnketDetay';
import './App.css';

function App() {
  const [polls, setPolls] = useState([
    {
      id: 1,
      question: "Cilt kuruluğu için hangi nemlendirici kremi önerirsiniz?",
      category: "Cilt Bakımı", // Yeni Alan
      upvotes: 24,           // Yeni Alan (Yukarı taşıma sayısı)
      upvotedByMe: false,    // Yeni Alan (Kullanıcı tıkladı mı?)
      options: [
        { text: "La Roche-Posay Lipikar", votes: 142 },
        { text: "CeraVe Moisturizing Cream", votes: 198 }
      ],
      totalVotes: 340,
      voted: false
    },
    {
      id: 2,
      question: "Sınav döneminde odaklanma için hangi takviye daha etkili?",
      category: "Takviye Edici Gıda", // Yeni Alan
      upvotes: 12,                  // Yeni Alan
      upvotedByMe: false,           // Yeni Alan
      options: [
        { text: "Omega 3 (Balık Yağı)", votes: 85 },
        { text: "Ginkgo Biloba & B Vitamini", votes: 64 }
      ],
      totalVotes: 149,
      voted: false
    }
  ]);

  // Yorumları tutan merkezi state
  const [comments, setComments] = useState({
    1: [
      { id: 1, user: "Ahmet K.", text: "CeraVe bende sivilce yaptı, Lipikar çok daha yoğun." },
      { id: 2, user: "Ayşe Y.", text: "Kuru ciltler kesinlikle CeraVe kullanmalı, harika nemlendiriyor." }
    ],
    2: [
      { id: 1, user: "Can M.", text: "B vitamini kompleksi sınav sabahları kurtarıcım oluyor." }
    ]
  });

  // Anket seçeneklerine oy verme fonksiyonu
  const handleVote = (pollId, optionIndex) => {
    setPolls(polls.map(poll => {
      if (poll.id === pollId && !poll.voted) {
        const updatedOptions = [...poll.options];
        updatedOptions[optionIndex].votes += 1;
        return { ...poll, options: updatedOptions, totalVotes: poll.totalVotes + 1, voted: true };
      }
      return poll;
    }));
  };

  // Yeni Alan: Anketi yukarı taşıma (Upvote) fonksiyonu
  const handleUpvote = (pollId) => {
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
  };

  // Yeni anket ekleme fonksiyonu (Kategori desteğiyle)
  const handleAddPoll = (newPoll) => {
    const formattedPoll = {
      ...newPoll,
      upvotes: 0,
      upvotedByMe: false
    };
    setPolls([formattedPoll, ...polls]);
  };

  // Yeni yorum ekleme fonksiyonu
  const handleAddComment = (pollId, commentText) => {
    const newComment = {
      id: Date.now(),
      user: "Misafir Kullanıcı",
      text: commentText
    };
    setComments({
      ...comments,
      [pollId]: [...(comments[pollId] || []), newComment]
    });
  };

  return (
    <BrowserRouter>
      <div className="app-container">
        <header className="header">
          <h1>://kararsizkaldim.com</h1>
          <p>Sağlık ve Kozmetikte İkilemlerinizi Topluluk Çözüyor 🩺</p>
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
            {/* Anketler bileşenine upvote fonksiyonunu ve güncel anketleri geçiyoruz */}
            <Route 
              path="/anketler" 
              element={<Anketler polls={polls} onVote={handleVote} onUpvote={handleUpvote} />} 
            />
            <Route 
              path="/sor-sor" 
              element={<SorSor onAddPoll={handleAddPoll} nextId={polls.length + 1} />} 
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

import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Anketler from './components/Anketler';
import SorSor from './components/SorSor';
import './App.css';

function App() {
  // Başlangıç anket verileri (Merkezi State)
  const [polls, setPolls] = useState([
    {
      id: 1,
      question: "Cilt kuruluğu için hangi nemlendirici kremi önerirsiniz?",
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
      options: [
        { text: "Omega 3 (Balık Yağı)", votes: 85 },
        { text: "Ginkgo Biloba & B Vitamini", votes: 64 }
      ],
      totalVotes: 149,
      voted: false
    }
  ]);

  // Oy verme fonksiyonu
  const handleVote = (pollId, optionIndex) => {
    setPolls(polls.map(poll => {
      if (poll.id === pollId && !poll.voted) {
        const updatedOptions = [...poll.options];
        updatedOptions[optionIndex].votes += 1;
        return {
          ...poll,
          options: updatedOptions,
          totalVotes: poll.totalVotes + 1,
          voted: true
        };
      }
      return poll;
    }));
  };

  // Yeni anket ekleme fonksiyonu
  const handleAddPoll = (newPoll) => {
    setPolls([newPoll, ...polls]);
  };

  return (
    <BrowserRouter>
      <div className="app-container">
        {/* Üst Başlık */}
        <header className="header">
          <h1>://kararsizkaldim.com</h1>
          <p>Sağlık ve Kozmetikte İkilemlerinizi Topluluk Çözüyor 🩺</p>
        </header>

        {/* Gerçek Linklerle Navigasyon Barı */}
        <nav className="navbar">
          <NavLink 
            to="/anketler" 
            className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}
          >
            Anketleri Oyla
          </NavLink>
          <NavLink 
            to="/sor-sor" 
            className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}
          >
            Kararsız Kaldım?
          </NavLink>
        </nav>

        {/* Dinamik Rota Alanı */}
        <main className="content">
          <Routes>
            {/* Anasayfaya gelindiğinde direkt /anketler'e yönlendirir */}
            <Route path="/" element={<Navigate to="/anketler" replace />} />
            
            <Route 
              path="/anketler" 
              element={<Anketler polls={polls} onVote={handleVote} />} 
            />
            
            <Route 
              path="/sor-sor" 
              element={<SorSor onAddPoll={handleAddPoll} nextId={polls.length + 1} />} 
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;

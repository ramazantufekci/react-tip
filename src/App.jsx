import React, { useState } from 'react';
import { Vote, PlusCircle, BarChart3, ShieldCheck } from 'lucide-react';
import './App.css';

function App() {
  // Aktif sekmeyi tutan state (SPA yönlendirmesi simülasyonu)
  const [activeTab, setActiveTab] = useState('anketler');

  // Başlangıç anket verileri
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

  // Yeni anket formu için stateler
  const [newQuestion, setNewQuestion] = useState('');
  const [opt1, setOpt1] = useState('');
  const [opt2, setOpt2] = useState('');

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
  const handleCreatePoll = (e) => {
    e.preventDefault();
    if (!newQuestion || !opt1 || !opt2) return;

    const newPoll = {
      id: polls.length + 1,
      question: newQuestion,
      options: [
        { text: opt1, votes: 0 },
        { text: opt2, votes: 0 }
      ],
      totalVotes: 0,
      voted: false
    };

    setPolls([newPoll, ...polls]);
    setNewQuestion('');
    setOpt1('');
    setOpt2('');
    setActiveTab('anketler'); // Listeye geri dön
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <h1>eczanecim.kararsizkaldim.com</h1>
        <p>Sağlık ve Kozmetikte İkilemlerinizi Topluluk Çözüyor 🩺</p>
      </header>

      {/* İstemci Taraflı Menü (Sunucuya istek atmaz) */}
      <nav className="navbar">
        <button 
          className={`nav-btn ${activeTab === 'anketler' ? 'active' : ''}`}
          onClick={() => setActiveTab('anketler')}
        >
          Anketleri Oyla
        </button>
        <button 
          className={`nav-btn ${activeTab === 'sor' ? 'active' : ''}`}
          onClick={() => setActiveTab('sor')}
        >
          Kararsız Kaldım?
        </button>
      </nav>

      {/* Dinamik İçerik Alanı */}
      <main className="content">
        {activeTab === 'anketler' ? (
          <div>
            {polls.map((poll) => (
              <div key={poll.id} className="poll-card">
                <h3 className="poll-question">{poll.question}</h3>
                <div>
                  {poll.options.map((option, index) => {
                    // Yüzde hesaplama
                    const percent = poll.totalVotes > 0 
                      ? Math.round((option.votes / poll.totalVotes) * 100) 
                      : 0;
                    
                    return (
                      <button 
                        key={index} 
                        className="option-btn"
                        onClick={() => handleVote(poll.id, index)}
                        disabled={poll.voted}
                      >
                        {/* Oy verildiyse arkada doluluk çubuğu gösterir */}
                        {poll.voted && (
                          <div className="result-bar" style={{ width: `${percent}%` }}></div>
                        )}
                        <span className="option-text">
                          <span>{option.text}</span>
                          {poll.voted && <span>%{percent} ({option.votes})</span>}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="poll-footer">
                  <span>📊 Toplam Oy: {poll.totalVotes}</span>
                  {poll.voted && <span style={{color: 'var(--primary)'}}>✓ Oyunuz Kaydedildi</span>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="poll-card">
            <h2 style={{marginTop: 0, fontSize: '1.25rem'}}>Yeni Kararsızlık Anketi Aç</h2>
            <form onSubmit={handleCreatePoll}>
              <div className="form-group">
                <label>Kararsız Kaldığınız Soru:</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Örn: Hangi güneş kremi leke yapmaz?"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>1. Seçenek (Ürün / Marka):</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Seçenek A"
                  value={opt1}
                  onChange={(e) => setOpt1(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>2. Seçenek (Ürün / Marka):</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Seçenek B"
                  value={opt2}
                  onChange={(e) => setOpt2(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="submit-btn">Anketi Canlıya Al</button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

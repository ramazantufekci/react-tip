import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SorSor({ onAddPoll, nextId }) {
  const [question, setQuestion] = useState('');
  const [opt1, setOpt1] = useState('');
  const [opt2, setOpt2] = useState('');
  
  // Sayfa yönlendirmesi tetiklemek için kullanılan kanca
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!question || !opt1 || !opt2) return;

    const newPoll = {
      id: nextId,
      question: question,
      options: [
        { text: opt1, votes: 0 },
        { text: opt2, votes: 0 }
      ],
      totalVotes: 0,
      voted: false
    };

    onAddPoll(newPoll);
    
    // Form başarıyla eklenince programatik olarak /anketler sayfasına yönlendir
    navigate('/anketler');
  };

  return (
    <div className="poll-card">
      <h2 style={{marginTop: 0, fontSize: '1.25rem'}}>Yeni Kararsızlık Anketi Aç</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Kararsız Kaldığınız Soru:</label>
          <input 
            type="text" 
            className="form-control" 
            placeholder="Örn: Hangi güneş kremi leke yapmaz?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
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
  );
}

export default SorSor;

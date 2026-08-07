import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';

function AnketDetay({ polls, comments, onVote, onAddComment }) {
  const { id } = useParams(); // URL'deki :id parametresini alır (Örn: "1")
  const pollId = parseInt(id);
  
  const [commentInput, setCommentInput] = useState('');

  // İlgili anketi bul
  const poll = polls.find(p => p.id === pollId);
  // İlgili ankete ait yorumları getir
  const pollComments = comments[pollId] || [];

  if (!poll) {
    return (
      <div className="poll-card">
        <h3>Aradığınız anket bulunamadı.</h3>
        <Link to="/anketler">Anketlere Dön</Link>
      </div>
    );
  }

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    onAddComment(pollId, commentInput);
    setCommentInput('');
  };

  return (
    <div>
      <Link to="/anketler" style={{ display: 'inline-block', marginBottom: '1rem', color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>
        ← Anketlere Geri Dön
      </Link>

      {/* Anket Durumu */}
      <div className="poll-card">
        <h3 className="poll-question">{poll.question}</h3>
        <div>
          {poll.options.map((option, index) => {
            const percent = poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0;
            return (
              <button key={index} className="option-btn" onClick={() => onVote(poll.id, index)} disabled={poll.voted}>
                {poll.voted && <div className="result-bar" style={{ width: `${percent}%` }}></div>}
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
        </div>
      </div>

      {/* Yorumlar Bölümü */}
      <div className="poll-card">
        <h4 style={{ marginTop: 0, borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>💬 Kullanıcı Yorumları ({pollComments.length})</h4>
        
        <div className="comments-list" style={{ marginBottom: '1.5rem' }}>
          {pollComments.length === 0 ? (
            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
          ) : (
            pollComments.map((comment) => (
              <div key={comment.id} style={{ background: '#f9fafb', padding: '10px', borderRadius: '6px', marginBottom: '8px', fontSize: '0.9rem' }}>
                <strong style={{ color: 'var(--primary-dark)', display: 'block', marginBottom: '2px' }}>{comment.user}</strong>
                <span>{comment.text}</span>
              </div>
            ))
          )}
        </div>

        {/* Yorum Yapma Formu */}
        <form onSubmit={handleCommentSubmit}>
          <div className="form-group">
            <textarea 
              className="form-control" 
              rows="3" 
              placeholder="Deneyimlerinizi paylaşın veya tavsiyede bulunun..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              style={{ resize: 'none', fontFamily: 'inherit' }}
              required
            ></textarea>
          </div>
          <button type="submit" className="submit-btn" style={{ padding: '8px 12px', width: 'auto', float: 'right' }}>Yorum Gönder</button>
          <div style={{ clear: 'both' }}></div>
        </form>
      </div>
    </div>
  );
}

export default AnketDetay;

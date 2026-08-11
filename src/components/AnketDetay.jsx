import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

// Laravel API'nizin temel URL adresi
const API_BASE_URL = 'http://localhost:8000/api';

function AnketDetay({ polls, onVote, onUpvote }) {
  const { id } = useParams();
  const [commentInput, setCommentInput] = useState('');
  const [pollComments, setPollComments] = useState([]); // Yorumları API'den alıp burada tutacağız
  const [loadingComments, setLoadingComments] = useState(true);

  // Merkezi `polls` state'i içinden ilgili anketi buluyoruz
  const poll = polls.find(p => p.id === parseInt(id));

  // 1. ADIM: useEffect ile Bu Ankete Ait Yorumları Laravel'den Çekme
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/polls/${id}/comments`);
        if (response.ok) {
          const data = await response.json();
          setPollComments(data); // Veri tabanından gelen yorumları state'e aktar
        }
      } catch (error) {
        console.error("Yorumlar çekilirken API hatası oluştu:", error);
      } finally {
        setLoadingComments(false);
      }
    };

    fetchComments();
  }, [id]); // id değiştiğinde yorumları yeniden yükler

  if (!poll) {
    return (
      <div className="error-container">
        <h2>Anket Bulunamadı 😕</h2>
        <Link to="/anketler" className="back-btn">Anketlere Geri Dön</Link>
      </div>
    );
  }

  // 2. ADIM: Yeni Yorum Gönderme ve Veri Tabanına Kaydetme
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/polls/${poll.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: commentInput,
          user: "Misafir Kullanıcı" // İleride üyelik sistemi gelirse burası dinamikleşir
        })
      });

      if (response.ok) {
        const newCommentFromBackend = await response.json();
        
        // Listeyi anlık güncellemek için yeni gelen yorumu listenin en üstüne ekliyoruz
        setPollComments([newCommentFromBackend, ...pollComments]);
        setCommentInput(''); // Giriş alanını temizle
      } else {
        alert("Yorum kaydedilirken bir sunucu hatası oluştu.");
      }
    } catch (error) {
      console.error("Yorum gönderilirken bağlantı hatası:", error);
    }
  };

  return (
    <div className="anket-detay-container">
      <Link to="/anketler" className="back-link">⬅ Anketlere Geri Dön</Link>

      {/* Ana Anket Kartı */}
      <div className="poll-detailed-card">
        
        {/* Sol Taraf: Detaylı Upvote Alanı */}
        <div className="upvote-section">
          <button 
            className={`upvote-btn ${poll.upvotedByMe ? 'upvoted' : ''}`}
            onClick={() => onUpvote(poll.id)}
            title="Yukarı Taşı"
          >
            🔼
          </button>
          <span className="upvote-count">{poll.upvotes}</span>
        </div>

        {/* Sağ Taraf: Anket Detayları */}
        <div className="poll-main-content">
          <div className="poll-header-info">
            <span className="poll-category-tag">{poll.category || 'Genel'}</span>
          </div>

          <h2 className="poll-detailed-question">{poll.question}</h2>

          {/* Eğer ankete ait bir resim varsa ekranda gösteriyoruz */}
          {poll.image_path && (
            <div className="poll-image-container">
              <img src={poll.image_path} alt={poll.question} className="poll-main-image" />
            </div>
          )}

          {/* Seçenekler Alanı */}
          <div className="poll-options">
            {poll.options.map((option, index) => {
              const percent = poll.totalVotes > 0 
                ? Math.round((option.votes / poll.totalVotes) * 100) 
                : 0;

              return (
                <button
                  key={index}
                  className={`poll-option-row ${poll.voted ? 'voted-disabled' : ''}`}
                  onClick={() => onVote(poll.id, index)}
                  disabled={poll.voted}
                >
                  {poll.voted && (
                    <div 
                      className="progress-bar-fill" 
                      style={{ width: `${percent}%` }}
                    />
                  )}
                  <span className="option-text">{option.text}</span>
                  {poll.voted && <span className="option-percent">%{percent} ({option.votes} oy)</span>}
                </button>
              );
            })}
          </div>

          <p className="total-votes-summary">Toplam kullanılan oy sayısı: <strong>{poll.totalVotes}</strong></p>
        </div>
      </div>

      {/* Yorumlar Bölümü */}
      <div className="comments-section">
        <h3>Topluluk Yorumları ({pollComments.length})</h3>

        {/* Yeni Yorum Ekleme Formu */}
        <form onSubmit={handleSubmitComment} className="comment-form">
          <textarea
            placeholder="Bu ikilem hakkında ne düşünüyorsunuz? Tavsiyenizi yazın..."
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            rows="3"
            required
          />
          <button type="submit" className="submit-comment-btn">Yorum Yap</button>
        </form>

        {/* Yorum Listesi */}
        <div className="comments-list">
          {loadingComments ? (
            <p className="loading-text">Yorumlar getiriliyor... ⏳</p>
          ) : pollComments.length === 0 ? (
            <p className="no-comments">Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
          ) : (
            pollComments.map(comment => (
              <div key={comment.id} className="comment-card">
                <div className="comment-header">
                  <span className="comment-user">👤 {comment.user}</span>
                  <span className="comment-date">
                    {new Date(comment.created_at).toLocaleDateString('tr-TR')}
                  </span>
                </div>
                <p className="comment-text">{comment.text}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default AnketDetay;
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';

function AnketDetay({ polls, comments, onVote, onAddComment, onUpvote }) {
  const { id } = useParams();
  const [commentInput, setCommentInput] = useState('');

  // URL'den gelen string id'yi sayıya çevirip ilgili anketi buluyoruz
  const poll = polls.find(p => p.id === parseInt(id));
  const pollComments = comments[id] || [];

  if (!poll) {
    return (
      <div className="error-container">
        <h2>Anket Bulunamadı 😕</h2>
        <Link to="/anketler" className="back-btn">Anketlere Geri Dön</Link>
      </div>
    );
  }

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    
    onAddComment(poll.id, commentInput);
    setCommentInput(''); // Giriş alanını temizle
  };

  return (
    <div className="anket-detay-container">
      <Link to="/anketler" className="back-link">⬅ Anketlere Geri Dön</Link>

      {/* Ana Anket Kartı */}
      <div className="poll-detailed-card">
        
        {/* Sol Taraf: Detaylı Upvote Alanı */}
        <div className="upvote-section">
          <button 
            className={`upvote-btn ${poll.upvotedByMe ? 'upvoted' : ''}`}
            onClick={() => onUpvote(poll.id)}
            title="Yukarı Taşı"
          >
            🔼
          </button>
          <span className="upvote-count">{poll.upvotes}</span>
        </div>

        {/* Sağ Taraf: Anket Detayları */}
        <div className="poll-main-content">
          <div className="poll-header-info">
            <span className="poll-category-tag">{poll.category || 'Genel'}</span>
          </div>

          <h2 className="poll-detailed-question">{poll.question}</h2>
          {poll.image_path && (
  <div className="poll-image-container">
    <img src={poll.image_path} alt={poll.question} className="poll-main-image" />
  </div>
)}


          {/* Seçenekler Alanı */}
          <div className="poll-options">
            {poll.options.map((option, index) => {
              const percent = poll.totalVotes > 0 
                ? Math.round((option.votes / poll.totalVotes) * 100) 
                : 0;

              return (
                <button
                  key={index}
                  className={`poll-option-row ${poll.voted ? 'voted-disabled' : ''}`}
                  onClick={() => onVote(poll.id, index)}
                  disabled={poll.voted}
                >
                  {poll.voted && (
                    <div 
                      className="progress-bar-fill" 
                      style={{ width: `${percent}%` }}
                    />
                  )}
                  <span className="option-text">{option.text}</span>
                  {poll.voted && <span className="option-percent">%{percent} ({option.votes} oy)</span>}
                </button>
              );
            })}
          </div>

          <p className="total-votes-summary">Toplam kullanılan oy sayısı: <strong>{poll.totalVotes}</strong></p>
        </div>
      </div>

      {/* Yorumlar Bölümü */}
      <div className="comments-section">
        <h3>Topluluk Yorumları ({pollComments.length})</h3>

        {/* Yeni Yorum Ekleme Formu */}
        <form onSubmit={handleSubmitComment} className="comment-form">
          <textarea
            placeholder="Bu ikilem hakkında ne düşünüyorsunuz? Tavsiyenizi yazın..."
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            rows="3"
            required
          />
          <button type="submit" className="submit-comment-btn">Yorum Yap</button>
        </form>

        {/* Yorum Listesi */}
        <div className="comments-list">
          {pollComments.length === 0 ? (
            <p className="no-comments">Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
          ) : (
            pollComments.map(comment => (
              <div key={comment.id} className="comment-card">
                <div className="comment-header">
                  <span className="comment-user">👤 {comment.user}</span>
                  <span className="comment-date">Şimdi</span>
                </div>
                <p className="comment-text">{comment.text}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default AnketDetay;

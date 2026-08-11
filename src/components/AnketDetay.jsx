import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const API_BASE_URL = 'https://smarttools.kararsizkaldim.com/api';

function AnketDetay({ polls, onVote, onUpvote }) {
  const { id } = useParams();
  const [commentInput, setCommentInput] = useState('');
  const [pollComments, setPollComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);
  
  // Hangi yorumun altına cevap yazıldığını takip eden state (Yorum ID'sini tutar)
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyInput, setReplyInput] = useState('');

  const poll = polls.find(p => p.id === parseInt(id));

  const fetchComments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/polls/${id}/comments`);
      if (response.ok) {
        const data = await response.json();
        setPollComments(data);
      }
    } catch (error) {
      console.error("Yorumlar çekilirken hata:", error);
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [id]);

  // Ana Yorum veya Yanıt Gönderme Fonksiyonu
  const handleCommentSubmit = async (e, parentId = null) => {
    e.preventDefault();
    const text = parentId ? replyInput : commentInput;
    if (!text.trim()) return;

    try {
      const response = await fetch(`${API_BASE_URL}/polls/${poll.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text,
          user: "Misafir Kullanıcı",
          parent_id: parentId // Yanıt ise ID gider, ana yorum ise null gider
        })
      });

      if (response.ok) {
        // En temiz yöntem listeyi veritabanından güncel haliyle yeniden çekmektir
        await fetchComments();
        
        // Formları temizle
        if (parentId) {
          setReplyInput('');
          setReplyingTo(null);
        } else {
          setCommentInput('');
        }
      }
    } catch (error) {
      console.error("Yorum kaydedilemedi:", error);
    }
  };

  if (!poll) return <div>Anket Bulunamadı.</div>;

  return (
    <div className="anket-detay-container">
      <Link to="/anketler" className="back-link">⬅ Anketlere Geri Dön</Link>

      {/* Anket Kartı Alanı */}
      <div className="poll-detailed-card">
        <div className="upvote-section">
          <button className={`upvote-btn ${poll.upvotedByMe ? 'upvoted' : ''}`} onClick={() => onUpvote(poll.id)}>🔼</button>
          <span className="upvote-count">{poll.upvotes}</span>
        </div>
        <div className="poll-main-content">
          <span className="poll-category-tag">{poll.category}</span>
          <h2 className="poll-detailed-question">{poll.question}</h2>
          {poll.image_path && (
            <div className="poll-image-container">
              <img src={poll.image_path} alt={poll.question} className="poll-main-image" />
            </div>
          )}
          <div className="poll-options">
            {poll.options.map((option, index) => {
              const percent = poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0;
              return (
                <button key={index} className={`poll-option-row ${poll.voted ? 'voted-disabled' : ''}`} onClick={() => onVote(poll.id, index)} disabled={poll.voted}>
                  {poll.voted && <div className="progress-bar-fill" style={{ width: `${percent}%` }} />}
                  <span className="option-text">{option.text}</span>
                  {poll.voted && <span className="option-percent">%{percent} ({option.votes} oy)</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Yorumlar ve Yanıtlar Bölümü */}
      <div className="comments-section">
        <h3>Topluluk Yorumları</h3>

        {/* Ana Yorum Formu */}
        <form onSubmit={(e) => handleCommentSubmit(e, null)} className="comment-form">
          <textarea
            placeholder="Tavsiyenizi veya düşüncenizi yazın..."
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            rows="3"
            required
          />
          <button type="submit" className="submit-comment-btn">Yorum Yap</button>
        </form>

        {/* Yorum Ağacı Listesi */}
        <div className="comments-list">
          {loadingComments ? (
            <p>Yorumlar yükleniyor... ⏳</p>
          ) : pollComments.length === 0 ? (
            <p>Henüz yorum yapılmamış.</p>
          ) : (
            pollComments.map(comment => (
              <div key={comment.id} className="comment-branch">
                
                {/* Ana Yorum Kutusu */}
                <div className="comment-card">
                  <div className="comment-header">
                    <span className="comment-user">👤 {comment.user}</span>
                    <span className="comment-date">{new Date(comment.created_at).toLocaleDateString('tr-TR')}</span>
                  </div>
                  <p className="comment-text">{comment.text}</p>
                  
                  <button 
                    className="reply-trigger-btn"
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  >
                    💬 Cevapla
                  </button>
                </div>

                {/* Dinamik Yanıt Verme Formu (Sadece tıklanan yorumun altında açılır) */}
                {replyingTo === comment.id && (
                  <form onSubmit={(e) => handleCommentSubmit(e, comment.id)} className="reply-form">
                    <input 
                      type="text"
                      placeholder={`${comment.user} kullanıcısına yanıt ver...`}
                      value={replyInput}
                      onChange={(e) => setReplyInput(e.target.value)}
                      required
                      autoFocus
                    />
                    <div className="reply-form-actions">
                      <button type="submit" className="reply-submit-btn">Gönder</button>
                      <button type="button" className="reply-cancel-btn" onClick={() => setReplyingTo(null)}>İptal</button>
                    </div>
                  </form>
                )}

                {/* Alt Yanıtların Listelendiği Alan (Replies) */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="replies-container">
                    {comment.replies.map(reply => (
                      <div key={reply.id} className="reply-card">
                        <div className="comment-header">
                          <span className="comment-user">↩ {reply.user}</span>
                          <span className="comment-date">{new Date(reply.created_at).toLocaleDateString('tr-TR')}</span>
                        </div>
                        <p className="comment-text">{reply.text}</p>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default AnketDetay;

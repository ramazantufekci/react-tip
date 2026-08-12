import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

const API_BASE_URL = 'https://smarttools.kararsizkaldim.com/api';

function AnketDetay({ polls = [], onVote, onUpvote }) {
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [commentInput, setCommentInput] = useState('');
  
  // Hata önleyici: pollComments varsayılan olarak boş bir array olmalı
  const [pollComments, setPollComments] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);

  const [replyingToId, setReplyingToId] = useState(null);
  const [replyInput, setReplyInput] = useState('');

  // Sayısal karşılaştırma garantisi
  const poll = polls.find(p => p.id === parseInt(id));

  const fetchComments = useCallback(async (pageNumber, isNewComment = false) => {
    if (!id) return;
    setLoadingComments(true);

    try {
      const response = await fetch(`${API_BASE_URL}/polls/${id}/comments?page=${pageNumber}`);
      if (response.ok) {
        const result = await response.json();
        
        // Backend'den data gelip gelmediğini güvenli kontrol ediyoruz
        const newComments = result.data || [];

        if (isNewComment || pageNumber === 1) {
          setPollComments(newComments);
          setPage(1);
        } else {
          setPollComments(prev => [...(Array.isArray(prev) ? prev : []), ...newComments]);
        }
        
        setHasMore(result.has_more ?? false);
      }
    } catch (error) {
      console.error("Yorumlar yüklenirken hata oluştu:", error);
    } finally {
      setLoadingComments(false);
    }
  }, [id]);

  // İlk yüklemede ve id değiştiğinde tetikle
  useEffect(() => {
    if (id) {
      setPollComments([]);
      setPage(1);
      setHasMore(true);
      fetchComments(1);
    }
  }, [id, fetchComments]);

  // Kaydırma Takipçisi
  useEffect(() => {
    const handleScroll = () => {
      if (loadingComments || !hasMore) return;

      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 120) {
        setPage(prevPage => {
          const nextPage = prevPage + 1;
          fetchComments(nextPage);
          return nextPage;
        });
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loadingComments, fetchComments]);

  const handleCommentSubmit = async (e, parentId = null) => {
    e.preventDefault();
     // 🌟 KRİTİK KONTROL: Kullanıcı giriş yapmamışsa engelle ve logine fırlat
    if (!isAuthenticated) {
      alert("Yorum yazabilmek veya yanıt verebilmek için lütfen önce giriş yapın! 🔑");
      navigate('/login');
      return;
    }
    const text = parentId ? replyInput : commentInput;
    if (!text.trim()) return;

    try {
      const response = await fetch(`${API_BASE_URL}/polls/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
                 'Authorization': `Bearer ${token}`},
        body: JSON.stringify({
          text: text,
          parent_id: parentId
        })
      });

      if (response.ok) {
        setReplyInput('');
        setCommentInput('');
        setReplyingToId(null);
        await fetchComments(1, true);
      }else if(response.status === 401){
        alert("Oturum süreniz dolmuş, lütfen tekrar giriş yapın.");
        navigate('/login');
      }
    } catch (error) {
      console.error("Yorum kaydedilemedi:", error);
    }
  };

  // Eğer anket merkezi state'den henüz yüklenmediyse yükleniyor basıyoruz (Boş sayfa kalmasını önler)
  if (!poll) {
    return (
      <div className="error-container" style={{ textAlign: 'center', padding: '40px' }}>
        <h2>Anket Yükleniyor veya Bulunamadı... ⏳</h2>
        <Link to="/anketler" className="back-link">Anketlere Geri Dön</Link>
      </div>
    );
  }

  return (
    <div className="anket-detay-container">
      <Link to="/anketler" className="back-link">⬅ Anketlere Geri Dön</Link>

      <div className="poll-detailed-card">
        <div className="upvote-section">
          <button className={`upvote-btn ${poll.upvotedByMe ? 'upvoted' : ''}`} onClick={() => onUpvote(poll.id)}>🔼</button>
          <span className="upvote-count">{poll.upvotes ?? 0}</span>
        </div>
        <div className="poll-main-content">
          <span className="poll-category-tag">{poll.category || 'Genel'}</span>
          <h2 className="poll-detailed-question">{poll.question}</h2>
          {poll.image_path && (
            <div className="poll-image-container">
              <img src={poll.image_path} alt={poll.question} className="poll-main-image" />
            </div>
          )}
         <div className="poll-options resimli-comparison-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>
  {(poll.options || []).map((option, index) => {
    const percent = poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0;
    const hasImage = !!option.image_path;

    return (
      <div key={index} className="comparison-card" style={{ width: '100%' }}>
        {hasImage ? (
          /* 📸 RESİMLİ TASARIM: Yazı yok, resmin kendisi buton */
          <div 
            className={`clickable-image-container ${poll.voted ? 'voted' : ''}`}
            onClick={() => !poll.voted && onVote(poll.id, index)}
            style={{
              position: 'relative',
              width: '100%',
              height: '260px',
              borderRadius: '12px',
              overflow: 'hidden',
              cursor: poll.voted ? 'default' : 'pointer',
              border: '2px solid #eee',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
            }}
          >
            <img src={option.image_path} alt={option.text} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            
            {/* İsteğe bağlı girilen küçük metin varsa resmin en altında küçük bir etiket olarak gösterilir */}
            {option.text && (
              <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                {option.text}
              </div>
            )}

            {/* Oy verildikten sonra resmin üzerine gelen şeffaf yüzdelik katmanı */}
            {poll.voted && (
              <div className="image-voted-overlay" style={{
                position: 'absolute',
                top: 0, left: 0, width: '100%', height: '100%',
                background: 'rgba(0, 123, 255, 0.65)',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '28px',
                fontWeight: 'bold',
                animation: 'fadeIn 0.3s ease-in'
              }}>
                <span>%{percent}</span>
                <span style={{ fontSize: '14px', fontWeight: 'normal', marginTop: '4px' }}>{option.votes} Oy</span>
              </div>
            )}
          </div>
        ) : (
          /* 📝 RESİMSİZ TASARIM: Eski klasik buton yapısı */
          <button
            className={`poll-option-row ${poll.voted ? 'voted-disabled' : ''}`}
            onClick={() => onVote(poll.id, index)}
            disabled={poll.voted}
            style={{ width: '100%', position: 'relative' }}
          >
            {poll.voted && <div className="progress-bar-fill" style={{ width: `${percent}%` }} />}
            <span className="option-text">{option.text}</span>
            {poll.voted && <span className="option-percent">%{percent} ({option.votes} oy)</span>}
          </button>
        )}
      </div>
    );
  })}
</div>

          <p className="total-votes-summary">Toplam kullanılan oy sayısı: <strong>{poll.totalVotes ?? 0}</strong></p>
        </div>
      </div>

      <div className="comments-section">
        <h3>Topluluk Yorumları</h3>

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

        <div className="comments-list">
          {Array.isArray(pollComments) && pollComments.map(comment => (
            <CommentNode 
              key={comment.id} 
              comment={comment}
              replyingToId={replyingToId}
              setReplyingToId={setReplyingToId}
              replyInput={replyInput}
              setReplyInput={setReplyInput}
              handleCommentSubmit={handleCommentSubmit}
            />
          ))}
          
          {loadingComments && (
            <div className="loading-more-comments">Yorumlar yükleniyor... ⏳</div>
          )}
          
          {!hasMore && Array.isArray(pollComments) && pollComments.length > 0 && (
            <div className="no-more-comments">Tüm yorumlar yüklendi. ✔</div>
          )}
        </div>
      </div>
    </div>
  );
}

function CommentNode({ comment, replyingToId, setReplyingToId, replyInput, setReplyInput, handleCommentSubmit }) {
  if (!comment) return null;
  const childList = comment.childReplies || comment.child_replies || [];

  return (
    <div className="comment-node-branch" style={{ width: '100%' }}>
      <div className="comment-card">
        <div className="comment-header">
          <span className="comment-user">
  👤 {comment.author ? comment.author.name : (comment.user || 'Kullanıcı')}
</span>
          <span className="comment-date">
            {comment.created_at ? new Date(comment.created_at).toLocaleDateString('tr-TR') : 'Şimdi'}
          </span>
        </div>
        <p className="comment-text">{comment.text}</p>
        <button className="reply-trigger-btn" onClick={() => setReplyingToId(replyingToId === comment.id ? null : comment.id)}>💬 Cevapla</button>
      </div>

      {replyingToId === comment.id && (
        <form onSubmit={(e) => handleCommentSubmit(e, comment.id)} className="reply-form">
          <input type="text" placeholder={`${comment.user || 'Kullanıcı'} kullanıcısına yanıt yaz...`} value={replyInput} onChange={(e) => setReplyInput(e.target.value)} required autoFocus />
          <div className="reply-form-actions">
            <button type="submit" className="reply-submit-btn">Gönder</button>
            <button type="button" className="reply-cancel-btn" onClick={() => setReplyingToId(null)}>İptal</button>
          </div>
        </form>
      )}

      {childList.length > 0 && (
        <div className="replies-nested-container">
          {childList.map(reply => (
            <CommentNode 
              key={reply.id} 
              comment={reply} 
              replyingToId={replyingToId} 
              setReplyingToId={setReplyingToId} 
              replyInput={replyInput} 
              setReplyInput={setReplyInput} 
              handleCommentSubmit={handleCommentSubmit} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default AnketDetay;

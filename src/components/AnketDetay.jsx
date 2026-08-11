import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';

const API_BASE_URL = 'https://smarttools.kararsizkaldim.com/api';

function AnketDetay({ polls, onVote, onUpvote }) {
  const { id } = useParams();
  const [commentInput, setCommentInput] = useState('');
  
  // Sonsuz Kaydırma State'leri
  const [pollComments, setPollComments] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);

  const [replyingToId, setReplyingToId] = useState(null);
  const [replyInput, setReplyInput] = useState('');

  const poll = polls.find(p => p.id === parseInt(id));

  // 1. ADIM: Sayfa Sayfa Yorum Çekme Fonksiyonu
  const fetchComments = useCallback(async (pageNumber, isNewComment = false) => {
    if (loadingComments) return;
    setLoadingComments(true);

    try {
      const response = await fetch(`${API_BASE_URL}/polls/${id}/comments?page=${pageNumber}`);
      if (response.ok) {
        const result = await response.json();
        
        if (isNewComment || pageNumber === 1) {
          // Eğer yeni yorum yapıldıysa veya ilk sayfa isteniyorsa listeyi sıfırla/yenile
          setPollComments(result.data);
          setPage(1);
        } else {
          // Sonsuz kaydırmada eski yorumların ardına yenilerini ekle (Dizileri birleştir)
          setPollComments(prev => [...prev, ...result.data]);
        }
        
        setHasMore(result.has_more); // Backend'de daha fazla veri var mı?
      }
    } catch (error) {
      console.error("Yorumlar yüklenirken hata oluştu:", error);
    } finally {
      setLoadingComments(false);
    }
  }, [id]);

  // İlk açılışta 1. sayfayı yükle
  useEffect(() => {
    fetchComments(1);
  }, [id, fetchComments]);

  // 2. ADIM: Kaydırma (Scroll) Takip Mekanizması
  useEffect(() => {
    const handleScroll = () => {
      // Sayfa yükleniyorsa veya yüklenecek başka sayfa kalmadıysa işlemi durdur
      if (loadingComments || !hasMore) return;

      // Kullanıcı sayfanın en altından 100 piksel kalacak kadar aşağı kaydırdıysa tetikle
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100) {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchComments(nextPage);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll); // Hafıza sızıntısını önlemek için temizlik
  }, [page, hasMore, loadingComments, fetchComments]);

  // 3. ADIM: Yorum Gönderme Kontrolü
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
          parent_id: parentId
        })
      });

      if (response.ok) {
        setReplyInput('');
        setCommentInput('');
        setReplyingToId(null);
        
        // Yeni yorum yapıldığında listeyi en güncel haliyle baştan çeker
        await fetchComments(1, true);
      }
    } catch (error) {
      console.error("Yorum kaydedilemedi:", error);
    }
  };

  if (!poll) return <div className="error-container">Anket Bulunamadı.</div>;

  return (
    <div className="anket-detay-container">
      <Link to="/anketler" className="back-link">⬅ Anketlere Geri Dön</Link>

      {/* Anket Detay Kartı */}
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

      {/* Yorum Alanı */}
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
          {pollComments.map(comment => (
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
          
          {/* Kaydırma Esnasında Alt Kısımda Çıkan Yükleniyor Bildirimi */}
          {loadingComments && (
            <div className="loading-more-comments">Daha eski yorumlar yükleniyor... ⏳</div>
          )}
          
          {/* Başka yorum kalmadığında kullanıcıyı bilgilendir */}
          {!hasMore && pollComments.length > 0 && (
            <div className="no-more-comments">Tüm yorumlar yüklendi. ✔</div>
          )}
        </div>
      </div>
    </div>
  );
}

// Recursive Yorum Düğümü Bileşeni (Aynen Korunuyor)
function CommentNode({ comment, replyingToId, setReplyingToId, replyInput, setReplyInput, handleCommentSubmit }) {
  return (
    <div className="comment-node-branch" style={{ width: '100%' }}>
      <div className="comment-card">
        <div className="comment-header">
          <span className="comment-user">👤 {comment.user}</span>
          <span className="comment-date">
            {comment.created_at ? new Date(comment.created_at).toLocaleDateString('tr-TR') : 'Şimdi'}
          </span>
        </div>
        <p className="comment-text">{comment.text}</p>
        <button className="reply-trigger-btn" onClick={() => setReplyingToId(replyingToId === comment.id ? null : comment.id)}>💬 Cevapla</button>
      </div>

      {replyingToId === comment.id && (
        <form onSubmit={(e) => handleCommentSubmit(e, comment.id)} className="reply-form">
          <input type="text" placeholder={`${comment.user} kullanıcısına yanıt yaz...`} value={replyInput} onChange={(e) => setReplyInput(e.target.value)} required autoFocus />
          <div className="reply-form-actions">
            <button type="submit" className="reply-submit-btn">Gönder</button>
            <button type="button" className="reply-cancel-btn" onClick={() => setReplyingToId(null)}>İptal</button>
          </div>
        </form>
      )}

      {((comment.childReplies && comment.childReplies.length > 0) || (comment.child_replies && comment.child_replies.length > 0)) && (
        <div className="replies-nested-container">
          {(comment.childReplies || comment.child_replies).map(reply => (
            <CommentNode key={reply.id} comment={reply} replyingToId={replyingToId} setReplyingToId={setReplyingToId} replyInput={replyInput} setReplyInput={setReplyInput} handleCommentSubmit={handleCommentSubmit} />
          ))}
        </div>
      )}
    </div>
  );
}

export default AnketDetay;
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const API_BASE_URL = 'https://smarttools.kararsizkaldim.com/api';

function AnketDetay({ polls, onVote, onUpvote }) {
  const { id } = useParams();
  const [commentInput, setCommentInput] = useState('');
  const [pollComments, setPollComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);

  // Hangi yorum veya yanıta cevap yazıldığını takip eden merkezi state
  const [replyingToId, setReplyingToId] = useState(null);
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
          parent_id: parentId
        })
      });

      if (response.ok) {
        await fetchComments();
        if (parentId) {
          setReplyInput('');
          setReplyingToId(null);
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

      {/* Anket Kartı */}
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

      {/* Yorumlar Alanı */}
      <div className="comments-section">
        <h3>Topluluk Yorumları ({pollComments.length})</h3>

        {/* Ana Yorum Yapma Formu */}
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

        {/* Yorum Listesi */}
        <div className="comments-list">
  {loadingComments ? (
    <p>Yorumlar yükleniyor... ⏳</p>
  ) : pollComments.length === 0 ? (
    <p>Henüz yorum yapılmamış.</p>
  ) : (
    pollComments.map(comment => (
      <CommentNode 
        key={comment.id} 
        comment={comment}
        replyingToId={replyingToId}
        setReplyingToId={setReplyingToId}
        replyInput={replyInput}
        setReplyInput={setReplyInput}
        handleCommentSubmit={handleCommentSubmit}
      />
    ))
  )}
</div>
      </div>
    </div>
  );
}

// 🔄 SONSUZ DÖNGÜYÜ SAĞLAYAN RECURSIVE (KENDİ KENDİNİ ÇAĞIRAN) BİLEŞEN
// 🔄 DOSYANIN EN ALTINDAKİ BİLEŞENİ BU KODLA DEĞİŞTİRİN:

function CommentNode({ comment, replyingToId, setReplyingToId, replyInput, setReplyInput, handleCommentSubmit }) {
  return (
    <div className="comment-node-branch" style={{ width: '100%' }}>
      {/* Aktif Yorum Kutusu */}
      <div className="comment-card">
        <div className="comment-header">
          <span className="comment-user">👤 {comment.user}</span>
          <span className="comment-date">
            {comment.created_at ? new Date(comment.created_at).toLocaleDateString('tr-TR') : 'Şimdi'}
          </span>
        </div>
        <p className="comment-text">{comment.text}</p>
        
        <button 
          className="reply-trigger-btn"
          onClick={() => setReplyingToId(replyingToId === comment.id ? null : comment.id)}
        >
          💬 Cevapla
        </button>
      </div>

      {/* Cevaplama Formu */}
      {replyingToId === comment.id && (
        <form onSubmit={(e) => handleCommentSubmit(e, comment.id)} className="reply-form">
          <input 
            type="text"
            placeholder={`${comment.user} kullanıcısına yanıt yaz...`}
            value={replyInput}
            onChange={(e) => setReplyInput(e.target.value)}
            required
            autoFocus
          />
          <div className="reply-form-actions">
            <button type="submit" className="reply-submit-btn">Gönder</button>
            <button type="button" className="reply-cancel-btn" onClick={() => setReplyingToId(null)}>İptal</button>
          </div>
        </form>
      )}

      {/* ⚡ KESİN ÇÖZÜM NOKTASI: child_replies veya childReplies kontrolü */}
      {/* Laravel bazen snake_case (child_replies) bazen camelCase (childReplies) dönebilir. İkisini de kontrol ediyoruz. */}
      {((comment.childReplies && comment.childReplies.length > 0) || (comment.child_replies && comment.child_replies.length > 0)) && (
        <div className="replies-nested-container">
          {(comment.childReplies || comment.child_replies).map(reply => (
            <CommentNode 
              key={reply.id} 
              comment={reply} // Öz yineleme: Alt yorumu tekrar kendisiyle çizmesi için içeri aktarır
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

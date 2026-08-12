import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Anketler({ polls, onVote, onUpvote }) {
  const [selectedCategory, setSelectedCategory] = useState('Tümü');

  // 1. Adım: Mevcut anketlerden benzersiz kategorileri çıkaralım (Filtre butonları için)
  const categories = ['Tümü', ...new Set(polls.map(poll => poll.category).filter(Boolean))];

  // 2. Adım: Seçili kategoriye göre anketleri filtreleyelim
  const filteredPolls = selectedCategory === 'Tümü'
    ? polls
    : polls.filter(poll => poll.category === selectedCategory);

  // 3. Adım: Anketleri upvote (yukarı taşıma) sayısına göre büyükten küçüğe sıralayalım
  const sortedPolls = [...filteredPolls].sort((a, b) => b.upvotes - a.upvotes);

  return (
    <div className="anketler-container">
      {/* Kategori Filtreleme Menüsü */}
      <div className="category-filter-bar">
        {categories.map(category => (
          <button
            key={category}
            className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Anket Listesi */}
      <div className="polls-list">
        {sortedPolls.length === 0 ? (
          <p className="no-polls">Bu kategoride henüz anket açılmamış.</p>
        ) : (
          sortedPolls.map(poll => (
            <div key={poll.id} className="poll-card">
              
              {/* Sol Taraf: Oylama (Upvote) Alanı */}
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

              {/* Sağ Taraf: Anket İçeriği */}
              <div className="poll-content">
                <div className="poll-header-info">
                  <span className="poll-category-tag">{poll.category || 'Genel'}</span>
                </div>

                <h3 className="poll-question">
                  <Link to={`/anketler/${poll.id}`}>{poll.question}</Link>
                </h3>
                {poll.image_path && (
  <div className="poll-image-container">
    <img src={poll.image_path} alt={poll.question} className="poll-main-image" />
  </div>
)}


                {/* Seçenekler Listesi */}
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

                <div className="poll-footer">
                  <span className="total-votes-text">Toplam Oy: {poll.totalVotes}</span>
                  <Link to={`/anketler/${poll.id}`} className="details-link">
                    💬 Yorumları Gör
                  </Link>
                </div>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Anketler;

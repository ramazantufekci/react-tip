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
                <div className="poll-options">
                  {poll.options.map((option, index) => {
                    // Yüzde hesaplama mantığı
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
                        {/* Arka plandaki doluluk oranı çizgisi */}
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

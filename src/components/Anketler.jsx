// src/components/Anketler.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// 🌟 DÜZELTME 1: fetchPolls fonksiyonu props olarak içeriye eklendi
function Anketler({ polls, onVote, onUpvote, sortBy, setSortBy, fetchPolls }) {
  const [selectedCategory, setSelectedCategory] = useState('Tümü');

  // Mevcut anketlerden dinamik olarak benzersiz kategorileri çıkarma
  const categories = ['Tümü', ...new Set(polls.map(poll => poll.category).filter(Boolean))];

  // Seçili kategoriye göre anketleri filtreleme
  const filteredPolls = selectedCategory === 'Tümü'
    ? polls
    : polls.filter(poll => poll.category === selectedCategory);

  // 🌟 DÜZELTME 2: Sıralama mantığı Laravel'den (sortBy) geldiği için 
  // burada listeyi tekrar upvote'a göre kilitleyen .sort() fonksiyonunu kaldırdık.
  const displayPolls = [...filteredPolls];

  return (
    <div className="anketler-container">
      
      {/* 📊 POPÜLERLİK VE ZAMAN FİLTRELERİ */}
      {/* DÜZELTME 3: Hatalı, iç içe geçen ve kırık div/yorum satırı yapısı tamamen temizlendi */}
      <div className="category-filter-bar" style={{ marginBottom: '10px' }}>
        <button 
          className={`category-btn ${sortBy === 'latest' ? 'active' : ''}`}
          onClick={() => {
            setSortBy('latest');
            if (sortBy === 'latest' && typeof fetchPolls === 'function') {
              fetchPolls('latest'); 
            }
          }}
        >
          ✨ En Yeni
        </button>
        <button 
          className={`category-btn ${sortBy === 'upvotes' ? 'active' : ''}`}
          onClick={() => setSortBy('upvotes')}
        >
          🔥 En Beğenilenler
        </button>
        <button 
          className={`category-btn ${sortBy === 'votes' ? 'active' : ''}`}
          onClick={() => setSortBy('votes')}
        >
          📊 En Çok Oy Alanlar
        </button>
      </div>

      {/* 🏷️ KONU / KATEGORİ FİLTRELEME ŞERİDİ */}
      <div className="category-filter-bar" style={{ paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
        {categories.map((category, idx) => (
          <button
            key={idx}
            className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Anket Listesi */}
      <div className="polls-list" style={{ marginTop: '20px' }}>
        {displayPolls.length === 0 ? (
          <p className="no-polls">Bu kategoride henüz anket açılmamış.</p>
        ) : (
          displayPolls.map(poll => {
            // Güvenli oy toplama hesabı
            const totalVotes = poll.options ? poll.options.reduce((sum, opt) => sum + (opt.votes || 0), 0) : 0;

            return (
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
                  <span className="upvote-count">{poll.upvotes || 0}</span>
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
                    <div className="poll-image-container" style={{ marginBottom: '15px' }}>
                      <img src={poll.image_path} alt={poll.question} className="poll-main-image" style={{ maxWidth: '100%', borderRadius: '8px' }} />
                    </div>
                  )}

                  {/* Seçenekler Listesi (Dinamik Grid) */}
                  <div className="poll-options resimli-comparison-grid">
                    {(poll.options || []).map((option, index) => {
                      const percent = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
                      const hasImage = !!option.image_path;

                      return (
                        <div key={index} className="comparison-card">
                          {hasImage ? (
                            /* 📸 RESİMLİ TASARIM */
                            <div 
                              className={`clickable-image-container ${poll.voted ? 'voted' : ''}`}
                              onClick={() => !poll.voted && onVote(poll.id, index)}
                              style={{
                                position: 'relative', width: '100%', height: '260px',
                                borderRadius: '12px', overflow: 'hidden',
                                cursor: poll.voted ? 'default' : 'pointer', border: '2px solid #eee',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                              }}
                            >
                              <img src={option.image_path} alt={option.text} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              
                              {option.text && (
                                <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                                  {option.text}
                                </div>
                              )}

                              {poll.voted && (
                                <div className="image-voted-overlay" style={{
                                  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                  background: 'rgba(0, 123, 255, 0.65)', color: 'white',
                                  display: 'flex', flexDirection: 'column', justifyContent: 'center',
                                  alignItems: 'center', fontSize: '28px', fontWeight: 'bold'
                                }}>
                                  <span>%{percent}</span>
                                  <span style={{ fontSize: '14px', fontWeight: 'normal', marginTop: '4px' }}>{option.votes} Oy</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            /* 📝 RESİMSİZ TASARIM */
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
                    <span className="total-votes-text">Toplam Oy: {totalVotes}</span>
                    <Link to={`/anketler/${poll.id}`} className="details-link">
                      💬 Yorumları Gör
                    </Link>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Anketler;

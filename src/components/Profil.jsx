// src/components/Profil.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import Swal from 'sweetalert2';

function Profil({ onDeletePoll }) {
  const { user, token } = useAuth();
  const [myCreatedPolls, setMyCreatedPolls] = useState([]);
  const [myVotedPolls, setMyVotedPolls] = useState([]);
  const [activeTab, setActiveTab] = useState('created'); // 'created' veya 'voted'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // 1. Kullanıcının kendi açtığı anketleri backend'den çekiyoruz
        const response = await fetch(`${API_BASE_URL}/user/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // 2. Kullanıcının oy verdiği anket id'lerini localStorage'dan alıyoruz
        const savedVotes = localStorage.getItem('my_votes');
        const votedIds = savedVotes ? JSON.parse(savedVotes) : [];

        // 3. Genel anket listesinden oy verilenleri süzmek için tüm anketleri çekiyoruz
        const allPollsResponse = await fetch(`${API_BASE_URL}/polls`);

        if (response.ok && allPollsResponse.ok) {
          const profileData = await response.json();
          const allPollsData = await allPollsResponse.json();

          // Kendi açtığı anketlerin şıklarını JSON parse yapıyoruz
          const formattedMyPolls = profileData.my_polls.map(poll => ({
            ...poll,
            options: typeof poll.options === 'string' ? JSON.parse(poll.options) : poll.options
          }));

          // Oy verdiği anketleri süzüp hazırlıyoruz
          const formattedVotedPolls = allPollsData
            .filter(poll => votedIds.includes(poll.id))
            .map(poll => ({
              ...poll,
              options: typeof poll.options === 'string' ? JSON.parse(poll.options) : poll.options,
              voted: true
            }));

          setMyCreatedPolls(formattedMyPolls);
          setMyVotedPolls(formattedVotedPolls);
        }
      } catch (error) {
        console.error("Profil verileri yüklenemedi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [token]);

  // Profil sayfasından anket silindiğinde arayüzü anlık güncelleme yardımı
  const handleDeleteClick = async (pollId) => {
    if (typeof onDeletePoll === 'function') {
      await onDeletePoll(pollId);
      setMyCreatedPolls(prev => prev.filter(p => p.id !== pollId));
    }
  };

  if (loading) return <div className="loading-screen">Profil verileri yükleniyor... ⏳</div>;

  return (
    <div className="profil-container" style={{ padding: '10px 0' }}>
      {/* Üst Kullanıcı Kartı Açılışı */}
      <div className="user-profile-header" style={{ background: '#ffffff', border: '1px solid #e0e0e0', padding: '24px', borderRadius: '12px', textAlign: 'center', marginBottom: '20px' }}>
        <Link to="/ayarlar" style={{ position: 'absolute', top: '16px', right: '16px', textDecoration: 'none', fontSize: '13px', color: '#007bff', fontWeight: '600' }}>
    ⚙️ Hesap Ayarları
  </Link>
        <div style={{ width: '70px', height: '70px', background: '#e7f1ff', color: '#007bff', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '28px', fontWeight: 'bold', margin: '0 auto 12px auto' }}>
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <h2 style={{ fontSize: '20px', color: '#1a1a1a', marginBottom: '4px' }}>{user?.name}</h2>
        <p style={{ fontSize: '13px', color: '#6c757d' }}>{user?.email} • Kararsızlar Topluluğu Üyesi</p>
      </div>

      {/* Sekme Butonları Barı */}
      <div className="category-filter-bar" style={{ marginBottom: '20px', borderBottom: '1px solid #e0e0e0', paddingBottom: '10px' }}>
        <button className={`category-btn ${activeTab === 'created' ? 'active' : ''}`} onClick={() => setActiveTab('created')}>
          📂 Açtığım Anketler ({myCreatedPolls.length})
        </button>
        <button className={`category-btn ${activeTab === 'voted' ? 'active' : ''}`} onClick={() => setActiveTab('voted')}>
          🗳️ Oy Verdiğim Anketler ({myVotedPolls.length})
        </button>
      </div>

      {/* İçerik Listeleme Alanı */}
      <div className="polls-list">
        {activeTab === 'created' ? (
          myCreatedPolls.length === 0 ? (
            <p className="no-polls">Henüz hiç anket açmamışsınız. <Link to="/sor-sor" style={{ color: '#007bff', fontWeight: 'bold' }}>Hemen ilk sorunu sor! 🚀</Link></p>
          ) : (
            myCreatedPolls.map(poll => (
              <div key={poll.id} className="poll-card" style={{ position: 'relative' }}>
                <button 
                  onClick={() => handleDeleteClick(poll.id)}
                  style={{ position: 'absolute', top: '12px', right: '12px', background: '#fff5f5', color: '#dc3545', border: '1px solid #ffc9c9', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', zIndex: 10 }}
                >
                  🗑️ Sil
                </button>
                <div className="poll-content" style={{ paddingRight: '60px' }}>
                  <span className="poll-category-tag">{poll.category}</span>
                  <h3 className="poll-question"><Link to={`/anketler/${poll.id}`}>{poll.question}</Link></h3>
                  <div style={{ marginTop: '10px', fontSize: '12px', color: '#6c757d' }}>🔼 Toplam Beğeni: {poll.upvotes || 0}</div>
                </div>
              </div>
            ))
          )
        ) : (
          myVotedPolls.length === 0 ? (
            <p className="no-polls">Henüz hiçbir ankette oy kullanmamışsınız. <Link to="/anketler" style={{ color: '#007bff', fontWeight: 'bold' }}>Anketleri incelemeye başla! ➜</Link></p>
          ) : (
            myVotedPolls.map(poll => (
              <div key={poll.id} className="poll-card">
                <div className="poll-content">
                  <span className="poll-category-tag">{poll.category}</span>
                  <h3 className="poll-question"><Link to={`/anketler/${poll.id}`}>{poll.question}</Link></h3>
                  <div style={{ marginTop: '10px', fontSize: '12px', color: '#28a745', fontWeight: '600' }}>✓ Bu ankette oyunuzu kullandınız</div>
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
}

export default Profil;

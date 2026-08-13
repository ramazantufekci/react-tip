// src/components/SorSor.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config'; // Merkezi URL dosyasından çektik

// 🌟 1. DEĞİŞİKLİK:onPollCreated prop'unu içeri alıyoruz
function SorSor({ onPollCreated }) {
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState('');
  const [options, setOptions] = useState([
    { text: '', image: null },
    { text: '', image: null }
  ]);
  const [loading, setLoading] = useState(false);

  // handleAddOptionSlot, handleRemoveOptionSlot, handleTextChange, handleFileChange kodları aynen kalıyor...

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!question.trim() || !category.trim()) {
      alert("Lütfen soru ve kategori alanlarını doldurun!");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('question', question);
    formData.append('category', category);

    options.forEach((option, index) => {
      formData.append(`options_text[${index}]`, option.text);
      if (option.image) {
        formData.append(`options_images[${index}]`, option.image);
      }
    });

    try {
      const response = await fetch(`${API_BASE_URL}/polls`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        // 🌟 2. DEĞİŞİKLİK: Yönlendirme yapmadan HEMEN ÖNCE listeyi tazelemek için fonksiyonu tetikliyoruz
        if (typeof onPollCreated === 'function') {
          await onPollCreated();
        }
        
        // Liste başarıyla güncellendikten sonra kullanıcıyı yönlendiriyoruz
        navigate('/anketler');
      } else {
        alert("Anket oluşturulurken bir hata meydana geldi.");
      }
    } catch (error) {
      console.error("Bağlantı hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sor-sor-container">
      <h2>Dinamik Anket / Kıyaslama Oluştur 📊</h2>
      <p className="subtitle">Dilediğiniz kadar seçenek ekleyin, resimli şıklarda yazıyı boş bırakabilirsiniz.</p>

      <form onSubmit={handleSubmit} className="poll-create-form">
        
        <div className="form-group">
          <label>Sorunuz / İkileminiz Nedir?</label>
          <input type="text" placeholder="Örn: Sizce en iyi online dizi platformu hangisi?" value={question} onChange={e => setQuestion(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Konu / Kategori Başlığı</label>
          <input type="text" placeholder="Örn: Eğlence, Dizi, Teknoloji" value={category} onChange={e => setCategory(e.target.value)} required />
        </div>

        <h3 style={{ fontSize: '14px', marginBottom: '10px', color: '#495057' }}>Seçenekler / Şıklar</h3>

        {/* Dinamik Şık Listesi Render Alanı */}
        {options.map((option, index) => (
          <div key={index} className="option-upload-block" style={{ border: '1px solid #e0e0e0', padding: '12px', borderRadius: '8px', marginBottom: '12px', background: '#fdfdfd', position: 'relative' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#007bff', display: 'block', marginBottom: '6px' }}>Şık {String.fromCharCode(65 + index)}</span>
            
            <div className="form-group" style={{ marginBottom: '8px' }}>
              <input type="text" placeholder="Seçenek metni (Resim varsa boş kalabilir)" value={option.text} onChange={e => handleTextChange(index, e.target.value)} />
            </div>
            
            <div className="form-group" style={{ marginBottom: '4px' }}>
              <input type="file" accept="image/*" onChange={e => handleFileChange(index, e.target.files[0])} />
            </div>

            {/* İlk 2 şıktan sonrakilere silme butonu koyuyoruz */}
            {options.length > 2 && (
              <button type="button" onClick={() => handleRemoveOptionSlot(index)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                ❌ Şıkkı Kaldır
              </button>
            )}
          </div>
        ))}

        {/* Yeni Şık Ekleme Tetikleyicisi */}
        {options.length < 6 && (
          <button type="button" onClick={handleAddOptionSlot} style={{ width: '100%', backgroundColor: '#007bff', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '16px' }}>
            ➕ Yeni Seçenek/Şık Ekle
          </button>
        )}

        <button type="submit" className="submit-poll-btn" disabled={loading}>
          {loading ? "Anket Hazırlanıyor..." : "Anketi Topluluğa Sun 🚀"}
        </button>

      </form>
    </div>
  );
}

export default SorSor;

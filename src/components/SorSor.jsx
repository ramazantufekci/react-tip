import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
function SorSor() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState(''); // Her konuda olması için özgür metin alanı
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [imageA, setImageA] = useState(null);
  const [imageB, setImageB] = useState(null);
  const [loading, setLoading] = useState(false);
  const {token} = useAuth();
  /*const handleFileChange = (e) => {
    setImage(e.target.files[0]); // Seçilen ilk dosyayı kaydet
  };
*/
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim() || !category.trim() || !optionA.trim() || !optionB.trim()) {
      alert("Lütfen gerekli alanları doldurun!");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('question', question);
    formData.append('category', category);
    formData.append('option_a', optionA);
    formData.append('option_b', optionB);

    if (imageA) formData.append('image_a', imageA);
    if (imageB) formData.append('image_b', imageB);

    try {
      const response = await fetch('https://smarttools.kararsizkaldim.com/api/polls', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        navigate('/anketler');
      } else {
        alert("Anket oluşturulurken hata meydana geldi.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sor-sor-container">
      <h2>İki Seçeneği Resimlerle Kıyaslayın 📸</h2>
      <form onSubmit={handleSubmit} className="poll-create-form">
        
        <div className="form-group">
          <label>Sorunuz Nedir?</label>
          <input type="text" placeholder="Örn: Hangi ayakkabı kombinime daha çok uyar?" value={question} onChange={e => setQuestion(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Kategori</label>
          <input type="text" placeholder="Örn: Moda, Alışveriş" value={category} onChange={e => setCategory(e.target.value)} required />
        </div>

        {{/* SEÇENEK A BLOK */}
<div className="option-upload-block" style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
  <div className="form-group">
    <label>1. Seçenek Metni (Resim varsa boş kalabilir)</label>
    <input type="text" placeholder="Örn: Beyaz Sneaker" value={optionA} onChange={e => setOptionA(e.target.value)} />
  </div>
  <div className="form-group">
    <label>A Şıkkı İçin Resim</label>
    <input type="file" accept="image/*" onChange={e => setImageA(e.target.files[0])} />
  </div>
</div>

{/* SEÇENEK B BLOK */}
<div className="option-upload-block" style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
  <div className="form-group">
    <label>2. Seçenek Metni (Resim varsa boş kalabilir)</label>
    <input type="text" placeholder="Örn: Siyah Bot" value={optionB} onChange={e => setOptionB(e.target.value)} />
  </div>
  <div className="form-group">
    <label>B Şıkkı İçin Resim</label>
    <input type="file" accept="image/*" onChange={e => setImageB(e.target.files[0])} />
  </div>
</div>

        <button type="submit" className="submit-poll-btn" disabled={loading}>
          {loading ? "Yükleniyor..." : "Kıyaslama Anketini Başlat 🚀"}
        </button>
      </form>
    </div>
  );
}

export default SorSor;

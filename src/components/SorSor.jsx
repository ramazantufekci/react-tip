import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SorSor() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState(''); // Her konuda olması için özgür metin alanı
  const [option1, setOption1] = useState('');
  const [option2, setOption2] = useState('');
  const [image, setImage] = useState(null); // Resim state'i
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setImage(e.target.files[0]); // Seçilen ilk dosyayı kaydet
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!question.trim() || !category.trim() || !option1.trim() || !option2.trim()) {
      alert("Lütfen tüm alanları doldurun!");
      return;
    }

    setLoading(true);

    // Resim yüklemelerinde API'ye veri göndermek için FormData kullanılır
    const formData = new FormData();
    formData.append('question', question);
    formData.append('category', category);
    
    // Şıkları Laravel'in çözebilmesi için JSON string'e çeviriyoruz
    const optionsArray = [
      { text: option1, votes: 0 },
      { text: option2, votes: 0 }
    ];
    formData.append('options', JSON.stringify(optionsArray));

    // Eğer resim seçildiyse form verisine ekle
    if (image) {
      formData.append('image', image);
    }

    try {
      // Laravel backend URL'nizi buraya yazın
      const response = await fetch('https://smarttools.kararsizkaldim.com/api/polls', {
        method: 'POST',
        body: formData, // JSON.stringify YOK, direkt formData nesnesi gidiyor
        // Header'da Content-Type belirtmiyoruz, tarayıcı otomatik multipart/form-data yapar
      });

      if (response.ok) {
        navigate('/anketler');
      } else {
        alert("Anket oluşturulurken bir hata oluştu.");
      }
    } catch (error) {
      console.error("Bağlantı hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sor-sor-container">
      <h2>Aklınıza Takılan Her Konuda Soru Sorun 🌐</h2>
      <p className="subtitle">Gündem, teknoloji, oyun, spor veya alışveriş... İkileminizi resim ekleyerek topluluğa sunun.</p>

      <form onSubmit={handleSubmit} className="poll-create-form">
        
        <div className="form-group">
          <label>Sorunuz / İkileminiz Nedir?</label>
          <input
            type="text"
            placeholder="Örn: Sizce hangi oyun konsolunu almalıyım?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Konu / Kategori Başlığı</label>
          <input
            type="text"
            placeholder="Örn: Oyun, Teknoloji, Dizi, Spor"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
        </div>

        {/* Resim Yükleme Alanı */}
        <div className="form-group">
          <label>Görsel Ekle (Opsiyonel)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="file-input"
          />
        </div>

        <div className="form-group">
          <label>1. Seçenek</label>
          <input
            type="text"
            placeholder="Örn: PlayStation 5 Pro"
            value={option1}
            onChange={(e) => setOption1(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>2. Seçenek</label>
          <input
            type="text"
            placeholder="Örn: Xbox Series X"
            value={option2}
            onChange={(e) => setOption2(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="submit-poll-btn" disabled={loading}>
          {loading ? "Paylaşılıyor..." : "İkilemi Herkesle Paylaş 🚀"}
        </button>

      </form>
    </div>
  );
}

export default SorSor;

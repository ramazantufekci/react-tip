import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SorSor({ onAddPoll, nextId }) {
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState('Cilt Bakımı'); // Varsayılan kategori
  const [option1, setOption1] = useState('');
  const [option2, setOption2] = useState('');

  // Sağlık ve kozmetik konseptine uygun hazır kategorilerimiz
  const categoriesList = [
    "Cilt Bakımı",
    "Takviye Edici Gıda",
    "Saç Bakımı",
    "Makyaj & Kozmetik",
    "Vücut Bakımı",
    "Genel Sağlık"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basit bir boşluk kontrolü
    if (!question.trim() || !option1.trim() || !option2.trim()) {
      alert("Lütfen tüm alanları doldurun!");
      return;
    }

    // App.jsx'teki handleAddPoll fonksiyonuna göndereceğimiz yeni anket objesi
    const newPoll = {
      id: nextId,
      question: question,
      category: category, // Seçilen kategoriyi ekliyoruz
      options: [
        { text: option1, votes: 0 },
        { text: option2, votes: 0 }
      ],
      totalVotes: 0,
      voted: false
    };

    onAddPoll(newPoll);
    
    // Anket başarıyla eklendikten sonra ana sayfaya yönlendiriyoruz
    navigate('/anketler');
  };

  return (
    <div className="sor-sor-container">
      <h2>Kararsız Kaldığınız İkilemi Topluluğa Sorun 🤔</h2>
      <p className="subtitle">Sağlık, kozmetik veya bakım ürünleri arasında mı kaldınız? Sorunuzu yazın, oylasınlar.</p>

      <form onSubmit={handleSubmit} className="poll-create-form">
        
        {/* Soru Alanı */}
        <div className="form-group">
          <label htmlFor="question">İkileminiz / Sorunuz Nedir?</label>
          <input
            type="text"
            id="question"
            placeholder="Örn: Akne eğilimli ciltler için hangi güneş kremi?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength="150"
            required
          />
        </div>

        {/* Kategori Seçim Alanı */}
        <div className="form-group">
          <label htmlFor="category">Hangi Kategoriye Ait?</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="category-select"
          >
            {categoriesList.map((cat, idx) => (
              <option key={idx} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Seçenek 1 */}
        <div className="form-group">
          <label htmlFor="option1">1. Seçenek (A Şıkkı)</label>
          <input
            type="text"
            id="option1"
            placeholder="Örn: La Roche Posay Anthelios Oil Correct"
            value={option1}
            onChange={(e) => setOption1(e.target.value)}
            required
          />
        </div>

        {/* Seçenek 2 */}
        <div className="form-group">
          <label htmlFor="option2">2. Seçenek (B Şıkkı)</label>
          <input
            type="text"
            id="option2"
            placeholder="Örn: Solante Acnestint"
            value={option2}
            onChange={(e) => setOption2(e.target.value)}
            required
          />
        </div>

        {/* Gönder Butonu */}
        <button type="submit" className="submit-poll-btn">
          Kararsızlığımı Paylaş 🚀
        </button>

      </form>
    </div>
  );
}

export default SorSor;

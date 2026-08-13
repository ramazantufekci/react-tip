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
    // Form HTML render kodları aynen kalıyor...
  );
}

export default SorSor;

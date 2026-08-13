// src/components/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config'; 

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = isRegister ? 'register' : 'login';

    try {
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();

      if (response.ok) {
        login(data.user, data.access_token);
        navigate('/anketler');
      } else {
        setError(data.message || 'Bir hata oluştu.');
      }
    } catch {
      setError('Sunucu bağlantı hatası.');
    }
  };

  return (
    <div className="login-container" style={{ maxWidth: '400px', margin: '40px auto', padding: '20px', background: '#fff', borderRadius: '8px', border: '1px solid #ddd' }}>
      <h2>{isRegister ? 'Kayıt Ol' : 'Giriş Yap'}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        {isRegister && (
          <div style={{ marginBottom: '12px' }}>
            <label>İsim:</label>
            <input type="text" style={{ width: '100%', padding: '8px' }} required onChange={e => setFormData({ ...formData, name: e.target.value })} />
          </div>
        )}
        <div style={{ marginBottom: '12px' }}>
          <label>E-posta:</label>
          <input type="email" style={{ width: '100%', padding: '8px' }} required onChange={e => setFormData({ ...formData, email: e.target.value })} />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label>Şifre:</label>
          <input type="password" style={{ width: '100%', padding: '8px' }} required onChange={e => setFormData({ ...formData, password: e.target.value })} />
        </div>
        <button type="submit" className="submit-comment-btn" style={{ width: '100%' }}>{isRegister ? 'Üye Ol' : 'Giriş Yap'}</button>
      </form>
      <button onClick={() => setIsRegister(!isRegister)} style={{ background: 'none', border: 'none', color: '#007bff', marginTop: '15px', cursor: 'pointer' }}>
        {isRegister ? 'Zaten hesabınız var mı? Giriş yapın' : 'Hesabınız yok mu? Yeni hesap açın'}
      </button>
    </div>
  );
}

export default Login;

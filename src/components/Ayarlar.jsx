// src/components/Ayarlar.jsx

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import Swal from 'sweetalert2';

function Ayarlar() {
  const { user, token, checkAuth } = useAuth(); // checkAuth yardımıyla güncel kullanıcıyı state'e geri yükleyeceğiz

  // Profil Form State'leri
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileLoading, setProfileLoading] = useState(false);

  // Şifre Form State'leri
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // 1. Profil Bilgilerini Güncelleme Tetikleyicisi
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/user/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, email })
      });

      const data = await response.json();

      if (response.ok) {
        // Context içindeki kullanıcı verisini tazelemek için oturumu yeniden doğrula
        if (typeof checkAuth === 'function') await checkAuth();

        Swal.fire({
          icon: 'success',
          title: 'Başarılı!',
          text: 'Profil bilgileriniz güncellendi.',
          confirmButtonColor: '#28a745'
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Hata',
          text: data.message || 'Güncelleme sırasında bir sorun oluştu.',
          confirmButtonColor: '#007bff'
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setProfileLoading(false);
    }
  };

  // 2. Şifre Değiştirme Tetikleyicisi
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== newPasswordConfirmation) {
      Swal.fire({
        icon: 'warning',
        title: 'Şifreler Eşleşmiyor',
        text: 'Yeni şifre ve yeni şifre tekrarı birbiriyle aynı olmalıdır.',
        confirmButtonColor: '#007bff'
      });
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/user/update-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          new_password_confirmation: newPasswordConfirmation
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Form alanlarını temizle
        setCurrentPassword('');
        setNewPassword('');
        setNewPasswordConfirmation('');

        Swal.fire({
          icon: 'success',
          title: 'Şifre Değiştirildi',
          text: 'Şifreniz başarıyla güncellendi.',
          confirmButtonColor: '#28a745'
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Başarısız',
          text: data.message || 'Şifre değiştirilemedi.',
          confirmButtonColor: '#dc3545'
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="ayarlar-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* BLOK 1: PROFİL GÜNCELLEME */}
      <div className="sor-sor-container" style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e0e0e0' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '14px', color: '#1a1a1a' }}>👤 Profil Bilgileri</h2>
        <form onSubmit={handleProfileSubmit} className="poll-create-form">
          <div className="form-group">
            <label>Görünen Adınız</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>E-posta Adresiniz</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <button type="submit" className="submit-poll-btn" style={{ background: '#007bff' }} disabled={profileLoading}>
            {profileLoading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
          </button>
        </form>
      </div>

      {/* BLOK 2: ŞİFRE DEĞİŞTİRME */}
      <div className="sor-sor-container" style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e0e0e0' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '14px', color: '#1a1a1a' }}>🔒 Şifre Değiştir</h2>
        <form onSubmit={handlePasswordSubmit} className="poll-create-form">
          <div className="form-group">
            <label>Mevcut Şifre</label>
            <input type="password" placeholder="••••••••" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Yeni Şifre (En az 6 karakter)</label>
            <input type="password" placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Yeni Şifre Tekrar</label>
            <input type="password" placeholder="••••••••" value={newPasswordConfirmation} onChange={e => setNewPasswordConfirmation(e.target.value)} required />
          </div>
          <button type="submit" className="submit-poll-btn" style={{ background: '#28a745' }} disabled={passwordLoading}>
            {passwordLoading ? 'Şifre Güncelleniyor...' : 'Şifreyi Güncelle'}
          </button>
        </form>
      </div>

    </div>
  );
}

export default Ayarlar;

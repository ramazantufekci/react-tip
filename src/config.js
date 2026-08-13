// src/config.js

// Eğer .env dosyası bir şekilde okunamazsa projenin çökmemesi için fallback (localhost) koyuyoruz
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

import React, { useState } from 'react';
import { ImagePlus, Plus, Send, Trash2, Type, X } from 'lucide-react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

function SorSor({ onPollCreated }) {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState('');
  const [options, setOptions] = useState([{ text: '', image: null }, { text: '', image: null }]);
  const [loading, setLoading] = useState(false);

  const updateOption = (index, patch) => setOptions(prev => prev.map((item, i) => i === index ? { ...item, ...patch } : item));
  const addOption = () => options.length < 6 && setOptions([...options, { text: '', image: null }]);
  const removeOption = index => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!question.trim() || !category.trim()) {
      Swal.fire({ icon: 'warning', title: 'Eksik bilgi', text: 'Soru ve kategori alanlarını doldurun.', confirmButtonColor: '#0f172a' });
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('question', question);
    formData.append('category', category);
    options.forEach((option, index) => {
      formData.append(`options_text[${index}]`, option.text);
      if (option.image) formData.append(`options_images[${index}]`, option.image);
    });

    try {
      const response = await fetch(`${API_BASE_URL}/polls`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
      if (!response.ok) throw new Error('Anket oluşturulamadı.');
      console.log(response,"throw dan sonra");
      if (typeof onPollCreated === 'function') await onPollCreated();
      await Swal.fire({ icon: 'success', title: 'Anket yayında!', text: 'Topluluk artık senin için karar verebilir.', confirmButtonColor: '#0f172a', timer: 1800 });
      console.log(response,"birşey daha yaz");
      //navigate(`/anketler/${data.slug}`);
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Bir sorun oluştu', text: error.message, confirmButtonColor: '#0f172a' });
    } finally {
      setLoading(false);
    }
  };

  const input = 'h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10';

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-5">
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Yeni anket</p>
        <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Kararsız kaldın mı? Sor.</h1>
        <p className="mt-1 text-sm text-slate-500">Metin, görsel veya ikisini birlikte kullan. En fazla 6 seçenek ekleyebilirsin.</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xl shadow-slate-200/50 sm:p-7">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="sm:col-span-2"><span className="mb-1.5 block text-xs font-black text-slate-600">Sorun / ikilemin</span><input className={input} value={question} onChange={e => setQuestion(e.target.value)} required placeholder="Örn. Bu iki ayakkabıdan hangisi daha iyi?" /></label>
          <label className="sm:col-span-2"><span className="mb-1.5 block text-xs font-black text-slate-600">Kategori</span><input className={input} value={category} onChange={e => setCategory(e.target.value)} required placeholder="Moda, Teknoloji, Yemek..." /></label>
        </div>

        <div className="my-7 flex items-center gap-3"><div className="h-px flex-1 bg-slate-200" /><span className="text-xs font-black uppercase tracking-wider text-slate-400">Seçenekler</span><div className="h-px flex-1 bg-slate-200" /></div>

        <div className="space-y-3">
          {options.map((option, index) => (
            <div key={index} className="relative rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition hover:border-slate-300">
              <div className="mb-3 flex items-center justify-between"><span className="inline-flex items-center gap-2 text-xs font-black text-slate-500"><span className="grid h-7 w-7 place-items-center rounded-lg bg-slate-950 text-white">{String.fromCharCode(65 + index)}</span> Seçenek {index + 1}</span>{options.length > 2 && <button type="button" onClick={() => removeOption(index)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-rose-500 hover:bg-rose-50"><Trash2 size={13} /> Kaldır</button>}</div>
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <label className="relative block"><Type className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><input className={`${input} pl-10`} value={option.text} onChange={e => updateOption(index, { text: e.target.value })} placeholder="Seçenek metni (görsel varsa boş olabilir)" /></label>
                <label className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-4 text-xs font-black text-slate-600 transition hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600"><ImagePlus size={17} /> Görsel seç<input type="file" accept="image/*" className="hidden" onChange={e => updateOption(index, { image: e.target.files?.[0] || null })} /></label>
              </div>
              {option.image && <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">✓ {option.image.name}</p>}
            </div>
          ))}
        </div>

        {options.length < 6 && <button type="button" onClick={addOption} className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-indigo-300 bg-indigo-50 text-sm font-black text-indigo-600 hover:bg-indigo-100"><Plus size={17} /> Yeni seçenek ekle</button>}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={() => navigate('/anketler')} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold text-slate-500 hover:bg-slate-100"><X size={17} /> Vazgeç</button>
          <button disabled={loading} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 text-sm font-black text-white shadow-xl shadow-slate-950/10 hover:bg-indigo-700 disabled:opacity-60"><Send size={17} /> {loading ? 'Yayınlanıyor...' : 'Anketi yayınla'}</button>
        </div>
      </form>
    </div>
  );
}

export default SorSor;

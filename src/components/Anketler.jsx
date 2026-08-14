// src/components/Anketler.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Anketler({ polls, onVote, onUpvote, sortBy, setSortBy, fetchPolls, onDeletePoll }) {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('Tümü');

  const categories = ['Tümü', ...new Set(polls.map(poll => poll.category).filter(Boolean))];

  const filteredPolls = selectedCategory === 'Tümü'
    ? polls
    : polls.filter(poll => poll.category === selectedCategory);

  const displayPolls = [...filteredPolls];

  return (
    /* 🌟 MASAÜSTÜNDE YAN YANA İKİ SÜTUN YAPAN ANA GRID */
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* SOL TARAF (9 Sütun Kaplar - Anketler Akışı) */}
      <div className="lg:col-span-8 space-y-5">
        
        {/* POPÜLERLİK VE ZAMAN FİLTRELERİ */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none whitespace-nowrap">
          <button 
            className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-all ${sortBy === 'latest' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
            onClick={() => {
              setSortBy('latest');
              if (sortBy === 'latest' && typeof fetchPolls === 'function') fetchPolls('latest');
            }}
          >
            ✨ En Yeni
          </button>
          <button 
            className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-all ${sortBy === 'upvotes' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
            onClick={() => setSortBy('upvotes')}
          >
            🔥 En Beğenilenler
          </button>
          <button 
            className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-all ${sortBy === 'votes' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
            onClick={() => setSortBy('votes')}
          >
            📊 En Çok Oy Alanlar
          </button>
        </div>

        {/* Mobilde kaydırılabilir şerit, bilgisayarda satır içi görünen kategoriler */}
        <div className="flex lg:hidden gap-1.5 overflow-x-auto pb-2 scrollbar-none whitespace-nowrap">
          {categories.map((category, idx) => (
            <button
              key={idx}
              className={`px-3 py-1 rounded-lg text-xs font-medium border ${selectedCategory === category ? 'bg-gray-800 text-white' : 'bg-white text-gray-600'}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Anket Kartları */}
        <div className="space-y-4">
          {displayPolls.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-12 bg-white rounded-2xl border border-dashed border-gray-200">Bu kategoride henüz anket açılmamış.</p>
          ) : (
            displayPolls.map(poll => {
              const totalVotes = poll.options ? poll.options.reduce((sum, opt) => sum + (opt.votes || 0), 0) : 0;

              return (
                <div key={poll.id} className="relative flex items-start bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm transition hover:shadow-md hover:border-gray-300">
                  
                  {user && poll.user_id === user.id && (
                    <button 
                      onClick={() => onDeletePoll(poll.id)}
                      className="absolute top-4 right-4 bg-red-50 text-red-500 hover:bg-red-100 px-2.5 py-1 rounded-lg text-xs font-bold transition"
                    >
                      🗑️ Sil
                    </button>
                  )}

                  {/* VOTE BUTONU */}
                  <div className="flex flex-col items-center mr-4 pt-0.5 min-w-[36px]">
                    <button 
                      className={`text-xl p-1 rounded-lg transition active:scale-125 ${poll.upvotedByMe ? 'filter drop-shadow-[0_0_6px_#ff4500]' : 'hover:bg-gray-50'}`}
                      onClick={() => onUpvote(poll.id)}
                    >
                      {poll.upvotedByMe ? '🧡' : '🔼'}
                    </button>
                    <span className="text-xs font-extrabold text-gray-600 mt-0.5">{poll.upvotes || 0}</span>
                  </div>

                  {/* İÇERİK */}
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="mb-1">
                      <span className="inline-block bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">{poll.category || 'Genel'}</span>
                    </div>

                    <h3 className="text-base sm:text-md font-bold text-gray-900 leading-snug mb-3">
                      <Link to={`/anketler/${poll.id}`} className="hover:text-blue-600 transition">{poll.question}</Link>
                    </h3>

                    {/* ŞIK IZGARASI: Masaüstünde aşırı uzamasın diye max-w-xl sınırı ve h-48 sabitlemesi koyduk */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4 max-w-2xl">
                      {(poll.options || []).map((option, index) => {
                        const percent = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
                        const hasImage = !!option.image_path;

                        return (
                          <div key={index} className="w-full">
                            {hasImage ? (
                              /* 📸 RESİMLİ ŞIK */
                              <div 
                                className={`group relative w-full h-44 sm:h-48 rounded-xl overflow-hidden border border-gray-200 active:scale-[0.99] transition-all ${poll.voted ? 'cursor-default' : 'cursor-pointer'}`}
                                onClick={() => !poll.voted && onVote(poll.id, index)}
                              >
                                <img src={option.image_path} alt={option.text} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                
                                {option.text && (
                                  <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[11px] font-medium">
                                    {option.text}
                                  </div>
                                )}

                                {poll.voted && (
                                  <div className="absolute inset-0 bg-blue-600/75 text-white flex flex-col justify-center items-center text-lg font-black backdrop-blur-[1px]">
                                    <span>%{percent}</span>
                                    <span className="text-[11px] font-normal mt-0.5">{option.votes} Oy</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              /* 📝 RESİMSİZ KLASİK ŞIK */
                              <button
                                className="relative w-full text-left p-3.5 border border-gray-200 bg-gray-50/30 hover:bg-white hover:border-blue-300 rounded-xl font-semibold text-sm transition overflow-hidden flex justify-between items-center group disabled:cursor-default"
                                onClick={() => onVote(poll.id, index)}
                                disabled={poll.voted}
                              >
                                {poll.voted && (
                                  <div className="absolute top-0 left-0 h-full bg-blue-500/10 transition-all duration-500" style={{ width: `${percent}%` }} />
                                )}
                                <span className="relative z-10 text-gray-700 group-hover:text-blue-600 transition-colors">{option.text}</span>
                                {poll.voted && (
                                  <span className="relative z-10 text-xs font-bold text-blue-600">%{percent}</span>
                                )}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-between items-center text-xs text-gray-400 pt-3 border-t border-gray-100">
                      <span className="font-semibold text-gray-500">📊 Toplam Oy: {totalVotes}</span>
                      <Link to={`/anketler/${poll.id}`} className="text-blue-600 font-bold hover:underline">Tartışmaya Katıl ➜</Link>
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 🌟 SAĞ TARAF (4 Sütun Kaplar - Sadece Bilgisayar Ekranında Görünür Premium Sidebar) */}
      <div className="hidden lg:block lg:col-span-4 space-y-4 sticky top-6">
        
        {/* Kategori Paneli */}
        <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm">
          <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-3">🏷️ Kategorileri Keşfet</h4>
          <div className="flex flex-col gap-1">
            {categories.map((category, idx) => (
              <button
                key={idx}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition ${selectedCategory === category ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category === 'Tümü' ? '🌐 Tüm Kararsızlıklar' : `# ${category}`}
              </button>
))}{/* Yardım/Kural Paneli */}💡 Nasıl Çalışır?Kararsız kaldığın bir durumu iki veya daha fazla görsel yükleyerek topluluğa sor. Yazısız oylama konforuyla en hızlı ve şeffaf cevabı anında al!);}export default Anketler;

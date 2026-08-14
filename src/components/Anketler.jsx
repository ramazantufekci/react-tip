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
    <div className="space-y-6">
      
      {/* 📊 POPÜLERLİK VE ZAMAN FİLTRELERİ */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none whitespace-nowrap">
        <button 
          className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${sortBy === 'latest' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
          onClick={() => {
            setSortBy('latest');
            if (sortBy === 'latest' && typeof fetchPolls === 'function') fetchPolls('latest');
          }}
        >
          ✨ En Yeni
        </button>
        <button 
          className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${sortBy === 'upvotes' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
          onClick={() => setSortBy('upvotes')}
        >
          🔥 En Beğenilenler
        </button>
        <button 
          className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${sortBy === 'votes' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
          onClick={() => setSortBy('votes')}
        >
          📊 En Çok Oy Alanlar
        </button>
      </div>

      {/* 🏷️ KONU / KATEGORİ FİLTRELEME ŞERİDİ */}
      <div className="flex gap-2 overflow-x-auto pb-3 border-b border-gray-200 scrollbar-none whitespace-nowrap">
        {categories.map((category, idx) => (
          <button
            key={idx}
            className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${selectedCategory === category ? 'bg-gray-800 text-white border-gray-800' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Anket Kartları Listesi */}
      <div className="space-y-4">
        {displayPolls.length === 0 ? (
          <p className="text-center text-sm text-gray-500 py-8 bg-white rounded-xl border border-dashed border-gray-300">Bu kategoride henüz anket açılmamış.</p>
        ) : (
          displayPolls.map(poll => {
            const totalVotes = poll.options ? poll.options.reduce((sum, opt) => sum + (opt.votes || 0), 0) : 0;

            return (
              <div key={poll.id} className="relative flex items-start bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-sm transition-all hover:border-gray-300">
                
                {/* Sadece anketin sahibiyse beliren silme butonu */}
                {user && poll.user_id === user.id && (
                  <button 
                    onClick={() => onDeletePoll(poll.id)}
                    className="absolute top-4 right-4 bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 px-2.5 py-1 rounded-md text-xs font-bold transition"
                  >
                    🗑️ Sil
                  </button>
                )}

                {/* SOL TARAF: UPVOTE PANELİ */}
                <div className="flex flex-col items-center mr-4 pt-1 min-w-[36px]">
                  <button 
                    className={`text-xl p-1 rounded-lg transition-transform active:scale-125 ${poll.upvotedByMe ? 'filter drop-shadow-[0_0_6px_#ff4500]' : 'hover:bg-gray-100'}`}
                    onClick={() => onUpvote(poll.id)}
                  >
                    {poll.upvotedByMe ? '🧡' : '🔼'}
                  </button>
                  <span className="text-xs font-bold text-gray-700 mt-1">{poll.upvotes || 0}</span>
                </div>

                {/* SAĞ TARAF: İÇERİK VE SEÇENEKLER */}
                <div className="flex-1 min-w-0 pr-12">
                  <div className="mb-1">
                    <span className="inline-block bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">{poll.category || 'Genel'}</span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug mb-3">
                    <Link to={`/anketler/${poll.id}`} className="hover:text-blue-600 transition">{poll.question}</Link>
                  </h3>

                  {/* ŞIK IZGARASI (Tailwind Dinamik auto-fit Mimarisi) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
                    {(poll.options || []).map((option, index) => {
                      const percent = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
                      const hasImage = !!option.image_path;

                      return (
                        <div key={index} className="w-full">
                          {hasImage ? (
                            /* 📸 RESİMLİ ŞIK TASARIMI */
                            <div 
                              className={`group relative w-full h-44 rounded-xl overflow-hidden border border-gray-200 shadow-sm active:scale-[0.99] transition ${poll.voted ? 'cursor-default' : 'cursor-pointer'}`}
                              onClick={() => !poll.voted && onVote(poll.id, index)}
                            >
                              <img src={option.image_path} alt={option.text} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                              
                              {option.text && (
                                <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-0.5 rounded text-xs font-medium">
                                  {option.text}
                                </div>
                              )}

                              {poll.voted && (
                                <div className="absolute inset-0 bg-blue-600/70 text-white flex flex-col justify-center items-center text-xl font-bold animate-fade-in">
                                  <span>%{percent}</span>
                                  <span className="text-xs font-normal mt-0.5">{option.votes} Oy</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            /* 📝 RESİMSİZ KLASİK ŞIK TASARIMI */
                            <button
                              className="relative w-full text-left p-3 border border-gray-300 bg-white hover:border-gray-400 rounded-lg font-medium text-sm transition overflow-hidden flex justify-between items-center group disabled:cursor-default"
                              onClick={() => onVote(poll.id, index)}
                              disabled={poll.voted}
                            >
                              {poll.voted && (
                                <div className="absolute top-0 left-0 h-full bg-blue-500/10 transition-all duration-500" style={{ width: `${percent}%` }} />
                              )}
                              <span className="relative z-10 text-gray-800 group-hover:text-blue-600 transition-colors">{option.text}</span>
                              {poll.voted && (
                                <span className="relative z-10 text-xs font-bold text-blue-600">%{percent} ({option.votes} oy)</span>
                              )}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* KART ALT BİLGİSİ */}
                  <div className="flex justify-between items-center text-xs text-gray-500 pt-3 border-t border-gray-100">
                    <span className="font-medium">💬 Toplam Oy: {totalVotes}</span>
                    <Link to={`/anketler/${poll.id}`} className="text-blue-600 font-semibold hover:underline">Tartışmaya Katıl ➜</Link>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Anketler;

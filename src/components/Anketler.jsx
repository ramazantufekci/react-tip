import React, { useMemo, useState } from 'react';
import { ArrowUp, Check, Flame, Hash, MessageCircle, Plus, Sparkles, Trash2, Vote } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
const filters = [
  { id: 'latest', label: 'En yeni', icon: Sparkles },
  { id: 'upvotes', label: 'Trend', icon: Flame },
  { id: 'votes', label: 'En çok oy', icon: Vote },
];

function Anketler({ polls, onVote, onUpvote, sortBy, setSortBy, onDeletePoll }) {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const categories = useMemo(() => ['Tümü', ...new Set(polls.map(p => p.category).filter(Boolean))], [polls]);
  const filteredPolls = selectedCategory === 'Tümü' ? polls : polls.filter(p => p.category === selectedCategory);

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
      <section className="min-w-0">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Topluluk akışı</p>
            <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Senin için kararsızlıklar</h1>
            <p className="mt-1 text-sm text-slate-500">Birine oy ver, fikrini öne çıkar veya tartışmaya katıl.</p>
          </div>
          <div className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            {filters.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setSortBy(id)} className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition ${sortBy === id ? 'bg-slate-950 text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}>
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {categories.map(category => (
            <button key={category} onClick={() => setSelectedCategory(category)} className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-bold transition ${selectedCategory === category ? 'border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}>
              {category === 'Tümü' ? 'Tümü' : `#${category}`}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredPolls.length === 0 ? (
            <div className="grid place-items-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center shadow-sm">
              <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400"><Hash size={22} /></div>
              <p className="font-bold text-slate-800">Bu kategoride henüz anket yok.</p>
              <p className="mt-1 text-sm text-slate-500">Başka bir kategori seçmeyi deneyebilirsin.</p>
            </div>
          ) : filteredPolls.map(poll => {
            const totalVotes = (poll.options || []).reduce((sum, opt) => sum + Number(opt?.votes || 0), 0);
            const votedOptionIndex = poll.my_vote?.option_index ?? null;
            const hasVoted = votedOptionIndex !== null;
            return (
              <article key={poll.id} className="group overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/60">
                <div className="flex gap-3 p-4 sm:gap-5 sm:p-5">
                  <div className="flex shrink-0 flex-col items-center">
                    <button onClick={() => onUpvote(poll)} className={`grid h-10 w-10 place-items-center rounded-xl border transition active:scale-95 ${poll.upvotedByMe ? 'border-indigo-200 bg-indigo-50 text-indigo-600' : 'border-slate-200 bg-slate-50 text-slate-400 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600'}`} aria-label="Anketi öne çıkar">
                      <ArrowUp size={19} strokeWidth={2.5} />
                    </button>
                    <span className="mt-1 text-xs font-black text-slate-600">{poll.upvotes || 0}</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-indigo-600"><Hash size={11} /> {poll.category || 'Genel'}</span>
                        {hasVoted && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-700"><Check size={11} /> Oy verdin</span>}
                        <h2 className="mt-2 text-base font-extrabold leading-snug text-slate-950 sm:text-lg">
                          <Link to={`/anketler/${poll.slug}`} className="transition hover:text-indigo-600">{poll.question}</Link>
                        </h2>
                      </div>
                      {user && poll.user_id === user.id && (
                        <button onClick={() => onDeletePoll(poll)} className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600" aria-label="Anketi sil"><Trash2 size={16} /></button>
                      )}
                    </div>

                    <div className={`mt-4 grid gap-3 ${poll.options?.length > 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2'}`}>
                      {(poll.options || []).map((option, index) => {
                        const percent = totalVotes ? Math.round(((option.votes || 0) / totalVotes) * 100) : 0;
                        const hasImage = Boolean(option.image_path);
                        return hasImage ? (
                          <button key={index} type="button" onClick={() => !hasVoted && onVote(poll, index)} disabled={hasVoted} className="group/option relative h-48 overflow-hidden rounded-2xl border border-slate-200 text-left">
                            <img src={option.image_path} alt={option.text || `Seçenek ${index + 1}`} className="h-full w-full object-cover transition duration-500 group-hover/option:scale-105" />
                            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3 pt-10 text-xs font-bold text-white">{option.text || `Seçenek ${String.fromCharCode(65 + index)}`}</span>
                            {hasVoted && <span className={`absolute inset-0 grid place-items-center text-center text-white backdrop-blur-[1px] ${votedOptionIndex === index ? 'bg-indigo-600/80' : 'bg-slate-950/45'}`}><span><strong className="block text-2xl">{percent}%</strong><small>{option.votes || 0} oy</small>{votedOptionIndex === index && <small className="mt-1 block font-black">✓ Senin oyun</small>}</span></span>}
                          </button>
                        ) : (
                          <button key={index} type="button" onClick={() => onVote(poll, index)} disabled={hasVoted} className="relative flex min-h-14 items-center justify-between overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/70 px-4 text-left text-sm font-bold text-slate-700 transition hover:border-indigo-300 hover:bg-white disabled:cursor-default">
                            {hasVoted && <span className={`absolute inset-y-0 left-0 ${votedOptionIndex === index ? 'bg-indigo-100' : 'bg-slate-100'}`} style={{ width: `${percent}%` }} />}
                            <span className="relative flex items-center gap-2"><span className="grid h-6 w-6 place-items-center rounded-lg bg-white text-[10px] font-black text-slate-400 shadow-sm">{String.fromCharCode(65 + index)}</span>{option.text}</span>
                            {hasVoted && <span className="relative text-xs font-black text-indigo-600">{percent}%</span>}
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                      <span className="font-semibold text-slate-400">{totalVotes} toplam oy</span>
                      <Link to={`/anketler/${poll.slug}`} className="inline-flex items-center gap-1.5 font-bold text-indigo-600 hover:text-indigo-700"><MessageCircle size={14} /> Tartışmaya katıl</Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <aside className="hidden xl:block">
        <div className="sticky top-24 space-y-4">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><Hash size={17} /></span><div><h3 className="text-sm font-black">Kategoriler</h3><p className="text-xs text-slate-400">Akışı filtrele</p></div></div>
            <div className="space-y-1">
              {categories.map(category => (
                <button key={category} onClick={() => setSelectedCategory(category)} className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${selectedCategory === category ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                  <span>{category === 'Tümü' ? 'Tüm anketler' : `#${category}`}</span>
                  {selectedCategory === category && <Check size={15} />}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-hidden rounded-3xl bg-slate-950 p-5 text-white shadow-xl shadow-slate-300/40">
            <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-white/10"><Plus size={19} /></div>
            <h3 className="text-base font-black">Sen de sorunu paylaş.</h3>
            <p className="mt-1 text-sm leading-6 text-slate-400">İkilemini topluluğa bırak, ortak akılla hızlıca karar ver.</p>
            <Link to="/sor-sor" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2.5 text-xs font-black text-slate-950 hover:bg-indigo-50"><Plus size={15} /> Yeni anket</Link>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default Anketler;

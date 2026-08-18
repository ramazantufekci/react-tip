import React, { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, ArrowUp, CheckCircle2, MessageCircle, Reply, Send } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

function AnketDetay({ polls = [], onVote, onUpvote }) {
  console.log('🔥 ANKET DETAY RENDER');
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { slug } = useParams();
  console.log('DETAY SAYFASI SLUG:', slug);
  const [poll, setPoll] = useState(null);
const [loadingPoll, setLoadingPoll] = useState(true);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyInput, setReplyInput] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
  const fetchPoll = async () => {
    console.log('DETAY USEEFFECT ÇALIŞTI');
    console.log('SLUG:', slug);
    if (!slug){ console.log('SLUG YOK!');return;}
    setLoadingPoll(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/polls/${encodeURIComponent(slug)}`
      );
      console.log('ANKET GET URL:', `${API_BASE_URL}/polls/${encodeURIComponent(slug)}`);
console.log(
                'ANKET GET STATUS:',
                response.status
            );
      if (!response.ok) {
        setPoll(null);
        return;
      }
      const data = await response.json();
      console.log(
                'ANKET GET DATA:',
                data
            );
      setPoll({
        ...data,
        //slug: data.slug,
        options:
          typeof data.options === 'string'
            ? JSON.parse(data.options)
            : data.options,
      });
    } catch (error) {
      console.error(
                'ANKET GET HATASI:',
                error
            );
      console.error('Anket alınamadı:', error);
      setPoll(null);
    } finally {
      setLoadingPoll(false);
    }
  };

  fetchPoll();
}, [slug]);

  const fetchComments = useCallback(async (pageNumber = 1) => {
    if (!slug) return;
    setLoadingComments(true);
    try {
      const response = await fetch(`${API_BASE_URL}/polls/${encodeURIComponent(slug)}/comments?page=${pageNumber}`);
      if (!response.ok) return;
      const result = await response.json();
      const incoming = result.data || [];
      setComments(pageNumber === 1 ? incoming : prev => [...prev, ...incoming]);
      setHasMore(Boolean(result.has_more));
      setPage(pageNumber);
    } finally { setLoadingComments(false); }
  }, [slug]);

  useEffect(() => { if (slug) fetchComments(1); }, [slug, fetchComments]);

  const submitComment = async (e, parentId = null) => {
    e.preventDefault();
    if (!isAuthenticated) { navigate('/login'); return; }
    const text = parentId ? replyInput : commentInput;
    if (!text.trim()) return;
    const response = await fetch(`${API_BASE_URL}/polls/${encodeURIComponent(slug)}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ text, parent_id: parentId }),
    });
    if (response.ok) {
      setCommentInput(''); setReplyInput(''); setReplyingTo(null); fetchComments(1);
    } else if (response.status === 401) navigate('/login');
  };

  if (loadingPoll) {
  return (
    <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
      <p className="font-black text-slate-700">
        Anket yükleniyor...
      </p>
    </div>
  );
}
const poll = polls.find(
    (p) => p.slug === slug
  );
if (!poll) {
  return (
    <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
      <p className="font-black">
        Anket bulunamadı.
      </p>

      <Link
        to="/anketler"
        className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-indigo-600"
      >
        <ArrowLeft size={15} />
        Anketlere dön
      </Link>
    </div>
  );
}

  const totalVotes = (poll.options || []).reduce((sum, o) => sum + (o.votes || 0), 0);

  return (
    <div className="mx-auto max-w-4xl">
      <Link to="/anketler" className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-950"><ArrowLeft size={16} /> Anketlere dön</Link>

      <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
        <div className="p-5 sm:p-8">
          <div className="flex gap-4">
            <div className="flex shrink-0 flex-col items-center">
              <button onClick={() => onUpvote(poll)} className={`grid h-11 w-11 place-items-center rounded-xl border ${poll.upvotedByMe ? 'border-indigo-200 bg-indigo-50 text-indigo-600' : 'border-slate-200 bg-slate-50 text-slate-400 hover:text-indigo-600'}`}><ArrowUp size={20} /></button>
              <span className="mt-1 text-xs font-black">{poll.upvotes || 0}</span>
            </div>
            <div className="min-w-0 flex-1">
              <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-indigo-600">#{poll.category || 'Genel'}</span>
              <h1 className="mt-3 text-2xl font-black leading-tight tracking-tight text-slate-950 sm:text-3xl">{poll.question}</h1>

              <div className={`mt-6 grid gap-4 ${poll.options?.length > 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2'}`}>
                {(poll.options || []).map((option, index) => {
                  const percent = totalVotes ? Math.round(((option.votes || 0) / totalVotes) * 100) : 0;
                  if (option.image_path) return (
                    <button key={index} disabled={poll.voted} onClick={() => !poll.voted && onVote(poll.id, index)} className="group relative h-64 overflow-hidden rounded-2xl border border-slate-200 text-left">
                      <img src={option.image_path} alt={option.text || 'Seçenek'} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12 text-sm font-black text-white">{option.text || `Seçenek ${String.fromCharCode(65 + index)}`}</span>
                      {poll.voted && <span className="absolute inset-0 grid place-items-center bg-indigo-600/80 text-white"><span className="text-center"><strong className="block text-4xl font-black">{percent}%</strong><small>{option.votes || 0} oy</small></span></span>}
                    </button>
                  );
                  return (
                    <button key={index} disabled={poll.voted} onClick={() => onVote(poll, index)} className="relative flex min-h-16 items-center justify-between overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 px-4 text-left text-sm font-black text-slate-700 hover:border-indigo-300 disabled:cursor-default">
                      {poll.voted && <span className="absolute inset-y-0 left-0 bg-indigo-100" style={{ width: `${percent}%` }} />}
                      <span className="relative flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-xl bg-white text-xs shadow-sm">{String.fromCharCode(65 + index)}</span>{option.text}</span>
                      {poll.voted && <span className="relative text-indigo-600">{percent}%</span>}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-400"><CheckCircle2 size={14} /> {totalVotes} toplam oy</div>
            </div>
          </div>
        </div>
      </article>

      <section className="mt-5 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-5 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-white"><MessageCircle size={18} /></span><div><h2 className="font-black">Topluluk yorumları</h2><p className="text-xs text-slate-400">Fikrini bırak, diğer görüşleri keşfet.</p></div></div>
        <form onSubmit={e => submitComment(e)} className="mb-6 flex gap-2">
          <textarea value={commentInput} onChange={e => setCommentInput(e.target.value)} rows={3} placeholder={isAuthenticated ? 'Ne düşünüyorsun?' : 'Yorum yapmak için giriş yap.'} className="min-w-0 flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10" />
          <button className="h-fit rounded-xl bg-slate-950 p-3 text-white hover:bg-indigo-700"><Send size={17} /></button>
        </form>

        <div className="space-y-3">
          {comments.map(comment => <CommentNode key={comment.id} comment={comment} replyingTo={replyingTo} setReplyingTo={setReplyingTo} replyInput={replyInput} setReplyInput={setReplyInput} submitComment={submitComment} />)}
          {loadingComments && <p className="py-4 text-center text-xs font-bold text-slate-400">Yorumlar yükleniyor...</p>}
          {!loadingComments && hasMore && <button onClick={() => fetchComments(page + 1)} className="w-full rounded-xl bg-slate-100 py-3 text-xs font-black text-slate-600 hover:bg-slate-200">Daha fazla yorum yükle</button>}
          {!loadingComments && comments.length === 0 && <p className="py-8 text-center text-sm font-semibold text-slate-400">Henüz yorum yok.</p>}
        </div>
      </section>
    </div>
  );
}

function CommentNode({ comment, replyingTo, setReplyingTo, replyInput, setReplyInput, submitComment }) {
  const replies = comment.childReplies || comment.child_replies || [];
  return (
    <div>
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
        <div className="flex items-center justify-between gap-3 text-xs"><span className="font-black text-slate-700">{comment.author?.name || comment.user || 'Kullanıcı'}</span><span className="text-slate-400">{comment.created_at ? new Date(comment.created_at).toLocaleDateString('tr-TR') : 'Şimdi'}</span></div>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{comment.text}</p>
        <button onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)} className="mt-3 inline-flex items-center gap-1.5 text-xs font-black text-indigo-600"><Reply size={13} /> Cevapla</button>
      </div>
      {replyingTo === comment.id && <form onSubmit={e => submitComment(e, comment.id)} className="ml-4 mt-2 flex gap-2 border-l-2 border-indigo-100 pl-3"><input autoFocus value={replyInput} onChange={e => setReplyInput(e.target.value)} placeholder="Yanıtını yaz..." className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500" /><button className="rounded-xl bg-indigo-600 px-3 text-xs font-black text-white">Gönder</button></form>}
      {replies.length > 0 && <div className="ml-4 mt-2 space-y-2 border-l-2 border-slate-100 pl-3">{replies.map(reply => <CommentNode key={reply.id} comment={reply} replyingTo={replyingTo} setReplyingTo={setReplyingTo} replyInput={replyInput} setReplyInput={setReplyInput} submitComment={submitComment} />)}</div>}
    </div>
  );
}

export default AnketDetay;

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Settings,
  Trash2,
  Check,
} from 'lucide-react';
import Swal from 'sweetalert2';

import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

function Profil({ onDeletePoll, onPollsDeleted }) {
  const { user, token } = useAuth();

  const [created, setCreated] = useState([]);
  const [voted, setVoted] = useState([]);
  const [tab, setTab] = useState('created');
  const [loading, setLoading] = useState(true);

  // Çoklu seçim
  const [selectedPollIds, setSelectedPollIds] = useState([]);

  // Toplu silme sırasında
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [profileRes, pollsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/user/profile`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          fetch(`${API_BASE_URL}/polls`),
        ]);

        if (!profileRes.ok || !pollsRes.ok) {
          return;
        }

        const profile = await profileRes.json();
        const allPolls = await pollsRes.json();

        const votedIds = JSON.parse(
          localStorage.getItem('my_votes') || '[]'
        );

        const parse = (poll) => ({
          ...poll,
          options:
            typeof poll.options === 'string'
              ? JSON.parse(poll.options)
              : poll.options,
        });

        setCreated(
          (profile.my_polls || []).map(parse)
        );

        setVoted(
  (profile.voted_polls || []).map(poll => ({
    ...parse(poll),
    voted: true,
  }))
);
      } catch (error) {
        console.error('Profil yükleme hatası:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  /*
   * Tek bir anket silme
   */
  const remove = async (poll) => {
    const result = await Swal.fire({
      title: 'Anket silinsin mi?',
      text: 'Bu işlem geri alınamaz.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Evet, sil',
      cancelButtonText: 'Vazgeç',
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await onDeletePoll(poll);

      setCreated((prev) =>
        prev.filter((p) => p.id !== poll.id)
      );

      // Eğer seçiliyse seçimden de çıkar
      setSelectedPollIds((prev) =>
        prev.filter((id) => id !== poll.id)
      );

      Swal.fire({
        icon: 'success',
        title: 'Anket silindi',
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Anket silme hatası:', error);
    }
  };

  /*
   * Anket seç / seçimi kaldır
   */
  const togglePollSelection = (pollId) => {
    setSelectedPollIds((prev) => {
      if (prev.includes(pollId)) {
        return prev.filter((id) => id !== pollId);
      }

      return [...prev, pollId];
    });
  };

  /*
   * Bütün anketler seçili mi?
   */
  const allPollsSelected =
    created.length > 0 &&
    selectedPollIds.length === created.length;

  /*
   * Tümünü seç / seçimi kaldır
   */
  const toggleSelectAll = () => {
    if (allPollsSelected) {
      setSelectedPollIds([]);
      return;
    }

    setSelectedPollIds(
      created.map((poll) => poll.id)
    );
  };

  /*
   * Toplu silme
   */
  const deleteSelectedPolls = async () => {
    if (selectedPollIds.length === 0) {
      return;
    }

    const result = await Swal.fire({
      title: 'Anketler silinsin mi?',
      text: `${selectedPollIds.length} anket kalıcı olarak silinecek.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Evet, sil',
      cancelButtonText: 'Vazgeç',
    });

    if (!result.isConfirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/polls/bulk-delete`,
        {
          method: 'DELETE',

          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            poll_ids: selectedPollIds,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Anketler silinemedi.'
        );
      }

      /*
       * Silinen anketleri listeden kaldır
       */
      setCreated((prev) =>
        prev.filter(
          (poll) =>
            !data.deleted_ids.includes(poll.id)
        )
      );
onPollsDeleted(data.deleted_ids);
      /*
       * Seçimleri temizle
       */
      setSelectedPollIds([]);

      await Swal.fire({
        icon: 'success',
        title: 'Anketler silindi',
        text: data.message,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error(
        'Toplu silme hatası:',
        error
      );

      Swal.fire({
        icon: 'error',
        title: 'Silinemedi',
        text:
          error.message ||
          'Anketler silinirken hata oluştu.',
        confirmButtonColor: '#0f172a',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  /*
   * Tab değişince seçimleri temizle
   */
  const changeTab = (newTab) => {
    setTab(newTab);
    setSelectedPollIds([]);
  };

  if (loading) {
    return (
      <div className="grid min-h-80 place-items-center rounded-3xl border border-slate-200 bg-white text-sm font-semibold text-slate-500">
        Profil yükleniyor...
      </div>
    );
  }

  const list =
    tab === 'created'
      ? created
      : voted;

  return (
    <div className="mx-auto max-w-4xl">
      {/* PROFİL HEADER */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-xl shadow-slate-200 sm:p-8">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/25 blur-3xl" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white/10 text-2xl font-black ring-1 ring-white/10">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-300">
                Profil
              </p>

              <h1 className="mt-1 text-2xl font-black">
                {user?.name}
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                {user?.email}
              </p>
            </div>
          </div>

          <Link
            to="/ayarlar"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/15"
          >
            <Settings size={15} />
            Hesap ayarları
          </Link>
        </div>
      </section>

      {/* TABS */}
      <div className="mt-5 grid grid-cols-2 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
        <button
          onClick={() => changeTab('created')}
          className={`rounded-xl px-4 py-3 text-sm font-black transition ${
            tab === 'created'
              ? 'bg-slate-950 text-white'
              : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          Açtığım anketler

          <span className="ml-1 opacity-60">
            {created.length}
          </span>
        </button>

        <button
          onClick={() => changeTab('voted')}
          className={`rounded-xl px-4 py-3 text-sm font-black transition ${
            tab === 'voted'
              ? 'bg-slate-950 text-white'
              : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          Oy verdiklerim

          <span className="ml-1 opacity-60">
            {voted.length}
          </span>
        </button>
      </div>

      {/* ANKETLERİM TOOLBAR */}
      {tab === 'created' && created.length > 0 && (
        <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              Anketlerim
            </h2>

            <p className="mt-1 text-xs font-medium text-slate-500">
              Oluşturduğun anketleri seçerek yönetebilirsin.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
            >
              <Check size={16} />

              {allPollsSelected
                ? 'Seçimi kaldır'
                : 'Tümünü seç'}
            </button>
          </div>
        </div>
      )}

      {/* ANKET LİSTESİ */}
      <div className="mt-4 space-y-3">
        {list.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="font-bold text-slate-800">
              Henüz burada bir şey yok.
            </p>

            <Link
              to={
                tab === 'created'
                  ? '/sor-sor'
                  : '/anketler'
              }
              className="mt-3 inline-flex items-center gap-1 text-sm font-black text-indigo-600"
            >
              Keşfet
              <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          list.map((poll) => {
            const selected =
              selectedPollIds.includes(poll.id);

            return (
              <div
                key={poll.id}
                className={`flex items-center gap-4 rounded-2xl border p-4 shadow-sm transition ${
                  selected
                    ? 'border-indigo-300 bg-indigo-50/50'
                    : 'border-slate-200 bg-white'
                }`}
              >
                {/* CHECKBOX */}
                {tab === 'created' && (
                  <button
                    type="button"
                    onClick={() =>
                      togglePollSelection(
                        poll.id
                      )
                    }
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg border-2 transition ${
                      selected
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-slate-300 bg-white text-transparent hover:border-indigo-400'
                    }`}
                    aria-label={
                      selected
                        ? 'Seçimi kaldır'
                        : 'Anketi seç'
                    }
                  >
                    <Check
                      size={15}
                      strokeWidth={3}
                    />
                  </button>
                )}

                {/* ANKET BİLGİLERİ */}
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600">
                    #{poll.category || 'Genel'}
                  </span>

                  <Link
                    to={`/anketler/${poll.slug}`}
                    className="mt-1 block truncate font-extrabold text-slate-900 hover:text-indigo-600"
                  >
                    {poll.question}
                  </Link>

                  {tab === 'voted' && (
                    <span className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                      <CheckCircle2 size={13} />
                      Oy kullanıldı
                    </span>
                  )}
                </div>

                {/* TEKİL SİLME */}
                {tab === 'created' && (
                  <button
                    type="button"
                    onClick={() =>
                      remove(poll)
                    }
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                    title="Anketi sil"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* TOPLU SİLME BAR */}
      {tab === 'created' &&
        selectedPollIds.length > 0 && (
          <div className="sticky bottom-5 z-20 mt-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black text-slate-900">
                {selectedPollIds.length} anket seçildi
              </p>

              <p className="text-xs font-medium text-slate-500">
                Seçilen anketler kalıcı olarak
                silinecek.
              </p>
            </div>

            <button
              type="button"
              disabled={isDeleting}
              onClick={deleteSelectedPolls}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-black text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 size={16} />

              {isDeleting
                ? 'Siliniyor...'
                : `Seçilenleri sil`}
            </button>
          </div>
        )}
    </div>
  );
}

export default Profil;

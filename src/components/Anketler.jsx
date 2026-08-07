import React from 'react';
import { Link } from 'react-router-dom';

function Anketler({ polls, onVote }) {
  return (
    <div>
      {polls.map((poll) => (
        <div key={poll.id} className="poll-card">
          <h3 className="poll-question">{poll.question}</h3>
          <div>
            {poll.options.map((option, index) => {
              const percent = poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0;
              return (
                <button key={index} className="option-btn" onClick={() => onVote(poll.id, index)} disabled={poll.voted}>
                  {poll.voted && <div className="result-bar" style={{ width: `${percent}%` }}></div>}
                  <span className="option-text">
                    <span>{option.text}</span>
                    {poll.voted && <span>%{percent} ({option.votes})</span>}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="poll-footer" style={{ alignItems: 'center' }}>
            <span>📊 Toplam Oy: {poll.totalVotes}</span>
            {/* Detay sayfasına yönlendiren link */}
            <Link to={`/anketler/${poll.id}`} className="detail-link">
              💬 Yorumlar & Detay
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Anketler;

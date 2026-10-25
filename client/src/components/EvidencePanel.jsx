const STATUS_HINTS = {
  'no-username': 'Save your GitHub username in the GitHub panel to compare it with your skills.',
  'not-fetched': 'Refresh your GitHub data to see which skills it backs up.',
  stale: 'Your GitHub data belongs to a different username. Refresh it to update the evidence.'
};

function formatShare(share) {
  return share < 0.1 ? '<0.1%' : share + '%';
}

export default function EvidencePanel({ evidence }) {
  if (!evidence || evidence.status !== 'ready') {
    return (
      <section className="card">
        <h2>GitHub evidence</h2>
        <p className="empty">{STATUS_HINTS[evidence && evidence.status] || 'No GitHub evidence yet.'}</p>
      </section>
    );
  }

  const evidenced = evidence.skills.filter(function (s) { return s.status === 'evidenced'; });
  const missing = evidence.skills.filter(function (s) { return s.status === 'no-evidence'; });
  const unmeasurable = evidence.skills.filter(function (s) { return s.status === 'not-measurable'; });

  return (
    <section className="card">
      <h2>GitHub evidence</h2>
      <p className="hint">
        Compares your declared skills with the languages in your public repos.
        It does not change your readiness score.
      </p>

      <p className="stat-line">Backed by GitHub ({evidenced.length})</p>
      {evidenced.length === 0 ? (
        <p className="empty">None of your skills match a language in your repos yet.</p>
      ) : (
        <ul className="item-list">
          {evidenced.map(function (s, i) {
            return (
              <li className="item" key={s.name + '-' + i}>
                <div className="item-main">
                  <span className="item-title">{s.name}</span>{' '}
                  <span className="tag">{s.language}</span>
                </div>
                <span className="hint">
                  {formatShare(s.share)} of code &middot; main language in {s.repoCount} repo{s.repoCount === 1 ? '' : 's'}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {missing.length > 0 && (
        <>
          <p className="stat-line">No GitHub code found ({missing.length})</p>
          <ul className="item-list">
            {missing.map(function (s, i) {
              return (
                <li className="item" key={s.name + '-' + i}>
                  <span className="item-title">{s.name}</span>
                  <span className="hint">declared as a language, not found in your repos</span>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {evidence.undeclaredLanguages.length > 0 && (
        <>
          <p className="stat-line">Used on GitHub but not declared ({evidence.undeclaredLanguages.length})</p>
          <ul className="item-list">
            {evidence.undeclaredLanguages.map(function (l) {
              return (
                <li className="item" key={l.name}>
                  <span className="item-title">{l.name}</span>
                  <span className="hint">{formatShare(l.share)} of code</span>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {unmeasurable.length > 0 && (
        <p className="hint">
          Not measurable from languages: {unmeasurable.map(function (s) { return s.name; }).join(', ')}
        </p>
      )}
    </section>
  );
}

import { useState } from 'react';

function LanguageBar({ name, share }) {
  return (
    <div className="bar-row">
      <span>{name}</span>
      <div className="bar">
        <div className="bar-fill" style={{ width: share + '%' }} />
      </div>
      <span className="bar-value">{share < 1 ? '<1' : Math.round(share)}%</span>
    </div>
  );
}

export default function GitHubPanel({ github, onSave, onRefresh }) {
  const [username, setUsername] = useState(github.username || '');
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const snapshot = github.snapshot;

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    await onSave({ githubUsername: username.trim() });
    setSaving(false);
  }

  async function handleRefresh() {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  }

  // Share of total bytes across sampled repos, for display only
  const totalBytes = snapshot
    ? snapshot.languages.reduce(function (sum, l) { return sum + l.bytes; }, 0)
    : 0;
  const topLanguages = snapshot ? snapshot.languages.slice(0, 6) : [];
  const recentRepos = snapshot ? snapshot.repos.slice(0, 5) : [];

  return (
    <section className="card">
      <h2>GitHub</h2>

      <form className="inline-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          placeholder="GitHub username"
          onChange={function (e) { setUsername(e.target.value); }}
        />
        <button className="btn" type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button
          className="btn"
          type="button"
          onClick={handleRefresh}
          disabled={!github.username || refreshing}
        >
          {refreshing ? 'Fetching...' : 'Refresh from GitHub'}
        </button>
      </form>

      {!github.username && (
        <p className="empty">Save your GitHub username, then refresh to pull in your public repos.</p>
      )}
      {github.username && github.stale && (
        <p className="hint">
          {snapshot
            ? 'This data was fetched for ' + snapshot.username + '. Refresh to load ' + github.username + '.'
            : 'No GitHub data yet. Click refresh to fetch it.'}
        </p>
      )}

      {snapshot && (
        <>
          <p className="stat-line">
            {snapshot.account.publicRepos} public repos &middot; {snapshot.account.followers} followers
            &middot; fetched {new Date(snapshot.fetchedAt).toLocaleString()}
          </p>

          {topLanguages.map(function (l) {
            return (
              <LanguageBar
                key={l.name}
                name={l.name}
                share={totalBytes ? (l.bytes / totalBytes) * 100 : 0}
              />
            );
          })}

          <ul className="item-list">
            {recentRepos.map(function (r) {
              return (
                <li className="item" key={r.name}>
                  <div className="item-main">
                    <span className="item-title">{r.name}</span>{' '}
                    {r.language && <span className="tag">{r.language}</span>}
                    {r.isFork && <span className="tag">fork</span>}
                  </div>
                  <span className="hint">&#9733; {r.stars}</span>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}

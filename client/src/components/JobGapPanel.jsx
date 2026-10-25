const STATUS_TAGS = {
  missing: 'tag tag-warn',
  weak: 'tag tag-weak',
  covered: 'tag tag-ok'
};

function statusLabel(s) {
  if (s.status === 'missing') return 'missing';
  return s.status + ' · level ' + s.level;
}

export default function JobGapPanel({ gap }) {
  if (!gap || gap.status !== 'ready') {
    return (
      <section className="card card-wide">
        <h2>Skill gap</h2>
        <p className="empty">Add job postings to compare what they ask for with your declared skills.</p>
      </section>
    );
  }

  const githubUnavailable = gap.skills.some(function (s) { return s.github === 'unavailable'; });

  return (
    <section className="card card-wide">
      <h2>Skill gap</h2>
      <p className="hint">
        Skills mentioned in your {gap.totalPostings} saved posting{gap.totalPostings === 1 ? '' : 's'},
        most requested first. Level 2 or below counts as weak. This does not change your readiness score.
      </p>
      <p className="stat-line">
        {gap.counts.missing} missing &middot; {gap.counts.weak} weak &middot; {gap.counts.covered} covered
      </p>
      {githubUnavailable && (
        <p className="hint">GitHub evidence is not shown until your GitHub data is fetched for your current username.</p>
      )}

      <ul className="item-list">
        {gap.skills.map(function (s) {
          return (
            <li className="item" key={s.name}>
              <div className="item-main">
                <span className="item-title">{s.name}</span>{' '}
                <span className={STATUS_TAGS[s.status]}>{statusLabel(s)}</span>{' '}
                {s.github === 'evidenced' && <span className="tag">on GitHub</span>}
                {s.status === 'missing' && s.github === 'evidenced' && (
                  <div className="item-meta">You use this on GitHub but have not declared it as a skill.</div>
                )}
                {s.declaredAs && s.declaredAs !== s.name && (
                  <div className="item-meta">Declared as &ldquo;{s.declaredAs}&rdquo;</div>
                )}
              </div>
              <span className="hint">
                {s.postings} of {gap.totalPostings} &middot; {Math.round(s.demandPercent)}%
              </span>
            </li>
          );
        })}
      </ul>

      {gap.unrequestedSkills.length > 0 && (
        <p className="hint">Declared but not requested by any saved posting: {gap.unrequestedSkills.join(', ')}</p>
      )}
      {gap.unrecognisedSkills.length > 0 && (
        <p className="hint">
          Not in the skill dictionary, so not compared: {gap.unrecognisedSkills.join(', ')}
        </p>
      )}
    </section>
  );
}

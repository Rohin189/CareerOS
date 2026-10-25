import { useState } from 'react';

const MAX_TEXT = 20000;
const MAX_TAGS = 10;

export default function JobsPanel({ jobs, onAdd, onRemove }) {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [text, setText] = useState('');
  const [adding, setAdding] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !text.trim()) {
      return;
    }
    setAdding(true);
    const ok = await onAdd({ title: title.trim(), company: company.trim(), text: text });
    setAdding(false);
    // Keep the pasted description if saving failed, so it does not have to be pasted again
    if (ok) {
      setTitle('');
      setCompany('');
      setText('');
    }
  }

  return (
    <section className="card">
      <h2>Job postings</h2>
      <p className="hint">
        Paste job descriptions you are interested in. Skills are recognised with a fixed dictionary,
        so some terms may be missed.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="inline-form">
          <input
            type="text"
            value={title}
            placeholder="Job title"
            maxLength={200}
            onChange={function (e) { setTitle(e.target.value); }}
          />
          <input
            type="text"
            value={company}
            placeholder="Company (optional)"
            maxLength={200}
            onChange={function (e) { setCompany(e.target.value); }}
          />
        </div>
        <textarea
          value={text}
          placeholder="Paste the job description"
          rows={6}
          maxLength={MAX_TEXT}
          onChange={function (e) { setText(e.target.value); }}
        />
        <div className="form-actions">
          <button className="btn" type="submit" disabled={adding || !title.trim() || !text.trim()}>
            {adding ? 'Adding...' : 'Add posting'}
          </button>{' '}
          <span className="hint">{text.length} / {MAX_TEXT}</span>
        </div>
      </form>

      {jobs.length === 0 ? (
        <p className="empty">No postings yet. Add one above to see which skills the market asks for.</p>
      ) : (
        <ul className="item-list">
          {jobs.map(function (j) {
            const shown = j.skills.slice(0, MAX_TAGS);
            const more = j.skills.length - shown.length;
            return (
              <li className="item" key={j._id}>
                <div className="item-main">
                  <span className="item-title">{j.title}</span>
                  {j.company && <span className="hint"> &middot; {j.company}</span>}
                  <div className="item-meta">
                    Added {String(j.createdAt).slice(0, 10)} &middot; {j.skills.length} skill
                    {j.skills.length === 1 ? '' : 's'} recognised
                  </div>
                  <div className="tag-row">
                    {shown.map(function (s) {
                      return <span className="tag" key={s.name}>{s.name}</span>;
                    })}
                    {more > 0 && <span className="hint">+{more} more</span>}
                  </div>
                </div>
                <button className="btn-link" onClick={function () { onRemove(j._id); }}>Remove</button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

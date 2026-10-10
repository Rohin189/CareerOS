import { useState } from 'react';

const CATEGORIES = [
  { value: 'language', label: 'Language' },
  { value: 'framework', label: 'Framework' },
  { value: 'tool', label: 'Tool' },
  { value: 'cs-fundamentals', label: 'CS fundamentals' },
  { value: 'soft-skill', label: 'Soft skill' },
  { value: 'other', label: 'Other' }
];

export default function SkillsPanel({ skills, summary, onSave }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('language');
  const [level, setLevel] = useState(3);

  async function addSkill(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    const newSkill = { name: trimmed, category: category, level: Number(level) };
    await onSave({ skills: skills.concat([newSkill]) });
    setName('');
  }

  async function changeLevel(id, newLevel) {
    await onSave({
      skills: skills.map(function (s) {
        return s._id === id ? { ...s, level: Number(newLevel) } : s;
      })
    });
  }

  async function removeSkill(id) {
    await onSave({
      skills: skills.filter(function (s) { return s._id !== id; })
    });
  }

  return (
    <section className="card">
      <h2>Skills</h2>
      <p className="stat-line">
        {summary.total} skills &middot; average level {summary.averageLevel}
      </p>
      {summary.growthAreas.length > 0 && (
        <p className="hint">
          Growth areas: {summary.growthAreas.map(function (g) { return g.name; }).join(', ')}
        </p>
      )}

      <form className="inline-form" onSubmit={addSkill}>
        <input
          type="text"
          value={name}
          placeholder="Skill name"
          onChange={function (e) { setName(e.target.value); }}
        />
        <select value={category} onChange={function (e) { setCategory(e.target.value); }}>
          {CATEGORIES.map(function (c) {
            return <option key={c.value} value={c.value}>{c.label}</option>;
          })}
        </select>
        <select value={level} onChange={function (e) { setLevel(e.target.value); }}>
          {[1, 2, 3, 4, 5].map(function (n) {
            return <option key={n} value={n}>Level {n}</option>;
          })}
        </select>
        <button className="btn" type="submit">Add</button>
      </form>

      {skills.length === 0 ? (
        <p className="empty">No skills yet. Add your first one above.</p>
      ) : (
        <ul className="item-list">
          {skills.map(function (s) {
            return (
              <li className="item" key={s._id}>
                <div className="item-main">
                  <span className="item-title">{s.name}</span>{' '}
                  <span className="tag">{s.category}</span>
                </div>
                <select value={s.level} onChange={function (e) { changeLevel(s._id, e.target.value); }}>
                  {[1, 2, 3, 4, 5].map(function (n) {
                    return <option key={n} value={n}>Level {n}</option>;
                  })}
                </select>
                <button className="btn-link" onClick={function () { removeSkill(s._id); }}>Remove</button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

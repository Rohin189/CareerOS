import { useState } from 'react';

const STATUSES = [
  { value: 'planned', label: 'Planned' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'done', label: 'Done' }
];

function isOverdue(m) {
  return m.status !== 'done' && Boolean(m.dueDate) && new Date(m.dueDate) < new Date();
}

export default function MilestonesPanel({ milestones, summary, onSave }) {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');

  async function addMilestone(e) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      return;
    }
    const newItem = { title: trimmed, status: 'planned' };
    if (dueDate) {
      newItem.dueDate = dueDate;
    }
    await onSave({ milestones: milestones.concat([newItem]) });
    setTitle('');
    setDueDate('');
  }

  async function changeStatus(id, status) {
    await onSave({
      milestones: milestones.map(function (m) {
        return m._id === id ? { ...m, status: status } : m;
      })
    });
  }

  async function removeMilestone(id) {
    await onSave({
      milestones: milestones.filter(function (m) { return m._id !== id; })
    });
  }

  return (
    <section className="card">
      <h2>Milestones</h2>
      <p className="stat-line">
        {summary.done} of {summary.total} done &middot; {summary.completionPercent}% complete
        {summary.overdue > 0 ? ' \u00b7 ' + summary.overdue + ' overdue' : ''}
      </p>

      <form className="inline-form" onSubmit={addMilestone}>
        <input
          type="text"
          value={title}
          placeholder="Milestone title"
          onChange={function (e) { setTitle(e.target.value); }}
        />
        <input type="date" value={dueDate} onChange={function (e) { setDueDate(e.target.value); }} />
        <button className="btn" type="submit">Add</button>
      </form>

      {milestones.length === 0 ? (
        <p className="empty">No milestones yet. Add your first one above.</p>
      ) : (
        <ul className="item-list">
          {milestones.map(function (m) {
            return (
              <li className="item" key={m._id}>
                <div className="item-main">
                  <span className="item-title">{m.title}</span>{' '}
                  {isOverdue(m) && <span className="tag tag-warn">overdue</span>}
                  {m.dueDate && (
                    <div className="item-meta">Due {String(m.dueDate).slice(0, 10)}</div>
                  )}
                </div>
                <select value={m.status} onChange={function (e) { changeStatus(m._id, e.target.value); }}>
                  {STATUSES.map(function (s) {
                    return <option key={s.value} value={s.value}>{s.label}</option>;
                  })}
                </select>
                <button className="btn-link" onClick={function () { removeMilestone(m._id); }}>Remove</button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

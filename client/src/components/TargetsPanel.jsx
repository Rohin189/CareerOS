import { useState } from 'react';

export default function TargetsPanel({ profile, onSave }) {
  const [role, setRole] = useState(profile.targetRole || '');
  const [companies, setCompanies] = useState((profile.targetCompanies || []).join(', '));
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const list = companies
      .split(',')
      .map(function (c) { return c.trim(); })
      .filter(Boolean);
    await onSave({ targetRole: role.trim(), targetCompanies: list });
    setSaving(false);
  }

  return (
    <section className="card">
      <h2>Career targets</h2>
      <form onSubmit={handleSubmit}>
        <label className="field">Target role</label>
        <input
          type="text"
          value={role}
          placeholder="e.g. ML Engineer"
          onChange={function (e) { setRole(e.target.value); }}
        />
        <label className="field">Target companies (comma-separated)</label>
        <input
          type="text"
          value={companies}
          placeholder="e.g. Google, Microsoft"
          onChange={function (e) { setCompanies(e.target.value); }}
        />
        <div className="form-actions">
          <button className="btn" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save targets'}
          </button>
        </div>
      </form>
    </section>
  );
}

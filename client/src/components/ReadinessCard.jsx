function Bar({ label, value }) {
  return (
    <div className="bar-row">
      <span>{label}</span>
      <div className="bar">
        <div className="bar-fill" style={{ width: value + '%' }} />
      </div>
      <span className="bar-value">{Math.round(value)}%</span>
    </div>
  );
}

export default function ReadinessCard({ summary }) {
  const readiness = summary.readiness;

  return (
    <section className="card">
      <h2>Readiness</h2>
      <div className="score">{readiness.score}<span>/ 100</span></div>
      <p className="hint">
        Progress against your own plan, based on self-rated skills and milestones.
        It is not a hiring prediction.
      </p>
      <Bar label="Profile completeness" value={readiness.breakdown.completeness} />
      <Bar label="Skill strength" value={readiness.breakdown.skillStrength} />
      <Bar label="Milestone progress" value={readiness.breakdown.milestoneProgress} />
    </section>
  );
}

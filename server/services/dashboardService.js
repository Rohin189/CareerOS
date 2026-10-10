function round(value, decimals) {
  var factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

function computeDashboard(profile) {
  var skills = profile.skills || [];
  var milestones = profile.milestones || [];
  var companies = profile.targetCompanies || [];
  var now = new Date();

  // ---- Skills ----
  var totalLevel = skills.reduce(function (sum, s) { return sum + s.level; }, 0);
  var averageLevel = skills.length ? totalLevel / skills.length : 0;

  var byCategory = {};
  skills.forEach(function (s) {
    if (!byCategory[s.category]) {
      byCategory[s.category] = { count: 0, totalLevel: 0 };
    }
    byCategory[s.category].count += 1;
    byCategory[s.category].totalLevel += s.level;
  });
  Object.keys(byCategory).forEach(function (key) {
    var c = byCategory[key];
    byCategory[key] = { count: c.count, averageLevel: round(c.totalLevel / c.count, 2) };
  });

  var topSkills = skills
    .slice()
    .sort(function (a, b) { return b.level - a.level; })
    .slice(0, 3)
    .map(function (s) { return { name: s.name, level: s.level }; });

  var growthAreas = skills
    .filter(function (s) { return s.level <= 2; })
    .map(function (s) { return { name: s.name, level: s.level }; });

  // ---- Milestones ----
  var done = milestones.filter(function (m) { return m.status === 'done'; }).length;
  var inProgress = milestones.filter(function (m) { return m.status === 'in-progress'; }).length;
  var planned = milestones.filter(function (m) { return m.status === 'planned'; }).length;
  var completionPercent = milestones.length ? (done / milestones.length) * 100 : 0;

  var open = milestones.filter(function (m) { return m.status !== 'done' && m.dueDate; });
  var overdue = open.filter(function (m) { return new Date(m.dueDate) < now; }).length;
  var upcoming = open
    .filter(function (m) { return new Date(m.dueDate) >= now; })
    .sort(function (a, b) { return new Date(a.dueDate) - new Date(b.dueDate); })
    .slice(0, 3)
    .map(function (m) { return { title: m.title, status: m.status, dueDate: m.dueDate }; });

  // ---- Readiness ----
  var checks = [
    Boolean(profile.targetRole),
    companies.length > 0,
    skills.length > 0,
    milestones.length > 0
  ];
  var completeness = (checks.filter(Boolean).length / checks.length) * 100;
  var skillStrength = (averageLevel / 5) * 100;
  var milestoneProgress = completionPercent;
  var score = 0.2 * completeness + 0.4 * skillStrength + 0.4 * milestoneProgress;

  return {
    targetRole: profile.targetRole || '',
    targetCompanies: companies,
    skills: {
      total: skills.length,
      averageLevel: round(averageLevel, 2),
      byCategory: byCategory,
      topSkills: topSkills,
      growthAreas: growthAreas
    },
    milestones: {
      total: milestones.length,
      done: done,
      inProgress: inProgress,
      planned: planned,
      completionPercent: round(completionPercent, 1),
      overdue: overdue,
      upcoming: upcoming
    },
    readiness: {
      score: Math.round(score),
      breakdown: {
        completeness: round(completeness, 1),
        skillStrength: round(skillStrength, 1),
        milestoneProgress: round(milestoneProgress, 1)
      }
    }
  };
}

module.exports = { computeDashboard };

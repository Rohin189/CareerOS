const { extractSkills, matchSkillName } = require('./skillExtractor');
const { snapshotStatus } = require('./evidenceService');

// Declared levels at or below this count as weak, matching the dashboard's growth areas
var WEAK_MAX_LEVEL = 2;
var STATUS_ORDER = { missing: 0, weak: 1, covered: 2 };

function round(value, decimals) {
  var factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

// Pure: demand across the user's postings compared with declared skills and GitHub languages
function computeJobGap(profile, postings, snapshot) {
  postings = postings || [];
  if (postings.length === 0) {
    return { status: 'no-postings', totalPostings: 0 };
  }

  // Demand: number of postings mentioning each dictionary skill
  var demand = {};
  postings.forEach(function (p) {
    extractSkills(p.text).forEach(function (s) {
      if (!demand[s.name]) {
        demand[s.name] = { name: s.name, category: s.category, postings: 0 };
      }
      demand[s.name].postings += 1;
    });
  });

  // Declared skills keyed by dictionary name; the highest level wins if declared twice
  var declared = {};
  var unmatchedDeclared = [];
  (profile.skills || []).forEach(function (s) {
    var match = matchSkillName(s.name);
    if (!match) {
      unmatchedDeclared.push(s.name);
      return;
    }
    if (!declared[match.name] || s.level > declared[match.name].level) {
      declared[match.name] = { declaredAs: s.name, level: s.level };
    }
  });

  // GitHub languages as dictionary names, only when the snapshot belongs to the current username
  var githubReady = snapshotStatus(profile, snapshot) === 'ready';
  var onGitHub = {};
  if (githubReady) {
    (snapshot.languages || []).forEach(function (l) {
      var match = matchSkillName(l.name);
      if (match) onGitHub[match.name] = true;
    });
  }

  var skills = Object.keys(demand).map(function (name) {
    var d = demand[name];
    var mine = declared[name];

    var status = !mine ? 'missing' : mine.level <= WEAK_MAX_LEVEL ? 'weak' : 'covered';

    var github;
    if (!githubReady) github = 'unavailable';
    else if (onGitHub[name]) github = 'evidenced';
    else if (d.category === 'language') github = 'none';
    else github = 'not-measurable';

    return {
      name: name,
      category: d.category,
      postings: d.postings,
      demandPercent: round((d.postings / postings.length) * 100, 1),
      status: status,
      level: mine ? mine.level : null,
      declaredAs: mine ? mine.declaredAs : null,
      github: github
    };
  });

  // Most demanded first; within equal demand, the biggest gaps first
  skills.sort(function (a, b) {
    return b.postings - a.postings || STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || a.name.localeCompare(b.name);
  });

  var counts = { missing: 0, weak: 0, covered: 0 };
  skills.forEach(function (s) { counts[s.status] += 1; });

  // Recognised skills no posting asks for. Unrecognised ones are kept apart: the dictionary
  // cannot detect them in postings, so "not requested" would be misleading for them.
  var unrequested = Object.keys(declared)
    .filter(function (name) { return !demand[name]; })
    .map(function (name) { return declared[name].declaredAs; });

  return {
    status: 'ready',
    totalPostings: postings.length,
    counts: counts,
    skills: skills,
    unrequestedSkills: unrequested,
    unrecognisedSkills: unmatchedDeclared
  };
}

module.exports = { computeJobGap };

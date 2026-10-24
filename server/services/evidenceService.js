// Pure comparison of declared skills against a GitHub snapshot's languages.
// Language bytes can only evidence languages; frameworks and tools are reported as not measurable.

// Languages below this share of total bytes are treated as noise when listing undeclared ones
var UNDECLARED_MIN_SHARE = 1;

// Common short forms, keyed and valued in normalised form (see normalise)
var ALIASES = {
  js: 'javascript',
  ts: 'typescript',
  py: 'python',
  python3: 'python',
  golang: 'go',
  cpp: 'c++',
  csharp: 'c#',
  docker: 'dockerfile',
  html5: 'html',
  css3: 'css',
  bash: 'shell',
  sh: 'shell',
  jupyter: 'jupyternotebook'
};

function round(value, decimals) {
  var factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

function normalise(name) {
  return String(name || '').toLowerCase().replace(/[\s._-]/g, '');
}

function canonical(name) {
  var key = normalise(name);
  return ALIASES[key] || key;
}

function computeGitHubEvidence(profile, snapshot) {
  var username = profile.githubUsername || '';
  if (!username) {
    return { status: 'no-username' };
  }
  if (!snapshot) {
    return { status: 'not-fetched' };
  }
  if (snapshot.username.toLowerCase() !== username.toLowerCase()) {
    return { status: 'stale' };
  }

  var languages = snapshot.languages || [];
  var ownRepos = (snapshot.repos || []).filter(function (r) { return !r.isFork; });
  var totalBytes = languages.reduce(function (sum, l) { return sum + l.bytes; }, 0);

  var byKey = {};
  languages.forEach(function (l) { byKey[canonical(l.name)] = l; });

  var matched = {};
  var skills = (profile.skills || []).map(function (s) {
    var key = canonical(s.name);
    var lang = byKey[key];
    var base = { name: s.name, category: s.category, level: s.level };

    if (lang) {
      matched[key] = true;
      base.status = 'evidenced';
      base.language = lang.name;
      base.share = totalBytes ? round((lang.bytes / totalBytes) * 100, 1) : 0;
      base.repoCount = ownRepos.filter(function (r) { return canonical(r.language) === key; }).length;
    } else {
      base.status = s.category === 'language' ? 'no-evidence' : 'not-measurable';
    }
    return base;
  });

  var undeclaredLanguages = languages
    .filter(function (l) { return !matched[canonical(l.name)]; })
    .map(function (l) {
      return { name: l.name, share: totalBytes ? round((l.bytes / totalBytes) * 100, 1) : 0 };
    })
    .filter(function (l) { return l.share >= UNDECLARED_MIN_SHARE; });

  return {
    status: 'ready',
    fetchedAt: snapshot.fetchedAt,
    skills: skills,
    undeclaredLanguages: undeclaredLanguages
  };
}

module.exports = { computeGitHubEvidence };

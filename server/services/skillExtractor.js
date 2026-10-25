const { SKILLS } = require('./skillDictionary');

// A term must not touch a letter, digit, '+' or '#', or a dot joined to a letter ("Node.js").
// A sentence-ending full stop is still allowed after the term.
var BEFORE = '(?<![A-Za-z0-9+#]|[A-Za-z0-9]\\.)';
var AFTER = '(?![A-Za-z0-9+#]|\\.[A-Za-z0-9])';

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
}

function buildRegExp(terms, flags) {
  if (!terms || !terms.length) return null;
  var body = terms.map(escapeRegExp).join('|');
  return new RegExp(BEFORE + '(?:' + body + ')' + AFTER, flags);
}

// Compiled once at load: `patterns` match case-insensitively, `exact` case-sensitively
var MATCHERS = SKILLS.map(function (s) {
  return {
    name: s.name,
    category: s.category,
    loose: buildRegExp(s.patterns, 'i'),
    strict: buildRegExp(s.exact, '')
  };
});

function normaliseName(name) {
  return String(name || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

// Every spelling of every skill, case-insensitive: a bare skill name has no sentence around it,
// so "react" can safely mean React here even though job text requires "React"
var NAME_INDEX = {};
SKILLS.forEach(function (s) {
  [s.name].concat(s.patterns || [], s.exact || []).forEach(function (term) {
    NAME_INDEX[normaliseName(term)] = { name: s.name, category: s.category };
  });
});

// Maps a declared skill or GitHub language name to its dictionary skill, or null
function matchSkillName(name) {
  return NAME_INDEX[normaliseName(name)] || null;
}

// Returns the dictionary skills mentioned in text, in dictionary order
function extractSkills(text) {
  var source = String(text || '');
  return MATCHERS
    .filter(function (m) {
      return (m.loose && m.loose.test(source)) || (m.strict && m.strict.test(source));
    })
    .map(function (m) { return { name: m.name, category: m.category }; });
}

module.exports = { extractSkills, matchSkillName };

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

// Returns the dictionary skills mentioned in text, in dictionary order
function extractSkills(text) {
  var source = String(text || '');
  return MATCHERS
    .filter(function (m) {
      return (m.loose && m.loose.test(source)) || (m.strict && m.strict.test(source));
    })
    .map(function (m) { return { name: m.name, category: m.category }; });
}

module.exports = { extractSkills };

// Skills recognised in job descriptions. `patterns` are lowercase spellings matched as whole terms.
// `exact` spellings are matched case-sensitively, for terms that are also everyday words
// ("react to", "the rest of", "express interest"). Categories use the CareerProfile skill enum.
// Ambiguous words ("go", "c", "r") are deliberately omitted or replaced with an unambiguous
// spelling, trading a few misses for far fewer false matches.

var SKILLS = [
  // Languages
  { name: 'JavaScript', category: 'language', patterns: ['javascript', 'js', 'ecmascript'] },
  { name: 'TypeScript', category: 'language', patterns: ['typescript', 'ts'] },
  { name: 'Python', category: 'language', patterns: ['python', 'python3'] },
  { name: 'Java', category: 'language', patterns: ['java'] },
  { name: 'C++', category: 'language', patterns: ['c++', 'cpp'] },
  { name: 'C#', category: 'language', patterns: ['c#', 'csharp'] },
  { name: 'Go', category: 'language', patterns: ['golang'] },
  { name: 'Rust', category: 'language', patterns: ['rust'] },
  { name: 'Kotlin', category: 'language', patterns: ['kotlin'] },
  { name: 'Swift', category: 'language', patterns: [], exact: ['Swift'] },
  { name: 'PHP', category: 'language', patterns: ['php'] },
  { name: 'Ruby', category: 'language', patterns: ['ruby'] },
  { name: 'Scala', category: 'language', patterns: ['scala'] },
  { name: 'SQL', category: 'language', patterns: ['sql'] },
  { name: 'HTML', category: 'language', patterns: ['html', 'html5'] },
  { name: 'CSS', category: 'language', patterns: ['css', 'css3'] },
  { name: 'Shell', category: 'language', patterns: ['bash', 'shell scripting'] },

  // Frameworks and libraries
  { name: 'React', category: 'framework', patterns: ['reactjs', 'react.js'], exact: ['React'] },
  { name: 'Angular', category: 'framework', patterns: ['angular'] },
  { name: 'Vue', category: 'framework', patterns: ['vue', 'vuejs', 'vue.js'] },
  { name: 'Next.js', category: 'framework', patterns: ['next.js', 'nextjs'] },
  { name: 'Node.js', category: 'framework', patterns: ['node.js', 'nodejs'], exact: ['Node'] },
  { name: 'Express', category: 'framework', patterns: ['express.js', 'expressjs'], exact: ['Express'] },
  { name: 'Django', category: 'framework', patterns: ['django'] },
  { name: 'Flask', category: 'framework', patterns: ['flask'] },
  { name: 'FastAPI', category: 'framework', patterns: ['fastapi'] },
  { name: 'Spring', category: 'framework', patterns: ['spring boot', 'spring framework', 'spring mvc'] },
  { name: '.NET', category: 'framework', patterns: ['.net', 'dotnet', 'asp.net'] },
  { name: 'TensorFlow', category: 'framework', patterns: ['tensorflow'] },
  { name: 'PyTorch', category: 'framework', patterns: ['pytorch'] },
  { name: 'scikit-learn', category: 'framework', patterns: ['scikit-learn', 'sklearn'] },
  { name: 'pandas', category: 'framework', patterns: ['pandas'] },
  { name: 'NumPy', category: 'framework', patterns: ['numpy'] },

  // Tools, platforms, databases
  { name: 'Git', category: 'tool', patterns: ['git'] },
  { name: 'Docker', category: 'tool', patterns: ['docker'] },
  { name: 'Kubernetes', category: 'tool', patterns: ['kubernetes', 'k8s'] },
  { name: 'AWS', category: 'tool', patterns: ['aws', 'amazon web services'] },
  { name: 'Azure', category: 'tool', patterns: ['azure'] },
  { name: 'GCP', category: 'tool', patterns: ['gcp', 'google cloud'] },
  { name: 'Linux', category: 'tool', patterns: ['linux'] },
  { name: 'CI/CD', category: 'tool', patterns: ['ci/cd', 'continuous integration', 'github actions', 'jenkins'] },
  { name: 'Terraform', category: 'tool', patterns: ['terraform'] },
  { name: 'MongoDB', category: 'tool', patterns: ['mongodb', 'mongo'] },
  { name: 'PostgreSQL', category: 'tool', patterns: ['postgresql', 'postgres'] },
  { name: 'MySQL', category: 'tool', patterns: ['mysql'] },
  { name: 'Redis', category: 'tool', patterns: ['redis'] },
  { name: 'Kafka', category: 'tool', patterns: ['kafka'] },
  { name: 'GraphQL', category: 'tool', patterns: ['graphql'] },
  { name: 'REST APIs', category: 'tool', patterns: ['restful', 'rest api', 'rest apis'], exact: ['REST'] },

  // CS fundamentals
  { name: 'Data structures', category: 'cs-fundamentals', patterns: ['data structures'] },
  { name: 'Algorithms', category: 'cs-fundamentals', patterns: ['algorithms'] },
  { name: 'System design', category: 'cs-fundamentals', patterns: ['system design', 'distributed systems'] },
  { name: 'OOP', category: 'cs-fundamentals', patterns: ['oop', 'object-oriented', 'object oriented'] },
  { name: 'Machine learning', category: 'cs-fundamentals', patterns: ['machine learning', 'ml'] },
  { name: 'Deep learning', category: 'cs-fundamentals', patterns: ['deep learning'] },
  { name: 'NLP', category: 'cs-fundamentals', patterns: ['nlp', 'natural language processing'] },
  {
    name: 'Testing',
    category: 'cs-fundamentals',
    patterns: ['unit testing', 'unit tests', 'integration tests', 'test-driven', 'tdd', 'automated testing',
      'jest', 'mocha', 'pytest', 'junit', 'cypress', 'playwright']
  },
  { name: 'Agile', category: 'other', patterns: ['agile', 'scrum', 'kanban'] },

  // Soft skills
  { name: 'Communication', category: 'soft-skill', patterns: ['communication', 'communicate', 'communicating'] },
  { name: 'Problem solving', category: 'soft-skill', patterns: ['problem-solving', 'problem solving', 'problem solver'] },
  { name: 'Teamwork', category: 'soft-skill', patterns: ['teamwork', 'collaboration', 'collaborative'] },
  { name: 'Leadership', category: 'soft-skill', patterns: ['leadership', 'mentoring', 'mentorship'] }
];

module.exports = { SKILLS };

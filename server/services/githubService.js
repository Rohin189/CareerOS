const GitHubSnapshot = require('../models/GitHubSnapshot');

var API_URL = 'https://api.github.com';
// Each repo's language breakdown costs one request, so only the most recent ones are sampled
var MAX_LANGUAGE_REPOS = 30;

function githubError(status, message) {
  var err = new Error(message);
  err.status = status;
  return err;
}

async function githubGet(path) {
  var headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'CareerOS',
    'X-GitHub-Api-Version': '2022-11-28'
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = 'Bearer ' + process.env.GITHUB_TOKEN;
  }

  var res = await fetch(API_URL + path, { headers: headers });

  if (res.status === 404) {
    throw githubError(404, 'GitHub user not found');
  }
  if (res.status === 401) {
    throw githubError(502, 'GitHub rejected the server token, check GITHUB_TOKEN');
  }
  if ((res.status === 403 || res.status === 429) && res.headers.get('x-ratelimit-remaining') === '0') {
    throw githubError(429, 'GitHub rate limit reached, try again later');
  }
  if (!res.ok) {
    throw githubError(502, 'GitHub API error: ' + res.status);
  }
  return res.json();
}

async function fetchGitHubData(username) {
  var name = encodeURIComponent(username);

  var account = await githubGet('/users/' + name);
  var repos = await githubGet('/users/' + name + '/repos?type=owner&sort=pushed&per_page=100');

  // Forks mostly contain other people's code, so they are excluded from language totals
  var sampled = repos.filter(function (r) { return !r.fork; }).slice(0, MAX_LANGUAGE_REPOS);
  // Sequential on purpose: GitHub penalises bursts of concurrent requests
  var languageMaps = [];
  for (var i = 0; i < sampled.length; i++) {
    languageMaps.push(await githubGet('/repos/' + name + '/' + encodeURIComponent(sampled[i].name) + '/languages'));
  }

  var totals = {};
  languageMaps.forEach(function (map) {
    Object.keys(map).forEach(function (lang) {
      totals[lang] = (totals[lang] || 0) + map[lang];
    });
  });
  var languages = Object.keys(totals)
    .map(function (lang) { return { name: lang, bytes: totals[lang] }; })
    .sort(function (a, b) { return b.bytes - a.bytes; });

  return {
    account: {
      publicRepos: account.public_repos,
      followers: account.followers,
      createdAt: account.created_at
    },
    repos: repos.map(function (r) {
      return {
        name: r.name,
        description: r.description || '',
        language: r.language || '',
        stars: r.stargazers_count,
        forks: r.forks_count,
        isFork: r.fork,
        pushedAt: r.pushed_at
      };
    }),
    languages: languages
  };
}

// Fetch fresh data for username and replace the user's cached snapshot
async function refreshSnapshot(userId, username) {
  var data = await fetchGitHubData(username);

  return GitHubSnapshot.findOneAndUpdate(
    { user: userId },
    {
      $set: {
        username: username,
        fetchedAt: new Date(),
        account: data.account,
        repos: data.repos,
        languages: data.languages
      }
    },
    { new: true, upsert: true, runValidators: true }
  );
}

module.exports = { fetchGitHubData, refreshSnapshot };

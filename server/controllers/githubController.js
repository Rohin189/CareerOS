const CareerProfile = require('../models/CareerProfile');
const GitHubSnapshot = require('../models/GitHubSnapshot');
const { refreshSnapshot } = require('../services/githubService');

// GET /api/github - cached snapshot only; never calls the GitHub API
const getGitHub = async (req, res) => {
  try {
    const profile = await CareerProfile.findOne({ user: req.user._id }).lean();
    const username = profile ? profile.githubUsername || '' : '';
    const snapshot = await GitHubSnapshot.findOne({ user: req.user._id }).lean();

    const stale = !snapshot || snapshot.username.toLowerCase() !== username.toLowerCase();

    res.status(200).json({ username: username, stale: stale, snapshot: snapshot });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load GitHub data', error: err.message });
  }
};

// POST /api/github/refresh - fetch from GitHub for the username saved on the profile
const refreshGitHub = async (req, res) => {
  try {
    const profile = await CareerProfile.findOne({ user: req.user._id }).lean();
    if (!profile || !profile.githubUsername) {
      return res.status(400).json({ message: 'Set a GitHub username on your profile first' });
    }

    const snapshot = await refreshSnapshot(req.user._id, profile.githubUsername);
    res.status(200).json({ username: profile.githubUsername, stale: false, snapshot: snapshot });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

module.exports = { getGitHub, refreshGitHub };

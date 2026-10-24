const CareerProfile = require('../models/CareerProfile');
const GitHubSnapshot = require('../models/GitHubSnapshot');
const { computeDashboard } = require('../services/dashboardService');
const { computeGitHubEvidence } = require('../services/evidenceService');

// GET /api/career/dashboard - derived summary of the user's career profile
const getDashboard = async (req, res) => {
  try {
    const profile = await CareerProfile.findOneAndUpdate(
      { user: req.user._id },
      { $setOnInsert: { user: req.user._id } },
      { new: true, upsert: true }
    ).lean();
    const snapshot = await GitHubSnapshot.findOne({ user: req.user._id }).lean();

    // Evidence sits alongside the summary; it does not feed the readiness score
    const summary = computeDashboard(profile);
    summary.githubEvidence = computeGitHubEvidence(profile, snapshot);

    res.status(200).json(summary);
  } catch (err) {
    res.status(500).json({ message: 'Failed to build dashboard', error: err.message });
  }
};

module.exports = { getDashboard };

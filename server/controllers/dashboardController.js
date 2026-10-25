const CareerProfile = require('../models/CareerProfile');
const GitHubSnapshot = require('../models/GitHubSnapshot');
const JobPosting = require('../models/JobPosting');
const { computeDashboard } = require('../services/dashboardService');
const { computeGitHubEvidence } = require('../services/evidenceService');
const { computeJobGap } = require('../services/gapService');

// GET /api/career/dashboard - derived summary of the user's career profile
const getDashboard = async (req, res) => {
  try {
    const profile = await CareerProfile.findOneAndUpdate(
      { user: req.user._id },
      { $setOnInsert: { user: req.user._id } },
      { new: true, upsert: true }
    ).lean();
    const snapshot = await GitHubSnapshot.findOne({ user: req.user._id }).lean();
    const postings = await JobPosting.find({ user: req.user._id }).select('text').lean();

    // Evidence and job gap sit alongside the summary; neither feeds the readiness score
    const summary = computeDashboard(profile);
    summary.githubEvidence = computeGitHubEvidence(profile, snapshot);
    summary.jobGap = computeJobGap(profile, postings, snapshot);

    res.status(200).json(summary);
  } catch (err) {
    res.status(500).json({ message: 'Failed to build dashboard', error: err.message });
  }
};

module.exports = { getDashboard };

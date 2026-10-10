const CareerProfile = require('../models/CareerProfile');
const { computeDashboard } = require('../services/dashboardService');

// GET /api/career/dashboard - derived summary of the user's career profile
const getDashboard = async (req, res) => {
  try {
    const profile = await CareerProfile.findOneAndUpdate(
      { user: req.user._id },
      { $setOnInsert: { user: req.user._id } },
      { new: true, upsert: true }
    ).lean();

    res.status(200).json(computeDashboard(profile));
  } catch (err) {
    res.status(500).json({ message: 'Failed to build dashboard', error: err.message });
  }
};

module.exports = { getDashboard };

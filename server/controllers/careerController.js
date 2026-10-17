const CareerProfile = require('../models/CareerProfile');

const ALLOWED_FIELDS = ['targetRole', 'targetCompanies', 'githubUsername', 'skills', 'milestones'];

// GET /api/career - return the profile, creating an empty one on first access
const getCareerProfile = async (req, res) => {
  try {
    const profile = await CareerProfile.findOneAndUpdate(
      { user: req.user._id },
      { $setOnInsert: { user: req.user._id } },
      { new: true, upsert: true }
    );
    res.status(200).json(profile);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load career profile', error: err.message });
  }
};

// PUT /api/career - update whitelisted fields only
const updateCareerProfile = async (req, res) => {
  try {
    const updates = {};
    ALLOWED_FIELDS.forEach(function (field) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const profile = await CareerProfile.findOneAndUpdate(
      { user: req.user._id },
      { $set: updates, $setOnInsert: { user: req.user._id } },
      { new: true, upsert: true, runValidators: true }
    );
    res.status(200).json(profile);
  } catch (err) {
    // Surface schema validator messages (e.g. 'Invalid GitHub username') so the client can show them
    const message = err.name === 'ValidationError'
      ? Object.values(err.errors).map(function (e) { return e.message; }).join('; ')
      : 'Failed to update career profile';
    res.status(400).json({ message: message, error: err.message });
  }
};

module.exports = { getCareerProfile, updateCareerProfile };

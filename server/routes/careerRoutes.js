const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getCareerProfile, updateCareerProfile } = require('../controllers/careerController');
const { getDashboard } = require('../controllers/dashboardController');

const router = express.Router();

router.get('/', protect, getCareerProfile);
router.put('/', protect, updateCareerProfile);
router.get('/dashboard', protect, getDashboard);

module.exports = router;

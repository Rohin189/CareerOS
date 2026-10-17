const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getGitHub, refreshGitHub } = require('../controllers/githubController');

const router = express.Router();

router.get('/', protect, getGitHub);
router.post('/refresh', protect, refreshGitHub);

module.exports = router;

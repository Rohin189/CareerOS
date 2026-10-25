const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getJobs, addJob, removeJob } = require('../controllers/jobController');

const router = express.Router();

router.get('/', protect, getJobs);
router.post('/', protect, addJob);
router.delete('/:id', protect, removeJob);

module.exports = router;

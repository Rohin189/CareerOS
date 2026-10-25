const { listPostings, createPosting, deletePosting } = require('../services/jobService');

// GET /api/jobs - the user's saved postings, newest first, with extracted skills
const getJobs = async (req, res) => {
  try {
    const postings = await listPostings(req.user._id);
    res.status(200).json(postings);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load job postings', error: err.message });
  }
};

// POST /api/jobs - save a job description (title, company, text)
const addJob = async (req, res) => {
  try {
    const posting = await createPosting(req.user._id, req.body || {});
    res.status(201).json(posting);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const message = Object.values(err.errors).map(function (e) { return e.message; }).join('; ');
      return res.status(400).json({ message: message });
    }
    res.status(err.status || 500).json({ message: err.message });
  }
};

// DELETE /api/jobs/:id - remove one of the user's postings
const removeJob = async (req, res) => {
  try {
    await deletePosting(req.user._id, req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

module.exports = { getJobs, addJob, removeJob };

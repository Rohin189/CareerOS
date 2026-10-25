const mongoose = require('mongoose');
const JobPosting = require('../models/JobPosting');
const { extractSkills } = require('./skillExtractor');

var MAX_POSTINGS_PER_USER = 50;
var ALLOWED_FIELDS = ['title', 'company', 'text'];

function jobError(status, message) {
  var err = new Error(message);
  err.status = status;
  return err;
}

// Attach skills extracted from the current dictionary; they are never stored
function withSkills(posting) {
  return {
    _id: posting._id,
    title: posting.title,
    company: posting.company,
    text: posting.text,
    createdAt: posting.createdAt,
    updatedAt: posting.updatedAt,
    skills: extractSkills(posting.text)
  };
}

async function listPostings(userId) {
  var postings = await JobPosting.find({ user: userId }).sort({ createdAt: -1 }).lean();
  return postings.map(withSkills);
}

async function createPosting(userId, body) {
  var count = await JobPosting.countDocuments({ user: userId });
  if (count >= MAX_POSTINGS_PER_USER) {
    throw jobError(400, 'You can save up to ' + MAX_POSTINGS_PER_USER + ' job postings. Delete one first.');
  }

  var data = { user: userId };
  ALLOWED_FIELDS.forEach(function (field) {
    if (body[field] !== undefined) {
      data[field] = body[field];
    }
  });

  var posting = await JobPosting.create(data);
  return withSkills(posting);
}

// Filtering by user as well as id means another user's posting is simply not found
async function deletePosting(userId, postingId) {
  if (!mongoose.isValidObjectId(postingId)) {
    throw jobError(404, 'Job posting not found');
  }
  var deleted = await JobPosting.findOneAndDelete({ _id: postingId, user: userId });
  if (!deleted) {
    throw jobError(404, 'Job posting not found');
  }
}

module.exports = { listPostings, createPosting, deletePosting };

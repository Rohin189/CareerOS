const mongoose = require('mongoose');

// A job description saved by the user. Skills are extracted from `text` on read, not stored,
// so improvements to the skill dictionary apply to every saved posting.
const jobPostingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    company: { type: String, trim: true, default: '', maxlength: 200 },
    text: { type: String, required: true, maxlength: 20000 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('JobPosting', jobPostingSchema);

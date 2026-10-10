const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: ['language', 'framework', 'tool', 'cs-fundamentals', 'soft-skill', 'other'],
    default: 'other'
  },
  level: { type: Number, min: 1, max: 5, default: 1 }
});

const milestoneSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  status: {
    type: String,
    enum: ['planned', 'in-progress', 'done'],
    default: 'planned'
  },
  dueDate: { type: Date }
});

const careerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    targetRole: { type: String, trim: true, default: '' },
    targetCompanies: [{ type: String, trim: true }],
    skills: [skillSchema],
    milestones: [milestoneSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model('CareerProfile', careerProfileSchema);

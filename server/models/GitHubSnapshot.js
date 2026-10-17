const mongoose = require('mongoose');

const repoSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    language: { type: String, default: '' },
    stars: { type: Number, default: 0 },
    forks: { type: Number, default: 0 },
    isFork: { type: Boolean, default: false },
    pushedAt: { type: Date }
  },
  { _id: false }
);

const languageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    bytes: { type: Number, default: 0 }
  },
  { _id: false }
);

// Cached GitHub data for one user. Regenerated from the API, never edited by the client.
const gitHubSnapshotSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    // Username this snapshot was fetched for; a mismatch with the profile means it is stale
    username: { type: String, required: true, trim: true },
    fetchedAt: { type: Date, required: true },
    account: {
      publicRepos: { type: Number, default: 0 },
      followers: { type: Number, default: 0 },
      createdAt: { type: Date }
    },
    repos: [repoSchema],
    languages: [languageSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model('GitHubSnapshot', gitHubSnapshotSchema);

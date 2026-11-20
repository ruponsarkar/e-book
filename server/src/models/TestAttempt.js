const mongoose = require('mongoose');

// One row per sitting of a test paper.
// in_progress: answers saved as the student works (at most one per user and paper).
// submitted:   graded by the server; kept as history.
const testAttemptSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bookSlug: { type: String, required: true },
    sectionKey: { type: String, required: true },
    status: { type: String, enum: ['in_progress', 'submitted'], default: 'in_progress' },
    answers: { type: Map, of: String, default: {} },
    total: { type: Number, default: 0 },
    correct: { type: Number, default: 0 },
    wrong: { type: Number, default: 0 },
    skipped: { type: Number, default: 0 },
    percent: { type: Number, default: 0 },
    submittedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

testAttemptSchema.index({ userId: 1, bookSlug: 1, sectionKey: 1, status: 1 });
testAttemptSchema.index({ userId: 1, submittedAt: -1 });
testAttemptSchema.index(
  { userId: 1, bookSlug: 1, sectionKey: 1 },
  { unique: true, partialFilterExpression: { status: 'in_progress' }, name: 'one_draft_per_paper' }
);

module.exports = mongoose.model('TestAttempt', testAttemptSchema);

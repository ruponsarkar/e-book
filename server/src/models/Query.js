const mongoose = require('mongoose');

// A question or problem a student sends from the app, with the conversation that follows.
const messageSchema = new mongoose.Schema(
  {
    from: { type: String, enum: ['student', 'admin'], required: true },
    text: { type: String, required: true },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const querySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    category: { type: String, enum: ['problem', 'content', 'account', 'suggestion', 'other'], default: 'other' },
    subject: { type: String, required: true },
    messages: { type: [messageSchema], default: [] },
    // open: waiting for the admin · answered: admin replied last · closed: done
    status: { type: String, enum: ['open', 'answered', 'closed'], default: 'open', index: true },
    // Where the student was when they wrote it, to help reproduce problems.
    context: {
      bookSlug: { type: String, default: '' },
      sectionKey: { type: String, default: '' },
      appVersion: { type: String, default: '' },
      device: { type: String, default: '' },
    },
    studentUnread: { type: Boolean, default: false }, // a reply the student hasn't opened yet
  },
  { timestamps: true }
);

module.exports = mongoose.model('Query', querySchema);

const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    edition: { type: String, default: '' },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// One section = one tab of the book (front matter, a chapter, a test paper).
const sectionSchema = new mongoose.Schema(
  {
    bookSlug: { type: String, required: true, index: true },
    order: { type: Number, required: true },
    key: { type: String, required: true },
    title: { type: String, required: true },
    kind: { type: String, enum: ['front', 'chapter', 'test'], default: 'chapter' },
    markdown: { type: String, required: true },
    // Content fingerprint; the app re-downloads a section only when this changes.
    hash: { type: String, default: '' },
  },
  { timestamps: true }
);
sectionSchema.index({ bookSlug: 1, key: 1 }, { unique: true });

const screenshotEventSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bookSlug: String,
    sectionKey: String,
    platform: String,
  },
  { timestamps: true }
);

module.exports = {
  Book: mongoose.model('Book', bookSchema),
  Section: mongoose.model('Section', sectionSchema),
  ScreenshotEvent: mongoose.model('ScreenshotEvent', screenshotEventSchema),
};

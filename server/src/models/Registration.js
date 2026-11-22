const mongoose = require('mongoose');

// A sign-up from the website. Once paid, the admin creates the app account
// and sends the login details (the registration is then "fulfilled").
const registrationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true, index: true },
    district: { type: String, default: '' },
    exams: { type: [String], default: [] },

    amount: { type: Number, required: true }, // paise
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending', index: true },
    orderId: { type: String, index: true, sparse: true },
    paymentId: { type: String, default: '' },
    method: { type: String, default: '' }, // upi, card, netbanking … (from Razorpay)
    paidAt: { type: Date, default: null },
    paidVia: { type: String, enum: ['', 'checkout', 'webhook', 'manual'], default: '' },

    fulfilled: { type: Boolean, default: false, index: true },
    fulfilledAt: { type: Date, default: null },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    adminNote: { type: String, default: '' },

    ip: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    source: { type: String, default: '' }, // utm_source or referrer, if any
  },
  { timestamps: true }
);
registrationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Registration', registrationSchema);

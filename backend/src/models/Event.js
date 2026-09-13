const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 1, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    dateTime: { type: Date, required: true, index: true },
    location: { type: String, required: true, trim: true, maxlength: 300 },
    capacity: { type: Number, required: true, min: 1 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    registrationCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

eventSchema.virtual('status').get(function status() {
  return this.dateTime.getTime() < Date.now() ? 'past' : 'upcoming';
});

eventSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);

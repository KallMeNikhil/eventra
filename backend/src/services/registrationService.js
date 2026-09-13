const mongoose = require('mongoose');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const ApiError = require('../utils/ApiError');

async function registerForEvent({ userId, eventId }) {
  const session = await mongoose.startSession();
  try {
    let registration;
    await session.withTransaction(async () => {
      const event = await Event.findById(eventId).session(session);
      if (!event) {
        throw new ApiError(404, 'Event not found');
      }

      const updatedEvent = await Event.findOneAndUpdate(
        { _id: eventId, $expr: { $lt: ['$registrationCount', '$capacity'] } },
        { $inc: { registrationCount: 1 } },
        { new: true, session }
      );

      if (!updatedEvent) {
        throw new ApiError(409, 'Event is at full capacity');
      }

      try {
        const created = await Registration.create([{ user: userId, event: eventId }], { session });
        registration = created[0];
      } catch (err) {
        if (err.code === 11000) {
          throw new ApiError(409, 'You are already registered for this event');
        }
        throw err;
      }
    });
    return registration;
  } finally {
    await session.endSession();
  }
}

async function cancelRegistration({ userId, eventId }) {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const registration = await Registration.findOneAndDelete(
        { user: userId, event: eventId },
        { session }
      );

      if (!registration) {
        throw new ApiError(404, 'Registration not found');
      }

      await Event.findOneAndUpdate(
        { _id: eventId, registrationCount: { $gt: 0 } },
        { $inc: { registrationCount: -1 } },
        { session }
      );
    });
  } finally {
    await session.endSession();
  }
}

async function listMyRegistrations(userId) {
  return Registration.find({ user: userId }).populate('event').sort({ createdAt: -1 });
}

module.exports = { registerForEvent, cancelRegistration, listMyRegistrations };

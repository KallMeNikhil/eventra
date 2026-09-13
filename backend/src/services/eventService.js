const mongoose = require('mongoose');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const ApiError = require('../utils/ApiError');

async function createEvent({ data, userId }) {
  const event = await Event.create({ ...data, createdBy: userId });
  return event;
}

async function listEvents({ page = 1, limit = 20, upcoming }) {
  const filter = {};
  if (upcoming === 'true') {
    filter.dateTime = { $gte: new Date() };
  } else if (upcoming === 'false') {
    filter.dateTime = { $lt: new Date() };
  }

  const skip = (page - 1) * limit;
  const [events, total] = await Promise.all([
    Event.find(filter).sort({ dateTime: 1 }).skip(skip).limit(limit).populate('createdBy', 'name'),
    Event.countDocuments(filter),
  ]);

  return {
    events,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

async function getEventById(id) {
  const event = await Event.findById(id).populate('createdBy', 'name');
  if (!event) {
    throw new ApiError(404, 'Event not found');
  }
  return event;
}

async function updateEvent({ id, userId, updates }) {
  const event = await Event.findById(id);
  if (!event) {
    throw new ApiError(404, 'Event not found');
  }
  if (String(event.createdBy) !== String(userId)) {
    throw new ApiError(403, 'Only the event owner can modify this event');
  }

  if (updates.capacity !== undefined && updates.capacity < event.registrationCount) {
    throw new ApiError(
      400,
      `Capacity cannot be reduced below the current registration count (${event.registrationCount})`
    );
  }

  Object.assign(event, updates);
  await event.save();
  return event;
}

async function deleteEvent({ id, userId }) {
  const event = await Event.findById(id);
  if (!event) {
    throw new ApiError(404, 'Event not found');
  }
  if (String(event.createdBy) !== String(userId)) {
    throw new ApiError(403, 'Only the event owner can delete this event');
  }

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await Registration.deleteMany({ event: id }, { session });
      await Event.deleteOne({ _id: id }, { session });
    });
  } finally {
    await session.endSession();
  }
}

module.exports = { createEvent, listEvents, getEventById, updateEvent, deleteEvent };

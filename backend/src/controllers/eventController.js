const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const eventService = require('../services/eventService');
const registrationService = require('../services/registrationService');
const { isValidObjectId } = require('../utils/objectId');

function assertValidId(id) {
  if (!isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid event id');
  }
}

const createEvent = asyncHandler(async (req, res) => {
  const data = { ...req.body, dateTime: new Date(req.body.dateTime) };
  const event = await eventService.createEvent({ data, userId: req.user.id });
  res.status(201).json({ event });
});

const listEvents = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  const upcoming = req.query.upcoming;
  const result = await eventService.listEvents({ page, limit, upcoming });
  res.status(200).json(result);
});

const getEvent = asyncHandler(async (req, res) => {
  assertValidId(req.params.id);
  const event = await eventService.getEventById(req.params.id);
  res.status(200).json({ event });
});

const updateEvent = asyncHandler(async (req, res) => {
  assertValidId(req.params.id);
  const updates = { ...req.body };
  if (updates.dateTime) {
    updates.dateTime = new Date(updates.dateTime);
  }
  const event = await eventService.updateEvent({ id: req.params.id, userId: req.user.id, updates });
  res.status(200).json({ event });
});

const deleteEvent = asyncHandler(async (req, res) => {
  assertValidId(req.params.id);
  await eventService.deleteEvent({ id: req.params.id, userId: req.user.id });
  res.status(204).send();
});

const registerForEvent = asyncHandler(async (req, res) => {
  assertValidId(req.params.id);
  const registration = await registrationService.registerForEvent({
    userId: req.user.id,
    eventId: req.params.id,
  });
  res.status(201).json({ registration });
});

const cancelRegistration = asyncHandler(async (req, res) => {
  assertValidId(req.params.id);
  await registrationService.cancelRegistration({ userId: req.user.id, eventId: req.params.id });
  res.status(204).send();
});

module.exports = {
  createEvent,
  listEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelRegistration,
};

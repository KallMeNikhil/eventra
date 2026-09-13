const express = require('express');
const { requireAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createEventSchema, updateEventSchema } = require('../validators/eventValidators');
const eventController = require('../controllers/eventController');

const router = express.Router();

router.get('/', eventController.listEvents);
router.get('/:id', eventController.getEvent);
router.post('/', requireAuth, validate(createEventSchema), eventController.createEvent);
router.patch('/:id', requireAuth, validate(updateEventSchema), eventController.updateEvent);
router.delete('/:id', requireAuth, eventController.deleteEvent);
router.post('/:id/register', requireAuth, eventController.registerForEvent);
router.delete('/:id/register', requireAuth, eventController.cancelRegistration);

module.exports = router;

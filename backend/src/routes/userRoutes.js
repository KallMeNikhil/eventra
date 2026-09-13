const express = require('express');
const { requireAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { updateProfileSchema } = require('../validators/userValidators');
const userController = require('../controllers/userController');

const router = express.Router();

router.get('/me', requireAuth, userController.getMe);
router.patch('/me', requireAuth, validate(updateProfileSchema), userController.updateMe);
router.get('/me/registrations', requireAuth, userController.getMyRegistrations);

module.exports = router;

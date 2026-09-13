const asyncHandler = require('../utils/asyncHandler');
const userService = require('../services/userService');
const registrationService = require('../services/registrationService');

const getMe = asyncHandler(async (req, res) => {
  const user = await userService.getProfile(req.user.id);
  res.status(200).json({ user });
});

const updateMe = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user.id, req.body);
  res.status(200).json({ user });
});

const getMyRegistrations = asyncHandler(async (req, res) => {
  const registrations = await registrationService.listMyRegistrations(req.user.id);
  res.status(200).json({ registrations });
});

module.exports = { getMe, updateMe, getMyRegistrations };

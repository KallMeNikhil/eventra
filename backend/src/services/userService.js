const User = require('../models/User');
const ApiError = require('../utils/ApiError');

async function getProfile(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return user;
}

async function updateProfile(userId, updates) {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  if (updates.name !== undefined) {
    user.name = updates.name;
  }
  await user.save();
  return user;
}

module.exports = { getProfile, updateProfile };

const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');

async function getUserDetailsFromToken(token) {
  try {
    if (!token) {
      throw new Error('No token provided');
    }

    // Verify the token and decode it
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Find the user by the decoded user ID
    const user = await UserModel.findById(decoded._id).select('-password'); // Exclude the password field

    if (!user) {
      throw new Error('User  not found');
    }

    return user;
  } catch (error) {
    throw new Error('Invalid token or user not found');
  }
}

module.exports = getUserDetailsFromToken;
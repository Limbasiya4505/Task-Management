const UserModel = require('../models/UserModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function login(req, res) {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email', error: true });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password', error: true });
    }

    // Generate a new JWT token after successful login
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1d' });

    // Store the token in the user's document in MongoDB
    user.token = token;
    await user.save(); // Save the updated user document  

    // Set the token in a cookie (for web-based apps)
    res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'lax' });

    // Check if the user is a specific admin for special redirection
    if (email === 'prakash@gmail.com' && password === 'prakash123') {
      return res.status(200).json({
        message: 'Login successful',
        redirectTo: '/TaskDashboard', // Redirect to TaskDashboard
        token,
        success: true,
      });
    }

    // For other users, redirect to TaskManager
    return res.status(200).json({
      message: 'Login successful',
      redirectTo: '/TaskManager',
      token,
      success: true,
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
    });
  }
}

module.exports = login;
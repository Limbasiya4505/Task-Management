const UserModel = require("../models/UserModel");
const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken'); // JWT import removed

// Login route
async function login(req, res) {
    const { email, password } = req.body;

    try {
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        // Token generation removed
        // const token = jwt.sign(
        //     { id: user._id },
        //     process.env.JWT_SECRET,
        //     { expiresIn: '24h' }
        // );

        res.status(200).json({ message: 'Login successful' });
    } catch (error) {
        console.error(error); 
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = login;
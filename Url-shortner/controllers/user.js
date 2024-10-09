const User = require('../models/user');
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing and verification
const { v4: uuidv4 } = require('uuid');
const { setuser } = require('../service/auth');

async function handleUserSignup(req, res) {
    try {
        const { name, email, password } = req.body;

        // Validate name length
        if (!name || name.length < 3 || name.length > 30) {
            return res.status(400).send('Name should be between 3 and 30 characters.');
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            return res.status(400).send('Please provide a valid email address.');
        }

        // Validate password length
        if (!password || password.length < 6) {
            return res.status(400).send('Password should have at least 6 characters.');
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send('Email is already registered.');
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword
        });

        console.log("User data saved");

        return res.redirect('/'); // Redirect to home or another page after signup
    } catch (error) {
        console.error('Error during signup:', error);
        return res.status(500).send('Internal server error');
    }
}

async function handleUserLogin(req, res) {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send('Invalid email or password.');
        }

        // Compare the provided password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send('Invalid email or password.');
        }

        // Generate a unique session ID and store the user in the session map
        const sessionId = uuidv4();
        setuser(sessionId, user);

        // Set the session ID as a cookie
        res.cookie("uid", sessionId, {
            httpOnly: true, // Helps prevent XSS attacks
            secure: true, // Should be true when using HTTPS
            sameSite: 'strict' // Prevents CSRF
        });

        return res.redirect('/'); // Successful login
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).send('Internal server error');
    }
}

module.exports = {
    handleUserSignup,
    handleUserLogin
};

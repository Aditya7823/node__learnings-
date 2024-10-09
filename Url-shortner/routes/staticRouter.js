const express = require('express');
const router = express.Router();

// Render the signup page
router.get('/signUp', (req, res) => {
    return res.render('signUp'); // Ensure the 'signUp.ejs' file exists in the views folder
});

// Render the login page
router.get('/login', (req, res) => {
    return res.render('login'); // Ensure the 'login.ejs' file exists in the views folder
});

// Render the home page (optional)
router.get('/', (req, res) => {
    res.render('home', { shortUrl: null, error: null });  // Adjust if you have a specific home page
});

module.exports = router;

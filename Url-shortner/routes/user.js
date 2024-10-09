const express = require('express');
const { handleUserSignup, handleUserLogin } = require('../controllers/user');

const router = express.Router();

// Define the POST route for user signup
router.post('/', handleUserSignup); // Make sure this is just `/` since you already mount this at `/user`

// Optional: Define the GET route for the signup page
router.get('/', (req, res) => {
    res.render('signUp'); // Adjust this to match your actual view name
});
router.get('/login',(req,res)=>{
    res.render('login');
})
// Define the POST route for user login
router.post('/login', handleUserLogin); // Handle login

module.exports = router;

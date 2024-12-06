const express = require('express');
const User = require('../models/user');
const Blog = require('../models/blog');
const router = express.Router();

router.get('/signin', (req, res) => {
    res.render("signin");
});

router.get('/signup', (req, res) => {
    res.render("signup");
});
router.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    try {
        const token = await User.matchPasswordAndGenerateToken(email, password);
        console.log("Token generated:", token);

        
        res.cookie("token", token, {
            httpOnly: true, // Secure the cookie from client-side JavaScript access
            maxAge: 60 * 60 * 1000 // Cookie expires in 1 hour
        });
        res.redirect("/"); // Redirect to home or the intended page
    } catch (error) {
        console.error("Error during signin:", error.message);
        return res.render("signin",{error  : "incorrect email or password ",});
    }
});
router.post('/signup', async (req, res) => {
    const { fullname, email, password } = req.body;

    try {
        // Create the user in the database
        const newUser = await User.create({
            fullname,
            email,
            password,
            role: "USER"
        });

        // Fetch all blogs
        const allBlogs = await Blog.find({}); 

        // Log a message for debugging
        console.log("Home route accessed");

        // Render the 'home' page, passing both the user and the blogs
        res.render("home", {
            user: newUser, // Pass the newly created user
            blogs: allBlogs // Pass the list of blogs
        });
    
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;










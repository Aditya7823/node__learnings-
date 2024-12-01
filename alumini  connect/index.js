require("dotenv").config();

const express = require('express');
const path = require('path');
const app = express();
const userRouter = require('./routes/user');
const blogRouter = require('./routes/blog');
const Blog = require('./models/blog'); // Correct import

const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { checkForAuthenticationCookie } = require('./middlewares/authentication');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, {})
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, 'views'));

// Middleware to make user available globally
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

// Serve static files
app.use(express.static('public'));

// Middleware to parse cookies
app.use(cookieParser());

// Authentication middleware
app.use(checkForAuthenticationCookie());



app.get('/landing', (req, res) => {
    res.render("landing");
});



// Home route
app.get('/', async (req, res) => {
    const { title } = req.query; // Extract 'title' from query parameters

    try {
        let allBlogs;

        if (title) {
            // Find all blogs and filter by title using JavaScript array filter
            allBlogs = await Blog.find({});
            allBlogs = allBlogs.filter(blog => blog.title.toLowerCase().includes(title.toLowerCase()));
            console.log(allBlogs);
        } else {
            // Fetch all blogs if no title search query is provided
            allBlogs = await Blog.find({});
        }

        console.log("Home route accessed with title:", title);
        res.render("home", {
            user: req.user,
            blogs: allBlogs, // Pass the filtered blogs to the home view
        });
    } catch (error) {
        console.error("Error fetching blogs:", error);
        res.status(500).send("An error occurred while loading the home page.");
    }
});









app.get('/logout', async (req, res) => {
    try {
        
        res.render("landing", {
           
        });
    } catch (error) {
        console.error("Error fetching blogs:", error);
        res.status(500).send("An error occurred while loading the home page.");
    }
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Use user router
app.use('/user', userRouter);
app.use('/blog', blogRouter);

// Start the server
const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log("Server has been started on port", port);
});

const express = require('express');
const path = require('path');
const app = express();
const userRouter = require('./routes/user');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { checkForAuthenticationCookie } = require('./middlewares/authentication');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/blogify', {
 
})
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.error("MongoDB connection error:", err));

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, 'views'));

// Serve static files
app.use(express.static('public'));

// Middleware to parse cookies
app.use(cookieParser());

// Authentication middleware
app.use(checkForAuthenticationCookie());

// Home route
app.get('/', (req, res) => {
    console.log("Home route accessed");
    res.render("home", {
      user: req.user,
    });
});

// Use user router
app.use('/user', userRouter);

// Start the server
const port = 8000;
app.listen(port, () => {
    console.log("Server has been started on port", port);
});

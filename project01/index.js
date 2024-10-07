const express = require('express');
const path = require('path');
const app = express();
const userRouter = require('./routes/user'); // Correct router name
const port = 8000;

const { connectMongoDb } = require('./connection'); // Fixed typo: require

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // To handle form submissions

// Connect to MongoDB
connectMongoDb()
    .then(() => {
        console.log("Connected to MongoDB"); // Changed the log message for clarity
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB:", error); // Log any connection errors
    });

// Middleware for logging
app.use((req, res, next) => {
    console.log("New middleware executed");
    next();
});

// User routes
app.use( userRouter); // Ensure the route is correct

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

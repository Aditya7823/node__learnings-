const express = require('express');
const path = require('path');
const shortid = require('shortid');
const mongoose = require('mongoose');
const Url = require('./models/url');
const userRoutes = require('./routes/user');
const staticRoutes = require('./routes/staticRouter');
const cookieParser = require('cookie-parser');
const { restrictToLoggedInUsersOnly } = require('./middleware/auth');

const app = express();
const port = 8000;

// Middleware to parse incoming form data and JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); 

// Setting up EJS as the template engine
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/short-url', {})
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));

// Use the user routes for handling signup and home
app.use('/user', userRoutes);
app.use('/', staticRoutes);

// Home route
app.get('/', (req, res) => {
  console.log('Home route accessed');
  res.render('home', { shortUrl: null, error: null }); // Always provide shortUrl and error
});

// Handle form submission to generate short URL (with authentication)
app.post("/", restrictToLoggedInUsersOnly, async (req, res) => {
  const { url } = req.body;

  // Check if URL is provided
  if (!url) {
    return res.status(400).render("home", { shortUrl: null, error: "URL is required" });
  }

  // Generate a short ID for the URL
  const shortId = shortid.generate();

  // Create a new document in MongoDB
  await Url.create({
    shortId,
    redirectUrl: url,
    visitHistory: [],
  });

  // Render the home page with the generated short URL
  res.render("home", {
    shortUrl: `${req.protocol}://${req.get('host')}/${shortId}`,
    error: null, // Clear any previous error messages
  });
});

// Redirect to the original URL when the short URL is visited
app.get("/:shortId", async (req, res) => {
  try {
    const { shortId } = req.params;

    // Find the URL by the shortId and update the visit history
    const urlEntry = await Url.findOneAndUpdate(
      { shortId },
      { $push: { visitHistory: { timestamp: Date.now() } } },
      { new: true }
    );

    // If the short URL is not found, return an error
    if (!urlEntry) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    // Redirect to the original URL
    return res.redirect(urlEntry.redirectUrl);
  } catch (error) {
    console.error('Error redirecting URL:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

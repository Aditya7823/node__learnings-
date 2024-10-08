const express = require('express');
const path = require('path');
const shortid = require('shortid'); // For generating short URLs
const mongoose = require('mongoose');
const Url = require('./models/url'); // Assuming this file has the correct MongoDB schema

const app = express();
const port = 8000;

// Middleware to parse incoming form data and JSON requests
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Setting up EJS as the template engine
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/short-url', {

})
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));

// Render the form on the homepage
app.get("/", (req, res) => {
  res.render("home", { shortUrl: null });
});

// Handle form submission to generate short URL
app.post("/", async (req, res) => {
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
    shortUrl: `${req.protocol}://${req.get('host')}/${shortId}`, // Dynamically generate the full URL
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

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

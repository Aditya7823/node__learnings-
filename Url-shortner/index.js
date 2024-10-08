const express = require('express');
const app = express();
const port = 8000;
const Url=require('./models/url');
const { connectToMongoDb } = require('./connect');

// Connect to MongoDB
connectToMongoDb('mongodb://localhost:27017/short-url')
  .then(() => {
    console.log('Connected to MongoDB successfully');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

// Middleware to parse incoming JSON requests
app.use(express.json());

// Route to handle redirection based on short ID
app.get('/:shortId', async (req, res) => {
  try {
    const shortId = req.params.shortId;

    // Find the URL entry by shortId and update visitedHistory
    const entry = await Url.findOneAndUpdate(
      { shortId },
      { $push: { visitHistory: { timestamp: Date.now() } } },
      { new: true }
    );

    if (!entry) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    // Redirect to the original URL
    res.redirect(entry.redirectUrl);
  } catch (error) {
    console.error('Error retrieving URL:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Import and use the URL route (for generating and analytics)
const urlRoute = require('./routes/url');
app.use('/', urlRoute);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

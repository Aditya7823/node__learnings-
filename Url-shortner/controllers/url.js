const shortid = require('shortid'); // Use require for CommonJS
const Url = require('../models/url'); // Make sure this path is correct

// Function to handle URL shortening
async function handleGenerateShortURl(req, res) {
  const body = req.body;

  // Check if the URL is provided in the request body
  if (!body.url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Generate a short ID
  const shortId = shortid.generate();

  // Create a new URL document in the database
  await Url.create({
    shortId,
    redirectUrl: body.url,
    visitHistory: [],
  });

  // Create the short URL to be displayed on the frontend
  const shortUrl = `${req.protocol}://${req.get('host')}/${shortId}`;

  // Render the home page with the short URL
  return res.render('home', { shortUrl });
}

// Function to handle analytics retrieval
async function handleGetAnalytics(req, res) {
  try {
    const shortId = req.params.shortId;

    // Find the URL document based on the short ID
    const result = await Url.findOne({ shortId });

    // Check if the URL entry exists
    if (!result) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    // Return analytics data
    return res.json({
      totalClicks: result.visitHistory.length, // Use `length` directly
      analytics: result.visitHistory,
    });
  } catch (error) {
    console.error('Error retrieving analytics:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = {
  handleGenerateShortURl,
  handleGetAnalytics,
};

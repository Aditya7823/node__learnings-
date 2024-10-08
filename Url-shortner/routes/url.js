const express = require('express');
const router = express.Router();
const { handleGenerateShortURl, handleGetAnalytics } = require('../controllers/url');

// Route for generating short URLs
router.post('/shorten', handleGenerateShortURl);

// Route for fetching analytics for a specific short URL
router.get('/analytics/:shortId', handleGetAnalytics);

module.exports = router;

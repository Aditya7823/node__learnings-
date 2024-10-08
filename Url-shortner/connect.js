const mongoose = require('mongoose');

// Function to connect to MongoDB
async function connectToMongoDb(url) {
    return mongoose.connect(url);
}

// Correctly export the connectToMongoDb function
module.exports = {
    connectToMongoDb
};

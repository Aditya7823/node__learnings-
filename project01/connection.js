const mongoose = require('mongoose');

async function connectMongoDb() {
   
    console.log("hihi");
    return mongoose.connect('mongodb://127.0.0.1:27017/youtubbeapp1');
}

module.exports = {
    connectMongoDb
};

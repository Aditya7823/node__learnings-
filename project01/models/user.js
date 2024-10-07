// models/user.js
const mongoose = require('mongoose');

// Define the user schema
const userSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true,
        trim: true, // Remove whitespace from both ends
    },
    last_name: {
        type: String,
        required: true,
        trim: true, // Remove whitespace from both ends
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true, // Convert email to lowercase
        trim: true, // Remove whitespace from both ends
        validate: {
            validator: function (v) {
                // Simple email validation regex
                return /^\S+@\S+\.\S+$/.test(v);
            },
            message: props => `${props.value} is not a valid email!`
        },
    },
    jobTitle: {
        type: String,
        trim: true, // Remove whitespace from both ends
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'], // Restrict to specific values
    }
}, { timestamps: true }); // Automatically manage createdAt and updatedAt fields

// Create the User model based on the schema
const User = mongoose.model('User', userSchema);

// Export the User model
module.exports = User;

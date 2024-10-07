
const express = require('express');
const router = express.Router();
const {
    handleGetAllUsers,
    getUserById,
    deleteUser,
    createUser,
    renderEditForm,
    updateUser
} = require('../controllers/user');

// Get all users from the MongoDB database
router.get('/api/users', handleGetAllUsers);

// Render the specified user info in HTML format
router.get('/:id', getUserById);

// Delete a user 
router.delete('/api/:id', deleteUser);

// Add a new user to MongoDB
router.post('/api', createUser);

// Render the edit form for a user
router.get('/:id/edit', renderEditForm);

// Handle the form submission and update the user in MongoDB
router.post('/:id/edit', updateUser);

module.exports = router;

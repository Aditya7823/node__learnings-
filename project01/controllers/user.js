const User = require('../models/user'); // Ensure the path is correct

// Get all users from the MongoDB database
const handleGetAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        
        // Dynamically create table rows based on user data
        let tableRows = users.map(user => `
            <tr>
                <td>${user.first_name}</td>
                <td>${user.last_name}</td>
                <td>${user.email}</td>
                <td>${user.jobTitle || 'N/A'}</td>
                <td>${user.gender || 'N/A'}</td>
            </tr>
        `).join('');

        const htmlTable = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>User List</title>
                <style>
                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    th, td {
                        padding: 10px;
                        border: 1px solid #ddd;
                    }
                    th {
                        background-color: #f4f4f4;
                    }
                </style>
            </head>
            <body>
                <h1>List of Users</h1>
                <table>
                    <thead>
                        <tr>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Email</th>
                            <th>Job Title</th>
                            <th>Gender</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </body>
            </html>
        `;

        return res.status(200).send(htmlTable);
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).send('<h1>Internal Server Error</h1>');
    }
};

// Get a user by ID
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send('<h1>User not found</h1>');
        }
        return res.status(200).json({ status: 'success', user });
    } catch (error) {
        console.error('Error fetching user:', error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
};

// Delete a user
const deleteUser = async (req, res) => {
    const userId = req.params.id;
    try {
        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }
        return res.status(200).json({ status: 'success', message: 'User deleted successfully', user: deletedUser });
    } catch (error) {
        console.error('Error deleting user:', error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
};

// Add a new user to MongoDB
const createUser = async (req, res) => {
    const body = req.body;
    // Validate that the request body is not empty
    if (!body || Object.keys(body).length === 0) {
        return res.status(400).json({ status: 'error', message: 'User data is required' });
    }
    try {
        const newUser = await User.create({
            first_name: body.first_name,
            last_name: body.last_name,
            email: body.email,
            jobTitle: body.jobTitle,
            gender: body.gender
        });
        return res.status(201).json({ status: 'success', user: newUser });
    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
};

// Render the edit form for a user
const renderEditForm = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            const html = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Edit User</title>
                    <style>
                        /* Your styles here */
                    </style>
                </head>
                <body>
                    <form action="/users/${user._id}/edit" method="POST">
                        <label for="first_name">First Name:</label>
                        <input type="text" id="first_name" name="first_name" value="${user.first_name}">

                        <label for="last_name">Last Name:</label>
                        <input type="text" id="last_name" name="last_name" value="${user.last_name}">

                        <label for="email">Email:</label>
                        <input type="email" id="email" name="email" value="${user.email}">

                        <label for="gender">Gender:</label>
                        <input type="text" id="gender" name="gender" value="${user.gender}">

                        <label for="job_title">Job Title:</label>
                        <input type="text" id="job_title" name="job_title" value="${user.jobTitle}">

                        <input type="submit" value="Save Changes">
                    </form>
                </body>
                </html>
            `;
            return res.send(html);
        } else {
            return res.status(404).send('<h1>User not found</h1>');
        }
    } catch (error) {
        console.error('Error fetching user:', error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
};

// Handle the form submission and update the user in MongoDB
const updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            gender: req.body.gender,
            jobTitle: req.body.jobTitle
        }, { new: true });

        if (user) {
            res.redirect(`/users/${user._id}`);
        } else {
            return res.status(404).send('<h1>User not found</h1>');
        }
    } catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
};

module.exports = {
    handleGetAllUsers,
    getUserById,
    deleteUser,
    createUser,
    renderEditForm,
    updateUser
};

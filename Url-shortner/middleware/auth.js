const { getuser } = require('../service/auth');

async function restrictToLoggedInUsersOnly(req, res, next) {
    const userUid = req.cookies?.uid; // Check if user is logged in via cookies
    
    if (!userUid) {
        return res.redirect('/login'); // Redirect to login page if not logged in
    }

    const user = getuser(userUid);
    if (!user) {
        return res.redirect('/login'); // If user is not found, redirect to login
    }

    res.user = user; // Attach user information to the response object
    next(); // Allow the request to proceed
}

module.exports = { restrictToLoggedInUsersOnly };

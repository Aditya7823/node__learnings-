const { Router } = require('express'); 
const router = Router();
const multer = require('multer');
const Blog = require('../models/blog'); // Import the Blog model
const upload = multer({ dest: 'uploads/' });
router.get('/add-blog', (req, res) => {
    return res.render('addBlog', {
        user: req.user,
    });
});
// Route to handle form submission
router.post('/add-new', upload.single('coverImage'), async (req, res) => {
    try {
        const { title, body } = req.body;
        const coverImageURL = req.file ? `/uploads/${req.file.filename}` : null;

        const newBlog = new Blog({
            title,
            body,
            coverImageURL,
            createdBy: req.user ? req.user._id : null, // Associate with logged-in user if available
        });

        await newBlog.save();
        res.redirect('/'); // Redirect to the home page or a success page
    } catch (error) {
        console.error('Error saving blog:', error);
        res.status(500).send('An error occurred while saving the blog.');
    }
});


module.exports = router;

const { Router } = require('express'); 
const router = Router();
const multer = require('multer');
const Blog = require('../models/blog'); // Import the Blog model
const Comment = require('../models/comment'); // Import the Blog model
const upload = multer({ dest: 'uploads/' });
router.get('/add-blog', (req, res) => {
    return res.render('addBlog', {
        user: req.user,
    });
});

router.post('/add-new', upload.single('f_Image'), async (req, res) => {
  try {
    const {
      f_Id,
      f_Name,
      f_Email,
      f_Mobile,
      f_Designation,
      f_Gender,
      f_Course,
      f_Createdate,
    } = req.body;

    // Email validation (basic regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(f_Email)) {
      return res.send(`
        <script>
          alert('Invalid email format');
          window.location.href = '/blog/add-blog';
        </script>
      `);
    }

    // Numeric validation for mobile
    if (!/^\d+$/.test(f_Mobile)) {
      return res.send(`
        <script>
          alert('Mobile number must be numeric');
          window.location.href = '/blog/add-blog';
        </script>
      `);
    }

    // Email duplicate check
    const existingEmail = await Blog.findOne({ f_Email });
    if (existingEmail) {
      return res.send(`
        <script>
          alert('Email already exists');
          window.location.href = '/blog/add-blog';
        </script>
      `);
    }

    // File type validation
    if (req.file) {
      const allowedMimeTypes = ['image/jpeg', 'image/png'];
      if (!allowedMimeTypes.includes(req.file.mimetype)) {
        return res.send(`
          <script>
            alert('Only jpg/png files are allowed');
            window.location.href = '/blog/add-blog';
          </script>
        `);
      }
    }

    const f_Image = req.file ? `/uploads/${req.file.filename}` : null;

    const newEmployee = new Blog({
      f_Id,
      f_Image,
      f_Name,
      f_Email,
      f_Mobile,
      f_Designation,
      f_Gender,
      f_Course,
      f_Createdate,
    });

    await newEmployee.save();
    return res.send(`
      <script>
        alert('Employee added successfully!');
        window.location.href = '/';
      </script>
    `);
  } catch (error) {
    console.error('Error saving employee:', error);
    return res.send(`
      <script>
        alert('An error occurred while saving the employee.');
        window.location.href = '/';
      </script>
    `);
  }
});
router.get('/:id', async (req, res) => {
    const { id } = req.params; // Get the blog ID from the URL params
   
    try {
        const blog = await Blog.findById(id).populate('createdBy'); // Populate createdBy field

        if (!blog) {
            return res.status(404).send('Blog not found');
        }
        
        const comments = await Comment.find({ blogId: id })

        .populate('createdBy', 'fullname')  // Populate the user's fullname field
        .sort({ createdAt: -1 }); 
        console.log(comments);
        // Render blog details page, passing the populated blog data
        res.render('blog', { blog, comments,  user: req.user });
    } catch (error) {
        console.error('Error fetching blog:', error);


        res.status(500).send('Internal Server Error');


    }
});
//router for the coment 

router.post('/comment/:blogId', async (req, res) => {
    
    const { content, user_id } = req.body;
    const { blogId } = req.params;

        // Ensure content is provided
        if (!content || content.trim() === '') {
            return res.status(400).json({ error: 'Comment content cannot be empty' });
        }

        // Check if the blog post exists
        const blog = await Blog.findById(blogId).populate('createdBy');
        
        if (!blog) {
            return res.status(404).json({ error: 'Blog post not found' });
        }
        const comment = await Comment.create({
            content,
            blogId,        // The blog this comment is associated with
            createdBy: user_id  // The user who created the comment
        });
        const comments = await Comment.find({ blogId: blogId })
        .populate('createdBy', 'fullname')  // Populate the user's fullname field
        .sort({ createdAt: -1 });  // Optional: Sort comments by date (newest first)
   console.log(comments);
        // Create a new comment
        


        res.render('blog', { blog, comments, user: req.user }); 
       
    }
);

module.exports = router;

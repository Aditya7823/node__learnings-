require("dotenv").config();
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const userRouter = require('./routes/user');
const blogRouter = require('./routes/blog');
const Blog = require('./models/blog'); // Correct import
const Comment = require('./models/blog'); // Correct import
const User = require('./models/user'); // Correct import
const cors = require("cors");
app.use(cors());
const { GoogleGenerativeAI } = require("@google/generative-ai");
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { checkForAuthenticationCookie } = require('./middlewares/authentication');
app.use(bodyParser.json());
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
require("dotenv").config();
// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, {})
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, 'views'));

// Middleware to make user available globally
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

// Serve static files
app.use(express.static('public'));

// Middleware to parse cookies
app.use(cookieParser());

// Authentication middleware
app.use(checkForAuthenticationCookie());



app.get('/landing', (req, res) => {
    res.render("landing");
});

app.get('/contact', (req, res) => {
    res.render("contact",{ user: req.user});
});

app.get('/about', (req, res) => {
    res.render("about",{ user: req.user});
});
app.get('/generate', (req, res) => {
    res.render("generate",{ user: req.user});
});


app.get('/profile', (req, res) => {
    // Simulating profile accessed data (replace with your actual user-fetching logic)
    const user = req.user || {
        fullname: 'Guest',
        email: null,
        profileImageUrl: null,
        role: 'GUEST',
    };

    res.render('profile', { 
        user: {
            fullname: user.fullname,
            email: user.email,
            profileImageUrl: user.profileImageUrl || '/images/default-profile.png', // Fallback image
            role: user.role,
        }
    });
});
//the generate google api post






app.post("/generate", async (req, res) => {
    const { prompt } = req.body;
  
    // Validate the input
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }
  
    try {
      // Get the model
      const model = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
      // Generate content
      const result = await model.generateContent(prompt);
  
      // Send response
      res.json({ response: result.response.text() });
    } catch (error) {
      console.error("Error generating content:", error);
      res.status(500).json({ error: "Failed to generate content" });
    }
  });



















// edit blog 
app.get('/blog/edit/:id', async (req, res) => {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).send('Blog not found');
    res.render('edit', { blog });
});
//edit the blog 
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const multer = require('multer');


// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Directory to save files
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename with extension
    }
});
const upload = multer({ storage });

app.post('/edit/:id', upload.single('coverImage'), async (req, res) => {
    const blogId = req.params.id;

    try {
        // Validate Blog ID (if using MongoDB)
        if (!blogId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).send('Invalid Blog ID');
        }

        // Extract form data
        const { title, body } = req.body;

        // Handle uploaded cover image (if provided)
        const coverImageURL = req.file ? req.file.path : null;

        // Find the blog by ID
        const blog = await Blog.findById(blogId);

        if (!blog) {
            return res.status(404).send('Blog not found');
        }

        // Update blog fields
        blog.title = title?.trim() || blog.title;
        blog.body = body?.trim() || blog.body;

        // Update the cover image if a new one is uploaded
        if (coverImageURL) {
            blog.coverImageURL = coverImageURL;
        }

        // Save the updated blog
        await blog.save();

        // Redirect to the home page or blogs page
        res.redirect('/myhome');
    } catch (error) {
        console.error('Error updating blog:', error);
        res.status(500).send('An error occurred while updating the blog.');
    }
});




//oomments and blogs
app.get('/comments', async (req, res) => {
    try {
        // Find all blogs created by the current user
        const blogs = await Blog.find({ createdBy: req.user._id })
            .populate('createdBy', 'fullname') // Populate blog author details
            .lean(); // Converts Mongoose objects to plain JavaScript objects

        // Fetch comments for each blog
        const blogsWithComments = await Promise.all(
            blogs.map(async (blog) => {
                const comments = await Comment.find({ blogId: blog._id })
                    .populate('createdBy', 'fullname') // Populate comment author details
                    .lean();
                return { ...blog, comments }; // Attach comments to the blog
            })
        );

        // Render the comments.ejs template with blogs and comments
        res.render('comments', {
            blogs: blogsWithComments,
            user: req.user, // Current logged-in user
        });
    } catch (error) {
        console.error('Error fetching blogs and comments:', error);
        res.status(500).send('An error occurred while fetching the data.');
    }
});


// GET route to render settings page
app.get('/settings', async (req, res) => {
    try {
        res.render('settings', { user: req.user || null }); // Pass the user object or null
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).send('Error loading settings page');
    }
});// Configure Multer for file uploads


app.post('/settings', upload.single('profileImageUrl'), async (req, res) => {
    try {
        const { fullname, email } = req.body;
        const profileImageUrl = req.file ? `/uploads/profileImages/${req.file.filename}` : null;

        // Check if email is provided
        if (!email) {
            return res.status(400).send('Email is required to update the profile.');
        }

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send('User not found.');
        }

        // Update the fullname
        if (fullname) {
            user.fullname = fullname;
        }
       
        // Update the profile image if provided
        if (profileImageUrl) {
            // Delete the old profile image if it exists and is not the default
            if (user.profileImageUrl && user.profileImageUrl !== '/images/profile.png') {
                const oldImagePath = path.join(__dirname, '..', user.profileImageUrl);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }

            // Set the new profile image URL
            user.profileImageUrl = profileImageUrl;
        }
          console.log(user);
        // Save the updated user to the database
        await user.save();
        
        // Redirect back to settings page with updated profile
        res.redirect('/profile');
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).send('Internal server error. Please try again later.');
    }
});


//delete the blog 
app.post('/blog/delete/:id', async (req, res) => {
    await Blog.findByIdAndDelete(req.params.id);
    res.redirect('/myhome'); // Redirect to the main page after deletion
});


// my home route

app.get('/myhome', async (req, res) => {
    const { title } = req.query; // Extract 'title' from query parameters

    try {
        let allBlogs;

        if (!req.user) {
            // If no user is logged in, display a guest message or an empty blog list
            return res.render("home", {
                user: null,
                blogs: [],
                message: "You are not logged in. Please log in to view your blogs.",
            });
        }

        const userId = req.user._id; // Get the current user's ID

        if (title) {
            // Fetch blogs created by the current user and filter them by title
            allBlogs = await Blog.find({ createdBy: userId }); // Filter by user ID
            allBlogs = allBlogs.filter(blog => blog.title.toLowerCase().includes(title.toLowerCase())); // Filter by title
        } else {
            // Fetch all blogs created by the current user
            allBlogs = await Blog.find({ createdBy: userId });
        }

        console.log("Home route accessed with title:", title);
        res.render("myhome", {
            user: req.user, // Pass the current user to the view
            blogs: allBlogs, // Pass the filtered blogs to the view
        });
    } catch (error) {
        console.error("Error fetching blogs:", error);
        res.status(500).send("An error occurred while loading the home page.");
    }
});

// Home route
app.get('/', async (req, res) => {
    const { title } = req.query; // Extract 'title' from query parameters

    try {
        let allBlogs;

        if (title) {
            // Find all blogs and filter by title using JavaScript array filter
            allBlogs = await Blog.find({});
            allBlogs = allBlogs.filter(blog => blog.title.toLowerCase().includes(title.toLowerCase()));
            console.log(allBlogs);
        } else {
            // Fetch all blogs if no title search query is provided
            allBlogs = await Blog.find({});
        }

        console.log("Home route accessed with title:", title);
        res.render("home", {
            user: req.user,
            blogs: allBlogs, // Pass the filtered blogs to the home view
        });
    } catch (error) {
        console.error("Error fetching blogs:", error);
        res.status(500).send("An error occurred while loading the home page.");
    }
});









app.get('/logout', async (req, res) => {
    try {
        
        res.render("landing", {
           
        });
    } catch (error) {
        console.error("Error fetching blogs:", error);
        res.status(500).send("An error occurred while loading the home page.");
    }
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Use user router
app.use('/user', userRouter);
app.use('/blog', blogRouter);



// POST route to handle form submission
app.post("/send", async (req, res) => {
    console.log("Received data:", req.body); // Debugging

    const { name, email, subject, message } = req.body;

    // Validate input fields
    if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: "All fields are required." });
    }

    try {
        // Nodemailer transport configuration
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER, // Sender email from .env
                pass: process.env.EMAIL_PASS, // App password from .env
            },
        });

        // Email details
        const mailOptions = {
            from: `"${name}" <${email}>`, // Use sender's name and email
            to: process.env.EMAIL_USER, // Your email to receive the message
            subject: `[Blogify Contact] ${subject}`, // Subject with prefix
            text: `Message from ${name} (${email}):\n\n${message}`, // Plain text body
        };

        // Send email
        await transporter.sendMail(mailOptions);

        console.log("Email sent successfully.");
        res.status(200).json({ message: "Email sent successfully." });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ error: "Failed to send email. Please try again later." });
    }
});


// Start the server
const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log("Server has been started on port", port);
});
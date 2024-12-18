require("dotenv").config();
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const Follow = require("./models/Follow");
const Like = require("./models/Like");
const userRouter = require('./routes/user');
const blogRouter = require('./routes/blog');
const Blog = require('./models/blog'); // Correct import
const Notification = require("./models/notification");// Correct import
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

// thus the comment graph 



app.get('/stats', async (req, res) => {
    try {
        const notifications = await Notification.find({ receiver: req.user._id })
            .sort({ createdAt: -1 }) // Sort by most recent
            .populate("sender", "fullname"); // Populate the sender's fullname from User schema

        // Aggregating blogs and their associated comments
        const blogComments = await Blog.aggregate([
            {
                $lookup: {
                    from: 'comments', // Ensure 'comments' is the correct collection name
                    localField: '_id',
                    foreignField: 'blogId',
                    as: 'comments'
                }
            },
            {
                $project: {
                    title: 1,
                    commentCount: { $size: '$comments' }
                }
            }
        ]);

        // Check if blogComments is being passed correctly
        console.log(blogComments);  // Add this line to check if data is fetched properly

        res.render('commentsGraph', { blogComments ,notifications}); // Rendering EJS with blogComments
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});









app.get('/landing', (req, res) => {
    res.render("landing");
});

app.get('/contact', async(req, res) => {
    const notifications = await Notification.find({ receiver: req.user._id })
            .sort({ createdAt: -1 }) // Sort by most recent
            .populate("sender", "fullname"); // Populate the sender's fullname from User schema

    res.render("contact",{ user: req.user,notifications});
});
app.get('/about', async(req, res) => {
    const notifications = await Notification.find({ receiver: req.user._id })
            .sort({ createdAt: -1 }) // Sort by most recent
            .populate("sender", "fullname"); // Populate the sender's fullname from User schema

    res.render("about",{ user: req.user,notifications});
});
app.get('/generate', (req, res) => {
    res.render("generate",{ user: req.user});
});


app.put('/notifications/:id/mark-read', async (req, res) => {
    try {
        const notificationId = req.params.id;

        // Update the `isRead` status of the notification to true
        await Notification.findByIdAndUpdate(notificationId, { isRead: true });

        res.status(200).json({ message: 'Notification marked as read.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to mark notification as read.' });
    }
});

app.get('/profile', async (req, res) => {
    // Simulating profile accessed data (replace with your actual user-fetching logic)


    const notifications = await Notification.find({ receiver: req.user._id })
    .sort({ createdAt: -1 }) // Sort by most recent
    .populate("sender", "fullname"); // Populate the sender's fullname from User schema


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
        },
        notifications
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
const notification = require("./models/notification");


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
        const notifications = await Notification.find({ receiver: req.user._id })
            .sort({ createdAt: -1 }) // Sort by most recent
            .populate("sender", "fullname"); // Populate the sender's fullname from User schema

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
            user: req.user,
            notifications // Current logged-in user
        });
    } catch (error) {
        console.error('Error fetching blogs and comments:', error);
        res.status(500).send('An error occurred while fetching the data.');
    }
});


// GET route to render settings page
app.get('/settings', async (req, res) => {
    try {
        const notifications = await Notification.find({ receiver: req.user._id })
            .sort({ createdAt: -1 }) // Sort by most recent
            .populate("sender", "fullname"); // Populate the sender's fullname from User schema

        res.render('settings', { user: req.user || null ,notifications}); // Pass the user object or null
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).send('Error loading settings page');
    }
});// Configure Multer for file uploads


app.post('/settings', upload.single('profileImageUrl'), async (req, res) => {
    try {
        const notifications = await Notification.find({ receiver: req.user._id })
            .sort({ createdAt: -1 }) // Sort by most recent
            .populate("sender", "fullname"); // Populate the sender's fullname from User schema

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
        res.redirect('/profile',{notifications});
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
        const notifications = await Notification.find({ receiver: req.user._id })
        .sort({ createdAt: -1 }) // Sort by most recent
        .populate("sender", "fullname"); // Populate the sender's fullname from User schema

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
            blogs: allBlogs,
            notifications // Pass the filtered blogs to the view
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
        // Fetch notifications for the logged-in user
        const notifications = await Notification.find({ receiver: req.user._id })
            .sort({ createdAt: -1 }) // Sort by most recent
            .populate("sender", "fullname"); // Populate the sender's fullname from User schema

        let allBlogs;
        let followedAuthors = [];

        // Fetch all blogs based on the search query
        if (title) {
            allBlogs = await Blog.find({});
            allBlogs = allBlogs.filter(blog => blog.title.toLowerCase().includes(title.toLowerCase()));
            console.log(allBlogs);
        } else {
            allBlogs = await Blog.find({});
        }

        const userId = req.user._id; // Get the current user's ID

        // Fetch the list of users the current user is following
        const followingList = await Follow.find({ follower: userId }).populate('following', 'fullname _id profileImageUrl');

        // Extract the authors (following users)
        followedAuthors = followingList.map(follow => follow.following);

        // Fetch liked blog IDs for the current user
        let likedBlogs = [];
        likedBlogs = await Like.find({ user: userId }).select("blog").lean();
        likedBlogs = likedBlogs.map(like => like.blog.toString()); // Get an array of liked blog IDs

        // Create a hashmap of like counts for each blog
        let likeCountMap = {};
        const allLikes = await Like.find({}).lean(); // Fetch all likes from the database
        allLikes.forEach(like => {
            if (likeCountMap[like.blog]) {
                likeCountMap[like.blog] += 1; // Increment like count for the blog
            } else {
                likeCountMap[like.blog] = 1; // Initialize like count if it doesn't exist
            }
        });

        if (followedAuthors.length === 0) {
            console.log('User is not following anyone');
        }

        console.log("Home route accessed with title:", title);
        
        // Render the home view with additional data
        res.render("home", {
            user: req.user,
            blogs: allBlogs, // Pass the filtered blogs to the home view
            followedAuthors,
            notifications, // Pass the set of authors the user is following
            likedBlogs, // Pass the liked blogs IDs to the frontend
            likeCountMap // Pass the like count map to the frontend
        });
    } catch (error) {
        console.error("Error fetching blogs:", error);
        res.status(500).send("An error occurred while loading the home page.");
    }
});



































//flooow functionality 






 // Import the notification model

app.post("/follow/:authorId", async (req, res) => {
    try {
       
      

        
        const { authorId } = req.params; // Get the author ID (the user being followed)
        const { currentUserId } = req.body; // Get the current user ID (the follower)

        // Check if the current user is trying to follow themselves
        if (currentUserId === authorId) {
            return res.status(400).json({ message: "You cannot follow yourself." });
        }

        // Check if the follow relationship already exists
        const existingFollow = await Follow.findOne({ follower: currentUserId, following: authorId });
        if (existingFollow) {
            return res.status(400).json({ message: "You are already following this user." });
        }

        // Create a new follow relationship
        const newFollow = new Follow({
            follower: currentUserId,
            following: authorId
        });

        await newFollow.save();

        // Send a notification to the followed user
        const notificationMessage = `User  has started following you.`;

        const newNotification = new Notification({
            sender: currentUserId,
            receiver: authorId,
            message: notificationMessage,
        });

        await newNotification.save();

        return res.status(200).json({ message: "Followed successfully and notification sent!" });
    } catch (error) {
        console.error("Error following user:", error);
        return res.status(500).json({ message: "Internal server error." });
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




// notification fetch and showing  phase 


app.get("/notifications/:userId", async (req, res) => {
    try {
        
        const { userId } = req.params;
        const notifications = await Notification.find({ receiver: req.user._id })
        .sort({ createdAt: -1 }) // Sort by most recent
        .populate("sender", "fullname"); // Populate the sender's fullname from User schema

        // Fetch notifications for the user and populate sender details
        const n = await Notification.find({ receiver: userId })
            .sort({ createdAt: -1 }) // Sort by most recent
            .populate("sender", "fullname"); // Populate the sender's fullname from User schema

        // Render the notifications view, passing the notifications data
        res.render("notification", { n, user:req.user, notifications});
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).send("Internal server error.");
    }
});

//followers   gate away 
app.get("/followers", async (req, res) => {
    try {
        const userId = req.user._id; // Assuming `req.user` contains the logged-in user's info
       
        const notifications = await Notification.find({ receiver: userId })
            .sort({ createdAt: -1 }) // Sort by most recent
            .populate("sender", "fullname"); // Populate the sender's fullname from User schema

        // Fetch followers for the current user
        const followers = await Follow.find({ following: userId })
            .populate("follower", "fullname email profileImageUrl") // Populate follower details
            .exec();

        // Render the followers.ejs view, passing the followers list
        res.render("followers", {  user: req.user,followers ,notifications });
    } catch (err) {
        console.error("Error fetching followers:", err);
        res.status(500).send("Internal server error.");
    }
});
//followings route or gateaway 
app.get("/followings/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;
      

        const notifications = await Notification.find({ receiver: req.user._id })
            .sort({ createdAt: -1 }) // Sort by most recent
            .populate("sender", "fullname"); // Populate the sender's fullname from User schema

        // Fetch the followings where the current user is the follower
        const followings = await Follow.find({ follower: userId })
            .populate("following", "fullname email profileImageUrl")
            .exec();

        res.render("followings", {
            followings,
            user:req.user,
            notifications
             // Pass the followings list to the frontend
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

//route to like  a  blog 

app.post("/blog/:id/like", async (req, res) => {
    try {
        const blogId = req.params.id;
        const userId = req.body.userId;

        if (!userId) {
            return res.status(401).json({ success: false, message: "User not logged in" });
        }

        // Check if the user already liked the blog
        const existingLike = await Like.findOne({ blog: blogId, user: userId });

        if (existingLike) {
            // User already liked, so unlike
            await Like.deleteOne({ _id: existingLike._id });
        } else {
            // User has not liked yet, so create a new like
            await Like.create({ blog: blogId, user: userId });
        }

        // Get updated like count
        const likeCount = await Like.countDocuments({ blog: blogId });

        res.status(200).json({ success: true, likes: likeCount });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Start the server
const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log("Server has been started on port", port);
});
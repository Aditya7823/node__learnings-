require("dotenv").config();
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const express = require('express');
const path = require('path');
const multer = require('multer');
const app = express();
const userRouter = require('./routes/user');
const blogRouter = require('./routes/blog');
const Blog = require('./models/blog'); // Correct import
const cors = require("cors");
app.use(cors());
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { checkForAuthenticationCookie } = require('./middlewares/authentication');
const Employee = require("./models/blog");
const { applyTimestamps } = require("./models/user");
app.use(bodyParser.json());
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

// search module 
app.get('/search', async (req, res) => {
    const query = req.query.query?.toLowerCase() || '';
    try {
      // Search employees by ID, Name, or Email (case-insensitive)
      const employees = await Employee.find({
        $or: [
          { f_Id: { $regex: query, $options: 'i' } },
          { f_Name: { $regex: query, $options: 'i' } },
          { f_Email: { $regex: query, $options: 'i' } },
        ],
      });
  
      // Respond with the filtered employee list
      res.status(200).json(employees);
    } catch (error) {
      console.error('Error searching employees:', error);
      res.status(500).send('Error searching employees');
    }
  });
  
  // Route to get all employees or filtered employees based on the search query
// app.get('/search', async (req, res) => {
//     try {
//         const query = req.query.query || ''; // If no query is provided, return all employees

//         let filter = {};
//         if (query) {
//             filter = {
//                 $or: [
//                     { f_Id: { $regex: query, $options: 'i' } },
//                     { f_Name: { $regex: query, $options: 'i' } },
//                     { f_Email: { $regex: query, $options: 'i' } }
//                 ]
//             };
//         }

//         const employees = await Employee.find(filter);
//         res.render("search",employees);
//     } catch (error) {
//         console.error('Error fetching employees:', error);
//         res.status(500).send('Server error');
//     }
// });


app.get('/landing', (req, res) => {
    res.render("landing");
});

app.get('/search', (req, res) => {
    res.render("search");
});

app.get('/contact', (req, res) => {
    res.render("contact");
});

app.get('/about', (req, res) => {
    res.render("about");
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













app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer({ dest: 'uploads/' });
//update in the database fo rthe update in the  employee
// Route to handle the update request
  // Assuming you have an Employee model to interact with the database

  app.post('/employee/update/:id', upload.single('f_Image'), async (req, res) => {
    const employeeId = req.params.id;
  
      // Validate the ID format (for MongoDB ObjectId)
      
  
  
      try {
          // Extract form data from req.body
          const { f_Name, f_Email, f_Mobile, f_Designation, f_Gender, f_Course } = req.body;
          
          // Handle the uploaded image (if any)
          const f_Image = req.file ? req.file.path : null;
  
          // Fetch the current employee data by ID
          const employee = await Employee.findOne({ f_Id: req.params.id });
  
          if (!employee) {
              return res.status(404).send('Employee not found');
          }
  
          // Update employee fields with new data (use existing data if no new value is provided)
          employee.f_Name = f_Name || employee.f_Name;
          employee.f_Email = f_Email || employee.f_Email;
          employee.f_Mobile = f_Mobile || employee.f_Mobile;
          employee.f_Designation = f_Designation || employee.f_Designation;
          employee.f_Gender = f_Gender || employee.f_Gender;
          employee.f_Course = f_Course || employee.f_Course;
          employee.f_Image = f_Image || employee.f_Image;  // Use the new image path if uploaded
  
          // Save the updated employee data to the database
          await employee.save();
  
          // Send success response
         
          const employees = await Blog.find(); // Fetch all employees
          res.render('myhome', { employees,user: req.user }); 
      } catch (err) {
          console.error(err);
          res.status(500).send('Error updating employee');
      }
  });
  

  
//edit employee 
 // Route to display the Edit form with employee data
 app.get('/employee/edit/:id', async (req, res) => {
    try {
      // Find the employee by their f_Id (or _id if MongoDB default)
      const employee = await Employee.findOne({ f_Id: req.params.id });
  
      // If employee not found, send a 404 response
      if (!employee) {
        return res.status(404).send('Employee not found');
      }
  
      // Render the 'editEmployee' view with employee data
      res.render('editEmployee', { employee }); 
  
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
    }
  });
  
  

// DELETE route to delete an employee by `f_Id`
app.delete("/employee/:id", async (req, res) => {
    const employeeId = req.params.id; // Extracting `id` from request parameters
    try {
        const deletedEmployee = await Employee.findOneAndDelete({ f_Id: employeeId });
        if (deletedEmployee) {
            return res.status(200).json({ message: "Employee deleted successfully." });
        } else {
            return res.status(404).json({ error: "Employee not found." });
        }
    } catch (err) {
        console.error("Error deleting employee:", err);
        return res.status(500).json({ error: "Failed to delete employee." });
    }
});



// my home route

app.get('/myhome', async (req, res) => {
    try {
        const employees = await Blog.find(); // Fetch all employees
        res.render('myhome', { employees,user: req.user }); // Pass employees to the template
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching employees');
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
            text: `Message from ${name} (${email}):\n\n${message}`, // 
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
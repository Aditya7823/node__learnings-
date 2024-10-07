const express = require('express');
const path = require('path');
const app = express();

// Set port, either from environment variables or default to 3000
const port = process.env.PORT || 3000;

// Middleware to serve static files from the "static" folder
app.use('/static', express.static('static'));

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.json()); // Parse JSON bodies

// Set the template engine as Pug for our app
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Endpoint for the demo page
app.get('/demo', (req, res) => {
  res.status(200).render('demo');
});

// Handle form submission
app.post('/submit_form', (req, res) => {
  // Access the form data from req.body
  const { name, email, address, phone, gender, dob, message } = req.body;

  // Log the received form data
  console.log('Form Data Received:', { name, email, address, phone, gender, dob, message });

 
  res.status(200).render('success', {
    name,
    email,
    address,
    phone,
    gender,
    dob,
    message
  });
});


app.use((req, res) => {
  res.status(404).render('404', {
    title: '404 Not Found',
    message: 'Oops! The page you are looking for does not exist.',
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Express app running on port ${port}`);
});

// const express = require('express');
// const path = require('path');
// const app = express();
// const port = 80;

// // Middleware to serve static files from the 'static' directory
// app.use('/static', express.static('static'));

// // Setting the template engine as 'pug'
// app.set('view engine', 'pug');

// // Setting the views directory
// app.set('views', path.join(__dirname, 'views'));

// // Example route to render a Pug template
// app.get('/index', (req, res) => {
//     res.status(200).render('index', { title: 'Pug Example', message: 'Welcome to the Pug template engine!' });
// });


// // Listen to the server
// app.listen(port, () => {
//     console.log(`App running on http://localhost:${port}`);
// });

const http = require('http');
const fs = require('fs');
const url = require('url');

const myserver = http.createServer((req, res) => {
    const log = `${Date.now()}: ${req.url} new request received \n`; // Correct newline character
    const myurl = url.parse(req.url, true);
    console.log(myurl);

    // Log the request to a file
    fs.appendFile('myfile.txt', log, (err) => {
        if (err) {
            console.error('Error writing to file', err);
        }
    });

    // Set the response header
    res.writeHead(200, { 'Content-Type': 'text/plain' });

    switch (myurl.pathname) {
        case "/":
            res.end("This is my homepage");
            break; // Prevent falling through to the next case
        case "/about":
            const username = myurl.query.myname; // Use 'username' here
            res.end(`Hi!..... ${username}`); // Use 'username' variable
            break; // Prevent falling through
        default:
            res.end("This is the default page");
    }
});

myserver.listen(8000, () => {
    console.log("Everything is ok on port 8000");
});

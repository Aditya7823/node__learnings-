const http = require('http');
const fs = require('fs');

// Create the server
const server = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'text/html');

    // Handle routing
    if (req.url === '/' || req.url === '/home') {
        // Serve the home page
        fs.readFile(__dirname + '/home.html', (err, content) => {
            res.writeHead(200);
            res.end(content);
        });
    } else if (req.url === '/about') {
        // Serve the about page
        fs.readFile(__dirname + '/about.html', (err, content) => {
            res.writeHead(200);
            res.end(content);
        });
    } else if (req.url === '/contact') {
        // Serve the contact page
        fs.readFile(__dirname + '/contact.html', (err, content) => {
            res.writeHead(200);
            res.end(content);
        });
    } else {
        // Serve a 404 not found response
        res.writeHead(404);
        res.end('<h1>404 Page Not Found</h1>');
    }
});

// Start the server on port 3000
server.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});

const http= require('http');
const fs= require('fs');
const filecontent= fs.readFileSync('index.html');
const server = http.createServer((req,res)=>
{

    res.writeHead(200,{'content-tye': 'text/html'});
    res.end(filecontent);
})
server.listen(8000,'127.0.0.1',()=>{
    console.log("listening onthe port 8 thousands ");
})
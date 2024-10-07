const http= require('http');
const  myserver= http.createServer((req,res)=>{
    console.log("new request received!");
    console.log("hello from server ....");

})
myserver.listen(8000,()=>{
    console.log("everythign is ok ");
})
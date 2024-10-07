console.log("this is the module");
function average(array)
{

    let sum=0;
     for (let index = 0; index < array.length; index++) {
      sum = sum +array[index];
        
     }
     return sum/array.length;
}
module.exports= 
{
avg:average,
    name: "aditya",
repo :"github"
}
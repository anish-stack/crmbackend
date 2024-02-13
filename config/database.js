const mongodb = require('mongoose')
require('dotenv').config()
const URL = process.env.MONGO_DB_URL || "mongodb+srv://happycoding41:mY44g7XhnfZnOGD7@cluster0.w1qwdze.mongodb.net/?retryWrites=true&w=majority"


const ConnectDb = async()=>{
try{

await mongodb.connect(URL,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    connectTimeoutMS: 100000,
})
console.log("Connected to the database successfully!");
}catch(error){
    console.log("Error in connecting to database", error)
}
} 

module.exports = ConnectDb

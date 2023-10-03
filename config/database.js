const mongodb = require('mongoose')
require('dotenv').config()
const URL = process.env.MONGO_DB_URL || "mongodb+srv://anishjha896:c3DfmZv9BM3lE3i2@cluster0.8kxz57r.mongodb.net/?retryWrites=true&w=majority"


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

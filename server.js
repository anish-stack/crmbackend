const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser= require('body-parser')
const path = require("path");
const userRoutes = require("./routes/userRoutes");
const cookieParser = require("cookie-parser");
const configPath = path.resolve(__dirname, "config", "config.env");
dotenv.config({ path: configPath });
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});




app.use(bodyParser.json());

app.use(cookieParser());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const ConnectDb = require("./config/database");
ConnectDb();

const PORT = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.send("Hello World !");
});

app.use("/api", userRoutes);


app.listen(PORT, () => {
  console.log(`Server is Running on Port number ${PORT}`);
});

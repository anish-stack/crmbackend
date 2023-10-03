
const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require('body-parser')
const path = require("path");
const cookieParser = require("cookie-parser");
const ConnectDb = require("./config/database");
const User = require('../modals/executive');
const bcrypt = require('bcrypt');
const { RegisterUser, login, logout, markAttendance } = require('./controllers/userController');
const { protect } = require('./middleware/auth');
const { createClient, followUp, updateClientReport, GetClientByMobileNumber, downloadClientData, downloadAttendance } = require('./controllers/clientController');

const sendMail = require('../utility/sendMail');
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
// Set up CORS and other middleware
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to the database
ConnectDb();

const PORT = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});


// Create a router for API endpoints
const route = express.Router();

// Define your routes here
route.post('/Register', RegisterUser);

route.post('/activate', async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare the provided OTP with the stored OTP hash
    const otpMatch = await bcrypt.compare(otp.toString(), user.otp);

    if (!otpMatch) {
      return res.status(401).json({ message: 'Invalid OTP' });
    }

    // Update the user's "isActivated" status to true
    user.isActivated = true;
    await user.save();
    await sendMail({
        email: user.email,
        subject: "Account Activated Successfully",
        message: `Welcome to DGMT! Your account has been successfully activated. You can now log in and explore our CRM. Thank you for joining DGMT.`,
      });
      
    res.status(200).json({ message: 'Account activated successfully' });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});
route.post('/login', login);
route.post('/logout', protect, logout);
route.post('/mark-attendance', markAttendance);
route.post('/create-client', protect, createClient);
route.get('/follow-up-clients', protect, followUp);
route.post('/Change-ClientDetails', protect, updateClientReport);
route.post('/getClientByNumber', GetClientByMobileNumber);
route.get('/Download-client-data', downloadClientData);
route.get('/download-attendance', downloadAttendance);

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on Port number ${PORT}`);
});

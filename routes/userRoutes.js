const express = require('express');
const { RegisterUser, login, logout, markAttendance } = require('../controllers/userController');
const route = express.Router();
const User = require('../modals/executive')
const bcrypt = require('bcrypt')
const sendMail = require('../utility/sendMail');
const { protect } = require('../middleware/auth');
const { createClient, followUp, updateClientReport,GetClientByMobileNumber, downloadClientData,downloadAttendance } = require('../controllers/clientController');

route.post('/Register',RegisterUser)

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

route.post('/login',login)
route.post('/logout',protect,logout)
route.post('/mark-attendce',markAttendance)
route.post('/create-client',protect,createClient)
route.get('/follow-up-clients',protect,followUp)
route.post('/Change-ClientDetails',protect,updateClientReport)
route.post('/getClientByNumber',GetClientByMobileNumber)
route.get('/Download-client-data',downloadClientData)
route.get('/download-Attendce',downloadAttendance)

module.exports = route;

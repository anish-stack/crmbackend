const sendMail = require("../utility/sendMail");
const sendToken = require("../utility/jwt");
const cron = require("node-cron");
const user = require("../modals/executive");
const attendanceSchema = require("../modals/attendence");
const bcrypt = require("bcrypt");
const moment = require("moment-timezone");
const jwt = require("jsonwebtoken");
const ErrorHandler = require;
const {
  catchAsyncErrors,
  deleteUnactivatedUsers,
} = require("../utility/catchAsync");
const User = require("../modals/executive");

exports.RegisterUser = catchAsyncErrors(async (req, res) => {
  const { username, email, password, confirmPassword, role } = req.body;

  const existingUser = await User.findOne({ email });

  try {
    if (existingUser) {
      throw new ErrorHandler("User already exists with this Email Id", 400);
    } else if (!username || !email || !password || !confirmPassword) {
      throw new ErrorHandler("Please Fill All Fields", 422);
    }

    if (password !== confirmPassword) {
      throw new ErrorHandler("Confirm Password Not Match", 422);
    }

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Hash the OTP before saving it
    const otpHash = await bcrypt.hash(otp.toString(), 10);

    const newUser = new User({
      username,
      email,
      password,
      role,
      isActivated: false,
      otp: otpHash,
    });

    await newUser.save();

    // Send the OTP via email
    await sendMail({
      email: newUser.email,
      subject: "OTP for Account Activation",
      message: `Welcome to DGMT! Your OTP for account activation is: ${otp}. Please use this code to complete your registration. Thank you for Joining DGMT.`,
    });
    res.status(201).json({
      message:
        "User registered successfully. An OTP has been sent to your email for activation.",
      newUser,
    });
    console.log(newUser);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

setInterval(deleteUnactivatedUsers, 20 * 60 * 1000);

// login For User
exports.login = catchAsyncErrors(async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please Enter Email And Password",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User With this Email Not Existed",
      });
    }

    if (!user.isActivated) {
      return res.status(403).json({
        success: false,
        message: "User Not Activated",
      });
    }

    // Use bcrypt to compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Password Mismatch",
      });
    }

    const payload = {
      email: user.email,
      id: user._id,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7h",
    });

    // Remove the password from the user object before sending it in the response
    user.password = undefined;

    const options = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };

    return res.cookie("token", token, options).status(200).json({
      success: true,
      token,
      user,
      message: "Logged in successfully",
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
});

//logout
exports.logout = (req, res) => {
  // Clear the authentication token (cookie) to log the user out
  res.clearCookie("token");
  res.status(200).json({
    success: true,
    message: "Logout Successful",
  });
};

//Mark Attendenc With Email And Date And time

exports.markAttendance = catchAsyncErrors(async (req, res) => {
  try {
    const { email } = req.body;
    const executive = await user.findOne({ email });

    // Check if executive is valid or not
    if (!executive) {
      return res
        .status(404)
        .json({ success: false, msg: "Executive Not Found" });
    }

    // Get the current date and time in IST (India Standard Time)
    const currentDate = new Date();
    const options = { timeZone: "Asia/Kolkata" };
    const istTime = currentDate.toLocaleString("en-US", options);

    // Check if user has already marked attendance 
    const existingAttendance = await attendanceSchema.findOne({
      employeeId: executive._id,
   
    });
      console.log(existingAttendance)
    if (!existingAttendance) {
      // Create a new attendance record
      const newAttendance = new attendanceSchema({
        employeeId: executive._id, // Assuming you have an employee ID for the executive
        date: istTime,
        attendanceStatus: "Present", // You can adjust this as needed
      });
      console.log('New attendance record created for', executive._id, 'on', istTime);
      await newAttendance.save(); // Save the new attendance record
    } else {
      console.log('Attendance for', executive._id, 'on', istTime, 'already marked.');

      return res
        .status(404)
        .json({ success: false, msg: "Attendance for today already marked" });
    }

    // Respond with a success message
    res
      .status(200)
      .json({ success: true, msg: "Attendance Marked Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, msg: "Internal Server Error" });
  }
});

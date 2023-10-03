const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },
  confirmPassword: {
    type: String,
  },
  isActivated:{
    type:Boolean
  },
  token: {
    type: String,
  },


  otp:{
    type: String
  },
  role: {
    type: String,
    enum: ['executive', 'headOfTeam'], 
    default: 'executive', 
  },
  isActivated: {
    type: Boolean,
    default: false, 
  },
  resetPasswordOtp: {
    type: Number,
  },
  resetPasswordOtpExpire: {
    type: Date,
    default: Date.now(),
  },
});

// Define a pre-save hook to hash the password before saving it to the database
userSchema.pre('save', async function (next) {
  const user = this;
  if (!user.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);
    user.password = hashedPassword;
    user.confirmPassword = undefined; // Clear confirmPassword after hashing
    next();
  } catch (error) {
    return next(error);
  }
});

//// Add the method to compare passwords

userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getJwtToken = function () {
  const token = jwt.sign({ id: this._id, email: this.email }, process.env.JWT_SECRET, {
    expiresIn: '4d',
  });
  return token;
};

const User = mongoose.model('executive', userSchema);

module.exports = User;

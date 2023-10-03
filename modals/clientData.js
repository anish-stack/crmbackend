const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  mobileNumber: {
    type: String,
    required: true,
    unique:true
  },
  email:{
    type: String,
  },
  businessWebsiteName: String,
  package: String,
  customerRequirements: String,
  discounts: Number,
  followUp: {
    type: Boolean,
    default: false,
  },
  messageSend:{
    type: Boolean,
    default: false,
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId, // Assuming user IDs are stored as ObjectIds
    ref: 'executive', // Reference to the User model
    required: true,
  },
  followUpDate: String,
});

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;

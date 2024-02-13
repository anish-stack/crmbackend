const mongoose = require('mongoose');

const customerRequirementsModel = new mongoose.Schema({
  comment:{
    type:String
  }
},{timestamps:true})

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  mobileNumber: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
  },
  businessWebsiteName: String,
  package: String,
  customerRequirements:{
    type:[customerRequirementsModel]
  },
  discounts: Number,
  followUp: {
    type: Boolean,
    default: false,
  },
  messageSend: {
    type: Boolean,
    default: false,
  },
  submittedByName:{
    type: String,
  },
  status:{
    type:Boolean,
    default: true,
    },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'executive',
    // required: true,
  },
  followUpDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;

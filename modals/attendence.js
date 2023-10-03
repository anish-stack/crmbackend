const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model (assuming your user model is named "User")
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  entryTime: {
    type: String, // You can store entry time as a Date object
  },
  attendanceStatus: {
    type: String,
    enum: ["Present", "Off"], // You can extend this enum for different status types
    default: "Off", // Default to "Off" when attendance is not marked
  },
});

// Create an index on the `employeeId` and `date` fields for efficient queries
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model("Attendance", attendanceSchema);

module.exports = Attendance;

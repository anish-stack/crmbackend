const nodemailer = require('nodemailer');
const Client = require('../modals/clientData');
const { catchAsyncErrors } = require('../utility/catchAsync');
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const mongoose = require('mongoose');
const Attendnce = require('../modals/attendence')
const ExcelJS = require('exceljs');
// Function to send an email with a PDF attachment
const sendPdfMail = async (email, pdfFileName, package, packagePDF) => {
  const transporter = nodemailer.createTransport({
    // Configure your email provider here
    // Example: SMTP transporter for Gmail
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
      user: 'dgmtcrm@gmail.com',
      pass: 'izgp pbxn axju twhb',
    },
  });

  const mailOptions = {
    from: 'dgmtcrm@gmail.com',
    to: email,
    subject: 'Package Information',
    text: `Thank you for choosing the ${package} package.`,
    attachments: [
      {
        filename: pdfFileName,
        content: packagePDF,
        contentType: 'application/pdf',
      },
    ],
  };

  // Send the email
  await transporter.sendMail(mailOptions);
};
//function to create a client by executive
exports.createClient = catchAsyncErrors(async (req, res) => {
  const userid = req.user.id
  const name = req.user.username
  //console.log(req.user.username)
  try {
    const {
      name,
      mobileNumber,
      email,
      businessWebsiteName,
      package,
      customerRequirements,
      discounts,
      followUp,
      messageSend,
      
      followUpDate
    } = req.body;

    const client = new Client({
      name,
      mobileNumber,
      email,
      businessWebsiteName,
      package,
      customerRequirements,
      discounts,
      followUp,
      messageSend,
      submittedByName:name,
      submittedBy:userid,
      followUpDate
    });

    await client.save();

    res.status(201).json({ success: true, data: client });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

exports.addComments = catchAsyncErrors(async (req, res) => {
  try {
    const userId = req.user.id;

    // Validate that the user id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, msg: 'Invalid user id' });
    }

    const submittedBy = new mongoose.Types.ObjectId(userId);
    // //console.log(submittedBy)

    const { id, customerRequirements } = req.body;
    //console.log(req.body)
    // Find the client by mobile number
    const clientFind = await Client.findById(id);
    //console.log(clientFind)
    if (clientFind) {
      let commentList = [];

      // Checking whether the customerRequirements field is already present or not
      if (!clientFind.customerRequirements) {
        commentList = [{ ...customerRequirements }];
      } else {
        commentList = [...clientFind.customerRequirements, { ...customerRequirements }];
      }

      // Updating the client document with the added fields
      const updatedClient = await Client.findByIdAndUpdate(clientFind._id, { customerRequirements: commentList, submittedBy }, { new: true });

      //console.log('updatedClient', updatedClient);

      // Save the updated document to the database
      await updatedClient.save();

      res.status(200).json({ success: true, data: "Comment Added Successfully" });
    } else {
      res.status(404).json({ success: false, msg: 'No User Found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, msg: 'Internal Server Error' });
  }
});


// Function to get follow-up clients
exports.followUp = catchAsyncErrors(async (req, res) => {
  try {
    const userId = req.user.id;

    // Find clients submitted by the current user and marked for follow-up
    const followUpClients = await Client.find({ submittedBy: userId, followUp: true });

    // If no follow-up clients are found, return a 404 response
    if (followUpClients.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No follow-up clients found for the given user ID.',
      });
    }

    // If follow-up clients are found, return them in the response
    res.status(200).json({
      success: true,
      data: followUpClients,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
});


// Function to update user details
exports.updateClientReport = catchAsyncErrors(async (req, res) => {
  //console.log(req.body)
  let { mobileNumber, newCustomerRequirements, discounts, followUp, messageSend, package } = req.body;
  mobileNumber = mobileNumber.replace(/\D/g, '');
  let updatemobileNumber = mobileNumber; // Declare updatemobileNumber variable here

  // Check if the mobile number starts with "+91", if not, prepend it
  if (!mobileNumber.startsWith('91')) {
    updatemobileNumber = '+91' + mobileNumber;
    //console.log(updatemobileNumber);
  }

  try {
    // Find the client by mobile number
    const client = await Client.findOne({ mobileNumber: updatemobileNumber });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'No User Found With This Mobile Number!',
      });
    }

    // Update client details based on the request body
    if (package) {
      client.package = package;
    }
    if (newCustomerRequirements && Array.isArray(newCustomerRequirements)) {
      // Append new customer requirements to existing ones
      client.customerRequirements = client.customerRequirements.concat(newCustomerRequirements);
    }
    if (discounts !== undefined) {
      client.discounts = discounts;
    }
    if (followUp !== undefined) {
      client.followUp = followUp;
    }
    if (messageSend !== undefined) {
      client.messageSend = messageSend;
    }

    // Save the updated client details
    await client.save();

    // Send email with PDF attachment if necessary

    res.status(200).json({
      success: true,
      message: 'User Details Updated Successfully',
      client: client,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
});


//Function to get Client By Mobile Number

exports.GetClientByMobileNumber = catchAsyncErrors(async (req, res) => {
  try {
    let { mobileNumber } = req.body;
    //console.log(mobileNumber)
    // Remove any non-digit characters from the mobile number
    mobileNumber = mobileNumber.replace(/\D/g, '');

    let updatemobileNumber = mobileNumber; // Declare updatemobileNumber variable here

    // Check if the mobile number starts with "+91", if not, prepend it
    if (!mobileNumber.startsWith('91')) {
      updatemobileNumber = '+91' + mobileNumber;
      //console.log(updatemobileNumber)
    }

    // Check if the mobile number is linked with any client
    const client = await Client.findOne({ mobileNumber: updatemobileNumber });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "No User Found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User found",
      client
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

exports.deleteClients = catchAsyncErrors(async (req, res) => {
  try {
    const clientId = req.params.id;
    const deleteThisClient = await Client.findByIdAndDelete(clientId);

    if (!deleteThisClient) {
      return res.status(404).json({
        success: false,
        msg: 'Client not found'
      });
    }

    res.status(200).json({
      success: true,
      data: deleteThisClient
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      msg: 'Internal Server Error'
    });
  }
});

exports.BlockClientById = catchAsyncErrors(async (req, res) => {
  try {
    const id = req.params.id;
    const checkClient = await Client.findById(id);
    if (!checkClient) {
      return res.status(404).json({
        status: false,
        message: 'User Not Found'
      });
    }

    // Check client status and update if necessary
    if (checkClient.status === true) {
      checkClient.status = false;
      await checkClient.save(); // Save the updated client back to the database
    }
    else{
      return res.status(402).json({
        status: false,
        message: ' client Already Block'
      });
    }

    res.status(200).json({
      status: true,
      message: 'Client status updated successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: 'Internal Server Error'
    });
  }
});
exports.ShowBlockClients = catchAsyncErrors(async (req, res) => {
  try {
    const submitById = req.params.id;
    const blockClients = await Client.find({ submittedBy: submitById, status: false });

    if (!blockClients || blockClients.length === 0) {
      return res.status(404).json({
        status: false,
        message: 'No blocked clients found for the specified user ID'
      });
    }

    res.status(200).json({
      status: true,
      data: blockClients
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: 'Internal Server Error'
    });
  }
});



//download all client info in excel file
exports.downloadClientData = catchAsyncErrors(async (req, res) => {

  try {

    const client = await Client.find({})
    if (!client) {
      return res.status(404).json({
        success: false,
        message: "No User Found",
      });
    }

    //if client find
    const workBook = new ExcelJS.Workbook()
    const workSheet = workBook.addWorksheet('Clients')

    // Define the Excel columns and add a header row
    workSheet.columns = [
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Mobile Number', key: 'mobileNumber', width: 15 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Business Website Name', key: 'businessWebsiteName', width: 25 },
      { header: 'package', key: 'package', width: 25 },
      { header: 'customer Requirements', key: 'customerRequirements', width: 70 },
      { header: 'Discounts in %', key: 'discounts', width: 20 },
      { header: 'followUp', key: 'followUp', width: 20 },
      { header: 'submittedBy', key: 'submittedBy', width: 40 },
    ];
    // Populate the worksheet with client data
    client.forEach((client) => {
      workSheet.addRow({
        name: client.name,
        mobileNumber: client.mobileNumber,
        email: client.email,
        businessWebsiteName: client.businessWebsiteName,
        package: client.package,
        customerRequirements: client.customerRequirements,
        discounts: client.discounts,
        followUp: client.followUp,
        submittedBy: client.submittedBy


      });
    });

    // Set the response headers for Excel download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Clients.xlsx');

    // Generate and send the Excel file
    const buffer = await workBook.xlsx.writeBuffer();
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
});

// download attendece Sheet of Executives
exports.downloadAttendance = catchAsyncErrors(async (req, res) => {
  try {
    const employeeId = req.body()// Replace with the specific employee's ID

    // Fetch attendance data for the specific employee
    const attendanceData = await Attendnce.find({ employeeId });

    if (!attendanceData || attendanceData.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No attendance data found for the specified employee.',
      });
    }

    // Create an Excel workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Employee Attendance');

    // Define the Excel columns and add a header row
    worksheet.columns = [
      { header: 'Employee ID', key: 'employeeId', width: 15 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
    ];

    const attendanceSummary = {
      Absent: 0,
      Present: 0,
    };

    // Populate the worksheet with attendance data
    attendanceData.forEach((attendance) => {
      const date = moment(attendance.entryTime, 'hh:mm A');
      const status = attendance.attendanceStatus;

      worksheet.addRow({
        employeeId: attendance.employeeId,
        date: date.format('YYYY-MM-DD'),
        status: status,
      });

      // Calculate the total absence and presence
      if (status === 'Absent') {
        attendanceSummary.Absent += 1;
      } else if (status === 'Present') {
        attendanceSummary.Present += 1;
      }
    });

    // Add the summary row
    worksheet.addRow({});
    worksheet.addRow({
      employeeId: 'Total Absent',
      date: '',
      status: attendanceSummary.Absent,
    });
    worksheet.addRow({
      employeeId: 'Total Present',
      date: '',
      status: attendanceSummary.Present,
    });

    // Set the response headers for Excel download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Employee_Attendance_${employeeId}.xlsx`);

    // Generate and send the Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
});

exports.getClinetsByUserId = catchAsyncErrors(async (req, res) => {

  try {
    const user = req.user.id
    //console.log(user)
    const clients = await Client.find({ submittedBy: user })
    if (clients.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No clients found for the given user ID.'
      });
    }
    // Sending back a response  
    res.status(200).json({
      success: true,
      data: clients
    })
  } catch (error) {
    //console.log(error)
  }


})
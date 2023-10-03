const nodemailer = require('nodemailer');
const Client = require('../modals/clientData');
const { catchAsyncErrors } = require('../utility/catchAsync');
const path = require('path');
const fs = require('fs');
const moment = require('moment');

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
  const userId = req.user.id; 
    console.log(userId)
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
  console.log(req.body)
  let pdfFileName = '';
  let packagePDF = null;

  try {
    // Create a new client entry
    const newClient = new Client({
      name,
      mobileNumber,
      email,
      businessWebsiteName,
      package,
      customerRequirements,
      discounts,
      followUp,
      messageSend,
      followUpDate,
      submittedBy: userId
    });

    // Save the client entry to the database
    await newClient.save();

    // // Check if messageSend is true and package is specified
    if (messageSend && package) {
      switch (package.toLowerCase()) {
        case 'export-plan':
          pdfFileName = '../pdf/Expot Plan. (1)_compressed.pdf';
          break;
        case 'gold-membership':
          pdfFileName = '../pdf/Gold membership.,-1_compressed.pdf';
          break;
        case 'startup':
          pdfFileName = '../pdf/Startup Package Final_compressed.pdf';
          break;
        default:
          pdfFileName = null;
          break;
      }

      if (pdfFileName) {
        const pdfPath = path.join(__dirname, '../pdf', pdfFileName);
        packagePDF = fs.readFileSync(pdfPath);
      }

      // Send the email with the PDF attachment, passing 'package' as an argument
      await sendPdfMail(email, pdfFileName, package, packagePDF);
    }

    res.status(201).json({
      success: true,
      message: 'Client created successfully.',
      client: newClient,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
});

// Function to get follow-up clients
exports.followUp = catchAsyncErrors(async (req, res) => {
  try {
    const FollowUpClients = await Client.find({ followUp: true });
    res.status(200).json({
      success: true,
      data: FollowUpClients,
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
  const { mobileNumber, package, customerRequirements, discounts, followUp, messageSend } = req.body;

  try {
    // Find the client by mobile number
    const client = await Client.findOne({ mobileNumber });

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
    if (customerRequirements) {
      client.customerRequirements = customerRequirements;
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
    if (messageSend && package) {
      switch (package.toLowerCase()) {
        case 'export-plan':
          pdfFileName = '../pdf/Expot Plan. (1)_compressed.pdf';
          break;
        case 'gold-membership':
          pdfFileName = '../pdf/Gold membership.,-1_compressed.pdf';
          break;
        case 'startup':
          pdfFileName = '../pdf/Startup Package Final_compressed.pdf';
          break;
        default:
          pdfFileName = null;
          break;
      }

      if (pdfFileName) {
        const pdfPath = path.join(__dirname, '../pdf', pdfFileName);
        packagePDF = fs.readFileSync(pdfPath);
      }

      // Send the email with the PDF attachment, passing 'package' as an argument
      await sendPdfMail(client.email, pdfFileName, package, packagePDF);
    }

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
    const { mobileNumber } = req.body; // Correctly extract mobileNumber from the request body

    // Check if the mobile number is linked with any client
    const client = await Client.findOne({ mobileNumber });

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

//download all client info in excel file
exports.downloadClientData = catchAsyncErrors(async(req,res)=>{

try{

  const client = await Client.find({})
  if(!client){
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
      { header: 'customer Requirements', key: 'customerRequirements', width:70 },
      { header: 'Discounts in %', key: 'discounts', width:20 },
      { header: 'followUp', key: 'followUp', width:20 },
      { header: 'submittedBy', key: 'submittedBy', width:40 },
    ];
  // Populate the worksheet with client data
  client.forEach((client) => {
    workSheet.addRow({
      name: client.name,
      mobileNumber: client.mobileNumber,
      email: client.email,
      businessWebsiteName: client.businessWebsiteName,
      package: client.package,
      customerRequirements:client.customerRequirements,
      discounts:client.discounts,
      followUp : client.followUp ,
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

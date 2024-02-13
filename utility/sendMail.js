const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      auth: {
        user: "dgmtcrm@gmail.com",
        pass: "izgp pbxn axju twhb",
      },
    });

    const mailOptions = {
      from: "dgmtcrm@gmail.com",
      to: options.email,
      subject: options.subject,
      html: options.message, 
    };

    await transporter.sendMail(mailOptions);
    //console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = sendEmail;

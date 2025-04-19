var nodemailer = require("nodemailer");

const sendEmail = async (email, otp) => {
  var transporter = nodemailer.createTransport({
    // If using Gmail, it's easier to use the 'service' field.
    service: "gmail", // Use your specific service, if not Gmail
    auth: {
      user: process.env.MAIL, // Your email address
      pass: process.env.MAILPASS, // Your email password (or App Password)
    },
    tls: {
      rejectUnauthorized: false, // Allow insecure TLS connections (if needed)
    },
  });

  var mailOptions = {
    from: process.env.MAIL, // Sender address
    to: email, // Recipient address
    subject: "Tax Wakeel OTP",
    text: `Your what's app bot OTP is ${otp}`,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", result);
  } catch (error) {
    console.error("Error sending email: ", error);
    // Log the full error for better insight
    console.error("Full error: ", error.stack);
  }
};

module.exports = sendEmail;

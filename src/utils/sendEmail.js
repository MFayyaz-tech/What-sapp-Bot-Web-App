var nodemailer = require("nodemailer");

const sendEmail = async (email, otp) => {
  console.log(
    process.env.MAILHOST,
    process.env.MAILPORT,
    process.env.MAIL,
    process.env.MAILPASS
  );
  var transporter = nodemailer.createTransport({
    host: process.env.MAILHOST,
    port: process.env.MAILPORT,
    service: "gmail", // Use your specific service, if not Gmail
    auth: {
      user: "taxwakeels@gmail.com", // Your email address
      pass: process.env.MAILPASS, // Your email password (or App Password)
    },
    tls: {
      rejectUnauthorized: false, // Allow insecure TLS connections (if needed)
    },
  });

  var mailOptions = {
    from: "taxwakeels@gmail.com", // Sender address
    to: email, // Recipient address
    subject: "What's Bot OTP",
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

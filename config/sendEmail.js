const nodemailer = require("nodemailer");
const sendEmail = async (email, subject, message, html) => {
  console.log("sending Email");
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_SERVER,
    port: process.env.SMTP_PORT,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.STMP_LOGIN, // generated ethereal user
      pass: process.env.SMTP_PASS, // generated ethereal password
    },
  });
  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to: email,
    subject: subject,
    text: message,
    html: html,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log("Message sent: %s", info);
  return true;
};

module.exports = sendEmail;

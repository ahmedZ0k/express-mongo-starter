const nodemailer = require('nodemailer');

const sendEmail = async options => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    secure: true,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.AUTH_USER,
      pass: process.env.AUTH_PASS,
    },
  });
  const info = await transporter.sendMail({
    from: '? <support@resend.dev>',
    to: `${options.email}`,
    subject: `${options.subject}`,
    html: `${options.html}`,
  });

  console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;

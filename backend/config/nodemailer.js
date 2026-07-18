import nodemailer from 'nodemailer';

const isConfigured = 
  process.env.EMAIL_USER && 
  process.env.EMAIL_USER !== 'your_email@gmail.com';

let transporter;

if (isConfigured) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
} else {
  console.warn("WARNING: Nodemailer SMTP email credentials are not configured. Emails will be logged to console.");
  // Mock transporter
  transporter = {
    sendMail: async (mailOptions) => {
      console.log("=========================================");
      console.log("MOCK EMAIL SENT:");
      console.log(`To: ${mailOptions.to}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log(`Body:\n${mailOptions.text || mailOptions.html}`);
      console.log("=========================================");
      return { messageId: 'mock-id-' + Date.now() };
    }
  };
}

export { transporter, isConfigured };

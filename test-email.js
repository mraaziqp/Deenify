require('dotenv').config();
const nodemailer = require('nodemailer');

async function main() {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: process.env.SMTP_USER, // send to yourself for testing
    subject: 'SMTP Test Email',
    text: 'This is a test email from Deenify SMTP setup.',
  });

  console.log('Test email sent!');
}

main().catch(console.error);

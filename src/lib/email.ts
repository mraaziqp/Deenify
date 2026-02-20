import nodemailer from 'nodemailer';

export async function sendVerificationEmail(email: string, token: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.deenify.co.za'}/auth/verify-email?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'no-reply@deenify.co.za',
    to: email,
    subject: 'Verify your email for Deenify',
    html: `<p>Welcome to Deenify! Click the link below to verify your email:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
  });
}

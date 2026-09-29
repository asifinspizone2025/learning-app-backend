const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465, // true for port 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const sendOtpEmail = async (toEmail, otp) => {
  await transporter.sendMail({
    from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: 'Your Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background-color: #FFF8FB; border-radius: 16px;">
        <h2 style="color: #9A145A;">Verify Your Email</h2>
        <p style="color: #333; font-size: 15px;">Use the code below to verify your email address. This code is valid for 3 minutes.</p>
        <div style="background: #9A145A; color: #fff; font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 16px; border-radius: 12px; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: #888; font-size: 13px;">If you did not request this, please ignore this email.</p>
      </div>
    `,
  });
};

module.exports = sendOtpEmail;
import nodemailer from 'nodemailer';
import { emailTemplates } from '../templates/emailTemplates.js';

// ✅ Lazy — created on first use, after dotenv has loaded
let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

    transporter = nodemailer.createTransport(
    process.env.EMAIL_SERVICE
      ? {
          service: process.env.EMAIL_SERVICE,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
        }
      : {
          host: process.env.EMAIL_HOST,
          port: parseInt(process.env.EMAIL_PORT || '587', 10),
          secure: process.env.EMAIL_SECURE === 'true',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
        }
  );

  return transporter;
};

export const sendEmail = async ({ to, subject, templateName, templateData }) => {
  try {
    const htmlContent = emailTemplates[templateName](...Object.values(templateData));

    const mailOptions = {
      from: `"ATS Platform" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    };

    const info = await getTransporter().sendMail(mailOptions);
    console.log(`✅ Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw new Error('Failed to send email');
  }
};

export const sendVerificationEmail = (email, name, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${token}`;
  return sendEmail({
    to: email,
    subject: 'Verify Your Email Address - ATS Platform',
    templateName: 'verification',
    templateData: { name, verificationUrl },
  });
};

export const sendPasswordResetEmail = (email, name, token) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${token}`;
  return sendEmail({
    to: email,
    subject: 'Reset Your Password',
    templateName: 'passwordReset',
    templateData: { name, resetUrl },
  });
};

export default { sendEmail, sendVerificationEmail, sendPasswordResetEmail };
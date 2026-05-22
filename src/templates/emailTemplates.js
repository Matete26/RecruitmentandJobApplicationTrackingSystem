import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const loadTemplate = (name) => {
  return fs.readFileSync(path.join(__dirname, 'components', name), 'utf8');
};

const header = loadTemplate('header.html');
const footer = loadTemplate('footer.html');

/**
 * Full Email Templates
 */
export const emailTemplates = {
  // Email Verification
  verification: (name, verificationUrl) => `
    ${header}
    <div style="padding: 30px; background-color: #f9fafb; font-family: Arial, sans-serif;">
      <h2 style="color: #1f2937;">Welcome to ATS Platform, ${name}!</h2>
      <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">
        Thank you for signing up. Please verify your email address to activate your account.
      </p>
      
      <a href="${verificationUrl}" 
         style="display: inline-block; background-color: #4f46e5; color: white; 
                padding: 14px 28px; text-decoration: none; border-radius: 8px; 
                font-weight: bold; margin: 25px 0;">
        Verify My Email
      </a>
      
      <p style="color: #6b7280;">This link will expire in 24 hours.</p>
      
      <p style="font-size: 14px; color: #6b7280;">
        If you didn't create an account, please ignore this email.
      </p>
    </div>
    ${footer}
  `,

  // Password Reset
  passwordReset: (name, resetUrl) => `
    ${header}
    <div style="padding: 30px; background-color: #f9fafb;">
      <h2 style="color: #1f2937;">Password Reset Request</h2>
      <p>Hello ${name},</p>
      <p>You requested to reset your password. Click the button below to set a new password:</p>
      
      <a href="${resetUrl}" 
         style="display: inline-block; background-color: #dc2626; color: white; 
                padding: 14px 28px; text-decoration: none; border-radius: 8px; 
                font-weight: bold; margin: 20px 0;">
        Reset Password
      </a>
      
      <p style="color: #6b7280;">This link expires in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
    ${footer}
  `,

  // Application Status Update
  applicationStatus: (name, jobTitle, status, company = "Our Company") => `
    ${header}
    <div style="padding: 30px; background-color: #f9fafb;">
      <h2>Application Update</h2>
      <p>Hi ${name},</p>
      <p>Your application for <strong>${jobTitle}</strong> has been updated.</p>
      
      <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0;">Status: <span style="color: #4f46e5;">${status.toUpperCase()}</span></h3>
      </div>
      
      <p>Thank you for your interest in joining ${company}.</p>
    </div>
    ${footer}
  `,

  // Interview Invitation
  interviewInvite: (name, jobTitle, date, time, location, meetingLink) => `
    ${header}
    <div style="padding: 30px; background-color: #f9fafb;">
      <h2>Interview Invitation</h2>
      <p>Dear ${name},</p>
      <p>Congratulations! You have been shortlisted for an interview for the position of <strong>${jobTitle}</strong>.</p>
      
      <div style="background: white; padding: 20px; border-radius: 8px;">
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Type:</strong> ${location}</p>
        ${meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ''}
      </div>
      
      <a href="${meetingLink || '#'}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
        Join Interview
      </a>
    </div>
    ${footer}
  `,

  // Offer Letter
  jobOffer: (name, jobTitle, salary, startDate) => `
    ${header}
    <div style="padding: 30px; background-color: #f9fafb;">
      <h2>Congratulations, ${name}!</h2>
      <p>We are pleased to extend you a formal offer for the position of <strong>${jobTitle}</strong>.</p>
      
      <div style="background: white; padding: 25px; border-radius: 8px; margin: 20px 0;">
        <h3>Offer Details</h3>
        <p><strong>Salary:</strong> $${salary}</p>
        <p><strong>Start Date:</strong> ${startDate}</p>
      </div>
      
      <p>We look forward to welcoming you to the team!</p>
    </div>
    ${footer}
  `
};

export default emailTemplates;
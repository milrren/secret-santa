import nodemailer from 'nodemailer';

/**
 * Returns a configured Nodemailer transporter for Gmail SMTP.
 * Expects GMAIL_USER and GMAIL_APP_PASSWORD environment variables.
 */
export const getGmailTransporter = () => {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    throw new Error('Gmail credentials not configured');
  }
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
};

/** Helper to quickly check if mail is configured. */
export const isMailConfigured = () => {
  return !!process.env.GMAIL_USER && !!process.env.GMAIL_APP_PASSWORD;
};

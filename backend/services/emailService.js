import nodemailer from 'nodemailer';

const createTransporter = () => {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

export const sendPasswordResetEmail = async (email, resetUrl) => {
  const transporter = createTransporter();
  const from = process.env.EMAIL_FROM || 'LifeLink <noreply@lifelink.app>';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">LifeLink Password Reset</h2>
      <p>You requested a password reset. Click the button below to set a new password. This link expires in 10 minutes.</p>
      <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">Reset Password</a>
      <p style="color: #6b7280; font-size: 14px;">If you did not request this, you can safely ignore this email.</p>
      <p style="color: #9ca3af; font-size: 12px; word-break: break-all;">${resetUrl}</p>
    </div>
  `;

  if (!transporter) {
    console.log('[LifeLink] Password reset link (configure EMAIL_* to send mail):');
    console.log(resetUrl);
    return;
  }

  await transporter.sendMail({
    from,
    to: email,
    subject: 'LifeLink – Reset your password',
    html,
  });
};

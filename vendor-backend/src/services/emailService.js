const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: Number(process.env.EMAIL_PORT) === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendVerificationEmail(email, token, firstName) {
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Email service is not configured. Set EMAIL_HOST, EMAIL_USER, and EMAIL_PASS.');
    }

    const escapeHtml = (value) =>
      String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const defaultFrontendUrl = 'http://localhost:5173';
    const envFrontendUrl = process.env.FRONTEND_URL;
    let baseUrl = defaultFrontendUrl;

    if (envFrontendUrl) {
      try {
        const parsedUrl = new URL(envFrontendUrl);
        if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
          baseUrl = parsedUrl.origin;
        }
      } catch (e) {
        baseUrl = defaultFrontendUrl;
      }
    }

    const verificationUrl = new URL(`/verify-email/${encodeURIComponent(token)}`, baseUrl).toString();
    const safeName = escapeHtml(firstName);
    const safeUrl = escapeHtml(verificationUrl);
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Email - Small Business Directory',
      html: `
        <h2>Welcome ${safeName}!</h2>
        <p>Thank you for registering with Small Business Directory.</p>
        <p>Please click the link below to verify your email address:</p>
        <a href="${safeUrl}" style="
          display: inline-block;
          padding: 10px 20px;
          background-color: #007bff;
          color: white;
          text-decoration: none;
          border-radius: 5px;
        ">Verify Email</a>
        <p>Or copy this link: ${safeUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, please ignore this email.</p>
      `
    };

    await this.transporter.sendMail(mailOptions);
    return { success: true, message: 'Verification email sent' };
  }
}

module.exports = new EmailService();

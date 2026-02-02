const nodemailer = require('nodemailer');

// Mock email service - logs to console instead of sending real emails
class EmailService {
  constructor() {
    // In production, this would use real SMTP credentials
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendVerificationEmail(email, token, firstName) {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Email - Small Business Directory',
      html: `
        <h2>Welcome ${firstName}!</h2>
        <p>Thank you for registering with Small Business Directory.</p>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}" style="
          display: inline-block;
          padding: 10px 20px;
          background-color: #007bff;
          color: white;
          text-decoration: none;
          border-radius: 5px;
        ">Verify Email</a>
        <p>Or copy this link: ${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, please ignore this email.</p>
      `
    };

    // MOCK MODE: Log to console instead of sending
    console.log('\n📧 ===== EMAIL VERIFICATION (MOCK) =====');
    console.log('To:', email);
    console.log('Subject:', mailOptions.subject);
    console.log('Verification URL:', verificationUrl);
    console.log('Token:', token);
    console.log('========================================\n');

    // In production, uncomment this to actually send:
    // await this.transporter.sendMail(mailOptions);
    
    return { success: true, message: 'Verification email logged to console' };
  }
}

module.exports = new EmailService();

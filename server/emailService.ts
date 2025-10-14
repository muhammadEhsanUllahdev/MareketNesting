import nodemailer from 'nodemailer';
import { randomBytes } from 'crypto';

// Create transporter using the SMTP credentials
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private fromEmail = process.env.SMTP_USER || 'test@devnaza.com';

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"E-commerce Marketplace" <${this.fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  async sendWelcomeEmail(email: string, username: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to E-commerce Marketplace</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Welcome to E-commerce Marketplace!</h1>
        </div>
        <div class="content">
          <h2>Hello ${username}!</h2>
          <p>Thank you for joining our marketplace. We're excited to have you as part of our community.</p>
          <p>With your account, you can:</p>
          <ul>
            <li>Browse thousands of products from verified sellers</li>
            <li>Track your orders and manage your profile</li>
            <li>Enjoy secure payments and fast delivery</li>
            <li>Get exclusive deals and offers</li>
          </ul>
          <p>Start exploring our marketplace and find amazing products!</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}" class="button">Start Shopping</a>
        </div>
        <div class="footer">
          <p>Thank you for choosing E-commerce Marketplace</p>
          <p>If you have any questions, feel free to contact our support team.</p>
        </div>
      </body>
      </html>
    `;

    const text = `
      Welcome to E-commerce Marketplace!
      
      Hello ${username}!
      
      Thank you for joining our marketplace. We're excited to have you as part of our community.
      
      With your account, you can:
      - Browse thousands of products from verified sellers
      - Track your orders and manage your profile
      - Enjoy secure payments and fast delivery
      - Get exclusive deals and offers
      
      Start exploring our marketplace and find amazing products!
      
      Visit: ${process.env.FRONTEND_URL || 'http://localhost:5000'}
      
      Thank you for choosing E-commerce Marketplace
    `;

    return this.sendEmail({
      to: email,
      subject: 'Welcome to E-commerce Marketplace',
      html,
      text,
    });
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/reset-password?token=${resetToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Request</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Reset Your Password</h2>
          <p>We received a request to reset your password for your E-commerce Marketplace account.</p>
          <p>Click the button below to reset your password:</p>
          <a href="${resetUrl}" class="button">Reset Password</a>
          <div class="warning">
            <p><strong>Important:</strong></p>
            <ul>
              <li>This link will expire in 1 hour</li>
              <li>If you didn't request this reset, please ignore this email</li>
              <li>Your password won't be changed unless you click the link above</li>
            </ul>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #f1f1f1; padding: 10px; border-radius: 5px;">${resetUrl}</p>
        </div>
        <div class="footer">
          <p>This email was sent from E-commerce Marketplace</p>
          <p>If you have any questions, contact our support team.</p>
        </div>
      </body>
      </html>
    `;

    const text = `
      Password Reset Request
      
      We received a request to reset your password for your E-commerce Marketplace account.
      
      Click this link to reset your password: ${resetUrl}
      
      Important:
      - This link will expire in 1 hour
      - If you didn't request this reset, please ignore this email
      - Your password won't be changed unless you click the link above
      
      This email was sent from E-commerce Marketplace
    `;

    return this.sendEmail({
      to: email,
      subject: 'Password Reset Request - E-commerce Marketplace',
      html,
      text,
    });
  }

  generateResetToken(): string {
    return randomBytes(32).toString('hex');
  }

  generateVerificationToken(): string {
    return randomBytes(32).toString('hex');
  }

  async sendEmailVerification(email: string, username: string, verificationToken: string): Promise<boolean> {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/verify-email?token=${verificationToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - E-commerce Marketplace</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .warning { background: #e3f2fd; border: 1px solid #2196f3; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Verify Your Email Address</h1>
        </div>
        <div class="content">
          <h2>Hello ${username}!</h2>
          <p>Thank you for registering with E-commerce Marketplace. To complete your registration, please verify your email address by clicking the button below:</p>
          
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verify Your Email</a>
          </div>
          
          <div class="warning">
            <p><strong>Important:</strong></p>
            <ul>
              <li>This verification link is required to activate your account</li>
              <li>Click the button above to verify your email address</li>
              <li>If you didn't create this account, please ignore this email</li>
            </ul>
          </div>
          
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #f1f1f1; padding: 10px; border-radius: 5px;">${verificationUrl}</p>
        </div>
        <div class="footer">
          <p>This email was sent from E-commerce Marketplace</p>
          <p>Please do not reply to this email.</p>
        </div>
      </body>
      </html>
    `;

    const text = `
      Verify Your Email Address
      
      Hello ${username}!
      
      Thank you for registering with E-commerce Marketplace. To complete your registration, please verify your email address by clicking this link:
      
      ${verificationUrl}
      
      Important:
      - This verification link is required to activate your account
      - If you didn't create this account, please ignore this email
      
      This email was sent from E-commerce Marketplace
    `;

    return this.sendEmail({
      to: email,
      subject: 'Verify Your Email - E-commerce Marketplace',
      html,
      text,
    });
  }

  async sendSellerApprovalNotification(email: string, username: string, isApproved: boolean): Promise<boolean> {
    const subject = isApproved ? 'Seller Application Approved!' : 'Seller Application Status Update';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, ${isApproved ? '#28a745' : '#dc3545'} 0%, ${isApproved ? '#20c997' : '#c82333'} 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${isApproved ? '🎉 Congratulations!' : '📋 Application Update'}</h1>
        </div>
        <div class="content">
          <h2>Hello ${username}!</h2>
          ${isApproved ? `
            <p>Great news! Your seller application has been approved by our admin team.</p>
            <p>You can now:</p>
            <ul>
              <li>Access your seller dashboard</li>
              <li>Add and manage your products</li>
              <li>Start selling to customers worldwide</li>
              <li>Track your sales and earnings</li>
            </ul>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/dashboard/seller" class="button">Access Seller Dashboard</a>
          ` : `
            <p>Thank you for your interest in becoming a seller on our marketplace.</p>
            <p>After careful review, we are unable to approve your seller application at this time.</p>
            <p>This decision may be due to:</p>
            <ul>
              <li>Incomplete application information</li>
              <li>Documentation requirements not met</li>
              <li>Other verification issues</li>
            </ul>
            <p>You're welcome to contact our support team for more information or to reapply in the future.</p>
          `}
        </div>
        <div class="footer">
          <p>Thank you for choosing E-commerce Marketplace</p>
        </div>
      </body>
      </html>
    `;

    const text = `
      ${subject}
      
      Hello ${username}!
      
      ${isApproved ? 
        `Great news! Your seller application has been approved. You can now access your seller dashboard and start selling.` :
        `Thank you for your interest in becoming a seller. We are unable to approve your application at this time. Please contact support for more information.`
      }
      
      Visit: ${process.env.FRONTEND_URL || 'http://localhost:5000'}
    `;

    return this.sendEmail({
      to: email,
      subject,
      html,
      text,
    });
  }
}

export const emailService = new EmailService();
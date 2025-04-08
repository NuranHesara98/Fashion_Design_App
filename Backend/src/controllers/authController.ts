import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser, IUserDocument } from '../models/userModel';
import OTP from '../models/otpModel';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Configure nodemailer with a function to create a fresh transporter each time
const createTransporter = () => {
  // Check if we're in production (like on Render.com)
  const isProduction = process.env.NODE_ENV === 'production';
  
  console.log(`Creating email transporter in ${isProduction ? 'production' : 'development'} mode`);
  
  // Log email configuration (without showing full password)
  console.log('Email configuration:', {
    user: process.env.EMAIL_USER ? process.env.EMAIL_USER : 'Not set',
    pass: process.env.EMAIL_APP_PASSWORD ? '****' + (process.env.EMAIL_APP_PASSWORD.length > 4 ? process.env.EMAIL_APP_PASSWORD.substring(process.env.EMAIL_APP_PASSWORD.length - 4) : '') : 'Not set'
  });
  
  // Create and return a fresh transporter
  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,  // Use port 465 with SSL for better reliability
    secure: true, // Use SSL
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    },
    debug: true, // Enable debug output
    logger: true // Log information about the mail transport
  });
};

// Test the email configuration at startup, but don't block server startup if it fails
// Skip this test if SKIP_EMAIL_VERIFICATION is set to true
if (process.env.SKIP_EMAIL_VERIFICATION !== 'true') {
  (async () => {
    try {
      const testTransporter = createTransporter();
      await testTransporter.verify();
      console.log('✅ Email server is ready to send messages');
    } catch (error) {
      console.error('❌ Email configuration error:', error);
      console.log('⚠️ Server will continue to run, but email functionality may not work');
    }
  })();
} else {
  console.log('ℹ️ Email verification at startup is skipped (SKIP_EMAIL_VERIFICATION=true)');
}

// Generate 4-digit OTP
const generateOTP = (): string => {
  // Generate a random number between 1000 and 9999
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Send OTP via email
const sendOTPEmail = async (email: string, otp: string, name?: string): Promise<boolean> => {
  try {
    const greeting = name ? `Hello ${name},` : 'Hello,';
    
    const mailOptions = {
      from: {
        name: 'DressMe Security',
        address: process.env.EMAIL_USER as string
      },
      to: email,
      subject: '🔐 Your DressMe Security Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="color-scheme" content="light">
          <meta name="supported-color-schemes" content="light">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="padding: 40px 30px;">
                      <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #1a1a1a; margin: 0; font-size: 28px; font-weight: 600;">Security Verification</h1>
                        <p style="color: #666666; font-size: 16px; margin-top: 10px;">Your Fashion Journey Awaits</p>
                      </div>
                      
                      <div style="background: linear-gradient(145deg, #f8f9fa, #ffffff); padding: 30px; border-radius: 12px; margin-bottom: 30px; border: 1px solid #e9ecef;">
                        <p style="color: #1a1a1a; font-size: 16px; margin: 0 0 20px 0;">${greeting}</p>
                        <p style="color: #1a1a1a; font-size: 16px; line-height: 1.6;">We received a request to verify your identity. Use the code below to complete the process:</p>
                        
                        <div style="background-color: #ffffff; padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center; border: 2px dashed #007bff;">
                          <h2 style="color: #007bff; letter-spacing: 8px; margin: 0; font-size: 36px; font-weight: 700;">${otp}</h2>
                          <p style="color: #666666; font-size: 14px; margin: 10px 0 0 0;">This code expires in 5 minutes</p>
            </div>
            
                        <div style="background-color: #fff4f4; padding: 20px; border-radius: 12px; margin-top: 25px; border-left: 4px solid #dc3545;">
                          <h3 style="color: #dc3545; margin: 0 0 15px 0; font-size: 18px;">🔒 Security Tips:</h3>
                          <ul style="color: #666666; margin: 0; padding-left: 20px; line-height: 1.8;">
              <li>Never share this code with anyone</li>
                            <li>Our team will never ask for this code</li>
                            <li>Verify the sender's email address</li>
                            <li>If you didn't request this code, please ignore this email</li>
            </ul>
                        </div>
          </div>
          
                      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                        <p style="color: #666666; font-size: 14px; margin: 0;">Need help? Contact our support team</p>
                        <p style="color: #666666; font-size: 12px; margin: 10px 0 0 0;">© ${new Date().getFullYear()} DressMe. All rights reserved.</p>
          </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    };

    const emailTransporter = createTransporter();
    await emailTransporter.sendMail(mailOptions);
    return true;
  } catch (error: any) {
    console.error('Email sending error:', error.message);
    return false;
  }
};

// Send verification email
const sendVerificationEmail = async (email: string, verificationToken: string): Promise<boolean> => {
  try {
    if (!process.env.FRONTEND_URL) {
      return false;
    }

    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5024'}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;

    const mailOptions: nodemailer.SendMailOptions = {
      from: {
        name: 'DressMe',
        address: process.env.EMAIL_USER as string
      },
      to: email,
      subject: '✨ Welcome to DressMe - Verify Your Email',
      priority: 'high' as const,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      },
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="color-scheme" content="light">
          <meta name="supported-color-schemes" content="light">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="padding: 40px 30px;">
                      <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #1a1a1a; margin: 0; font-size: 32px; font-weight: 600;">Welcome to DressMe! 🎉</h1>
                        <p style="color: #666666; font-size: 18px; margin-top: 10px;">Where Fashion Dreams Come to Life</p>
                      </div>
                      
                      <div style="background: linear-gradient(145deg, #f8f9fa, #ffffff); padding: 35px; border-radius: 12px; margin: 20px 0; border: 1px solid #e9ecef;">
                        <p style="color: #1a1a1a; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0;">We're thrilled to have you join our creative community! Your journey in fashion design begins here. 🌟</p>
                      
                        <p style="color: #1a1a1a; font-size: 16px; line-height: 1.8; margin: 0 0 25px 0;">To get started and unlock all features, please verify your email address:</p>
                      
                        <div style="text-align: center; margin: 35px 0;">
                        <a href="${verificationUrl}" 
                             style="display: inline-block; background: linear-gradient(145deg, #007bff, #0056b3); color: white; padding: 16px 35px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; transition: all 0.3s ease; text-transform: uppercase; letter-spacing: 1px;">
                            Verify My Email
                          </a>
                        </div>

                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 12px; margin-top: 25px;">
                          <p style="color: #666666; font-size: 14px; margin: 0 0 10px 0;">Or copy this link into your browser:</p>
                          <p style="background-color: #ffffff; padding: 12px; border-radius: 6px; word-break: break-all; font-size: 14px; margin: 0; color: #007bff; border: 1px solid #dee2e6;">${verificationUrl}</p>
                        </div>
                      </div>

                      <div style="background: linear-gradient(145deg, #f8f9fa, #ffffff); padding: 25px; border-radius: 12px; margin-top: 25px; border: 1px solid #e9ecef;">
                        <h3 style="color: #1a1a1a; margin: 0 0 20px 0; font-size: 20px;">✨ What's Next?</h3>
                        <div style="display: grid; gap: 15px;">
                          <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #dee2e6;">
                            <h4 style="color: #007bff; margin: 0 0 5px 0;">🎨 Complete Your Profile</h4>
                            <p style="color: #666666; margin: 0; font-size: 14px;">Add your bio, portfolio, and showcase your style</p>
                          </div>
                          <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #dee2e6;">
                            <h4 style="color: #007bff; margin: 0 0 5px 0;">🛠️ Explore Design Tools</h4>
                            <p style="color: #666666; margin: 0; font-size: 14px;">Access our powerful design features</p>
                          </div>
                          <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #dee2e6;">
                            <h4 style="color: #007bff; margin: 0 0 5px 0;">🤝 Connect & Collaborate</h4>
                            <p style="color: #666666; margin: 0; font-size: 14px;">Join our community of designers</p>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="background: linear-gradient(145deg, #f8f9fa, #ffffff); padding: 25px 30px; border-radius: 0 0 16px 16px; border-top: 1px solid #e9ecef;">
                      <div style="text-align: center;">
                        <p style="color: #666666; font-size: 14px; margin: 0 0 10px 0;">Need help? Our support team is here for you 24/7</p>
                        <p style="color: #666666; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} DressMe. All rights reserved.</p>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    };

    const emailTransporter = createTransporter();
    const info = await emailTransporter.sendMail(mailOptions);
    console.log('Verification email sent successfully:', (info as any)?.messageId || 'No message ID');
    return true;
  } catch (error: any) {
    console.error('Email sending error:', error);
    return false;
  }
};

// Send account activity notification
const sendActivityNotification = async (email: string, activity: string, location?: string): Promise<boolean> => {
  try {
    const mailOptions = {
      from: {
        name: 'DressMe Security',
        address: process.env.EMAIL_USER as string
      },
      to: email,
      subject: '🔔 DressMe Security Alert',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="color-scheme" content="light">
          <meta name="supported-color-schemes" content="light">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="padding: 40px 30px;">
                      <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #1a1a1a; margin: 0; font-size: 28px; font-weight: 600;">Security Alert 🔒</h1>
                        <p style="color: #666666; font-size: 16px; margin-top: 10px;">Keeping Your Account Safe</p>
            </div>
            
                      <div style="background: linear-gradient(145deg, #f8f9fa, #ffffff); padding: 30px; border-radius: 12px; margin-bottom: 30px; border: 1px solid #e9ecef;">
                        <p style="color: #1a1a1a; font-size: 16px; margin: 0 0 20px 0;">Hello,</p>
                        <p style="color: #1a1a1a; font-size: 16px; line-height: 1.6;">We detected the following activity on your DressMe account:</p>
                        
                        <div style="background-color: #ffffff; padding: 25px; border-radius: 12px; margin: 25px 0; border: 1px solid #dee2e6;">
                          <table style="width: 100%; border-collapse: separate; border-spacing: 0 10px;">
                            <tr>
                              <td style="padding: 12px; background-color: #f8f9fa; border-radius: 8px;">
                                <strong style="color: #1a1a1a;">Activity:</strong>
                              </td>
                              <td style="padding: 12px; background-color: #f8f9fa; border-radius: 8px; color: #007bff;">
                                ${activity}
                              </td>
                            </tr>
                            ${location ? `
                            <tr>
                              <td style="padding: 12px; background-color: #f8f9fa; border-radius: 8px;">
                                <strong style="color: #1a1a1a;">Location:</strong>
                              </td>
                              <td style="padding: 12px; background-color: #f8f9fa; border-radius: 8px; color: #007bff;">
                                ${location}
                              </td>
                            </tr>
                            ` : ''}
                            <tr>
                              <td style="padding: 12px; background-color: #f8f9fa; border-radius: 8px;">
                                <strong style="color: #1a1a1a;">Time:</strong>
                              </td>
                              <td style="padding: 12px; background-color: #f8f9fa; border-radius: 8px; color: #007bff;">
                                ${new Date().toLocaleString()}
                              </td>
                            </tr>
                          </table>
          </div>
          
                        <div style="background-color: #fff4f4; padding: 25px; border-radius: 12px; margin-top: 25px; border-left: 4px solid #dc3545;">
                          <h3 style="color: #dc3545; margin: 0 0 15px 0; font-size: 18px;">⚠️ If this wasn't you:</h3>
                          <div style="display: grid; gap: 15px;">
                            <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #ffcdd2;">
                              <h4 style="color: #dc3545; margin: 0 0 5px 0;">🔑 Change Password</h4>
                              <p style="color: #666666; margin: 0; font-size: 14px;">Update your password immediately</p>
                            </div>
                            <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #ffcdd2;">
                              <h4 style="color: #dc3545; margin: 0 0 5px 0;">🔐 Enable 2FA</h4>
                              <p style="color: #666666; margin: 0; font-size: 14px;">Add an extra layer of security</p>
                            </div>
                            <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #ffcdd2;">
                              <h4 style="color: #dc3545; margin: 0 0 5px 0;">📞 Contact Support</h4>
                              <p style="color: #666666; margin: 0; font-size: 14px;">Report suspicious activity</p>
                            </div>
                          </div>
          </div>
        </div>
                      
                      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                        <p style="color: #666666; font-size: 14px; margin: 0;">Questions? Contact DressMe Support</p>
                        <p style="color: #666666; font-size: 12px; margin: 10px 0 0 0;">© ${new Date().getFullYear()} DressMe. All rights reserved.</p>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    };

    const emailTransporter = createTransporter();
    await emailTransporter.sendMail(mailOptions);
    return true;
  } catch (error: any) {
    console.error('Email sending error:', error.message);
    return false;
  }
};

// Send welcome email
const sendWelcomeEmail = async (email: string, name: string): Promise<boolean> => {
  try {
    console.log(`Attempting to send welcome email to ${email}`);
    
    // Check if we're in test mode (for deployment environments where email might not work)
    if (process.env.NODE_ENV === 'test' || process.env.MOCK_EMAILS === 'true') {
      console.log('ℹ️ Running in test mode or MOCK_EMAILS=true, simulating successful email sending');
      return true;
    }
    
    // Verify email configuration first
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
      console.error('Email configuration missing: EMAIL_USER or EMAIL_APP_PASSWORD not set');
      return false;
    }
    
    const mailOptions = {
      from: {
        name: 'DressMe Team',
        address: process.env.EMAIL_USER as string
      },
      to: email,
      subject: '👋 Welcome to DressMe!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="color-scheme" content="light">
          <meta name="supported-color-schemes" content="light">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="padding: 40px 30px;">
                      <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #1a1a1a; margin: 0; font-size: 28px; font-weight: 600;">Welcome to DressMe!</h1>
                        <p style="color: #666666; font-size: 16px; margin-top: 10px;">Your Fashion Journey Begins Now</p>
                      </div>
                      
                      <div style="background: linear-gradient(145deg, #f8f9fa, #ffffff); padding: 30px; border-radius: 12px; margin-bottom: 30px; border: 1px solid #e9ecef;">
                        <p style="color: #1a1a1a; font-size: 16px; margin: 0 0 20px 0;">Hello ${name},</p>
                        <p style="color: #1a1a1a; font-size: 16px; line-height: 1.6;">Thank you for joining DressMe! We're thrilled to have you as part of our community of fashion enthusiasts.</p>
                        
                        <div style="background-color: #f0f7ff; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #007bff;">
                          <h3 style="color: #007bff; margin: 0 0 15px 0; font-size: 18px;">✨ What you can do with DressMe:</h3>
                          <ul style="color: #666666; margin: 0; padding-left: 20px; line-height: 1.8;">
                            <li><strong>Upload your sketches</strong> and see them transformed into realistic designs</li>
                            <li><strong>Customize</strong> your fashion items with our intuitive tools</li>
                            <li><strong>Save your favorite designs</strong> for future reference</li>
                            <li><strong>Share your creations</strong> with friends and on social media</li>
                          </ul>
                        </div>
                        
                        <p style="color: #1a1a1a; font-size: 16px; line-height: 1.6; margin-top: 25px;">We can't wait to see what you create! If you have any questions, our help center is always available.</p>
                        
                        <div style="text-align: center; margin-top: 30px;">
                          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Start Designing Now</a>
                        </div>
                      </div>
                      
                      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                        <p style="color: #666666; font-size: 14px; margin: 0;">Need help? Contact our support team</p>
                        <p style="color: #666666; font-size: 12px; margin: 10px 0 0 0;">© ${new Date().getFullYear()} DressMe. All rights reserved.</p>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    };

    console.log('Sending welcome email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    // Create a fresh transporter for this email
    const emailTransporter = createTransporter();
    
    // Send the email
    const info = await emailTransporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return false;
  }
};

interface RegisterBody {
  firstName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface LoginBody {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    bio?: string;
    phoneNumber?: string;
    location?: string;
    specialization?: string;
    socialLinks?: {
      instagram?: string;
      linkedin?: string;
      website?: string;
    };
  };
  token?: string;
}

interface ForgotPasswordBody {
  email: string;
}

interface VerifyOTPBody {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

// Register new user
export const register = async (
  req: Request<{}, {}, RegisterBody>,
  res: Response<AuthResponse>
): Promise<Response<AuthResponse>> => {
  try {
    const { firstName, email, password, confirmPassword } = req.body;

    // Validate required fields
    if (!firstName || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide first name, email, password and confirm password'
      });
    }

    // Validate name fields
    if (firstName.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'First name must be at least 2 characters long'
      });
    }

    // Validate name format (letters, spaces, and hyphens only)
    const nameRegex = /^[a-zA-Z\s-]+$/;
    if (!nameRegex.test(firstName)) {
      return res.status(400).json({
        success: false,
        message: 'Names can only contain letters, spaces, and hyphens'
      });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    // Enhanced password validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    // Check for at least one number
    if (!/\d/.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one number'
      });
    }

    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one uppercase letter'
      });
    }

    // Check for at least one lowercase letter
    if (!/[a-z]/.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one lowercase letter'
      });
    }

    // Check for at least one special character
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one special character'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    const user = await User.create({
      firstName,
      email,
      password,
      isEmailVerified: true,
      verificationToken: null,
      lastLogin: new Date()
    });

    // Generate JWT token for the user
    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Send welcome email - but don't block registration if it fails
    // We'll do this in the background
    process.nextTick(async () => {
      try {
        // Log that we're attempting to send welcome email
        console.log(`Attempting to send welcome email to ${user.email}`);
        
        // Try to send the welcome email
        const emailSent = await sendWelcomeEmail(user.email, user.firstName);
        console.log(`Welcome email sending result: ${emailSent ? 'Success ✅' : 'Failed ❌'}`);
        
        // If first attempt fails and we're not in a test environment, try again after a delay
        if (!emailSent && process.env.NODE_ENV !== 'test' && process.env.MOCK_EMAILS !== 'true') {
          console.log('First attempt failed, will retry after delay...');
          
          // Retry after 5 seconds
          setTimeout(async () => {
            try {
              console.log(`Retrying welcome email to ${user.email}`);
              const retryResult = await sendWelcomeEmail(user.email, user.firstName);
              console.log(`Welcome email retry result: ${retryResult ? 'Success ✅' : 'Failed ❌'}`);
            } catch (retryError) {
              console.error('Error in welcome email retry:', retryError);
            }
          }, 5000); // 5 second delay before retry
        }
      } catch (emailError) {
        console.error('Error in welcome email process:', emailError);
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.firstName
      }
    });
  } catch (error: unknown) {
    if (error instanceof mongoose.Error.ValidationError) {
      const firstError = Object.values(error.errors)[0];
      return res.status(400).json({
        success: false,
        message: firstError.message
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Error registering user'
    });
  }
};

// Login user
export const login = async (
  req: Request<{}, {}, LoginBody>,
  res: Response<AuthResponse>
): Promise<Response<AuthResponse>> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = jwt.sign(
      { id: user._id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    user.lastLogin = new Date();
    await user.save();

    await sendActivityNotification(user.email, 'New login to your account');

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        name: user.firstName
      },
      token
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error logging in'
    });
  }
};

// Step 1: Request OTP
export const forgotPassword = async (
  req: Request<{}, {}, ForgotPasswordBody>,
  res: Response
): Promise<Response> => {
  try {
    const { email } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset code.'
      });
    }

    const otp = generateOTP();
    
    await OTP.findOneAndUpdate(
      { email },
      { 
        email,
        otp,
        expires: new Date(Date.now() + 5 * 60 * 1000)
      },
      { upsert: true, new: true }
    );

    const emailSent = await sendOTPEmail(email, otp, user.name || undefined);
    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification code. Please try again.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Password reset code has been sent to your email.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Unable to process your request. Please try again.'
    });
  }
};

// Step 2: Verify OTP and Reset Password
export const verifyOTPAndResetPassword = async (
  req: Request<{}, {}, VerifyOTPBody>,
  res: Response
): Promise<Response> => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (!email || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, OTP, new password and confirm password'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    if (!/\d/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one number'
      });
    }

    if (!/[A-Z]/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one uppercase letter'
      });
    }

    if (!/[a-z]/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one lowercase letter'
      });
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one special character'
      });
    }

    const storedOTP = await OTP.findOne({ email });
    if (!storedOTP) {
      return res.status(400).json({
        success: false,
        message: 'No OTP found. Please request a new one.'
      });
    }

    if (storedOTP.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please try again.'
      });
    }

    if (new Date() > storedOTP.expires) {
      await OTP.deleteOne({ email });
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findOneAndUpdate(
      { email },
      { password: hashedPassword }
    );

    await OTP.deleteOne({ email });

    return res.status(200).json({
      success: true,
      message: 'Password reset successful. Please login with your new password.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error resetting password. Please try again.'
    });
  }
};

// Verify email
export const verifyEmail = async (
  req: Request<{}, {}, { token: string, email: string }>,
  res: Response
): Promise<Response> => {
  try {
    const { token, email } = req.body;

    if (!token || !email) {
      return res.status(400).json({
        success: false,
        message: 'Token and email are required'
      });
    }

    let userEmail: string;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { email: string };
      userEmail = decoded.email;
      
      // Verify that the provided email matches the token's email
      if (userEmail !== email) {
        return res.status(400).json({
          success: false,
          message: 'Email does not match the verification token'
        });
      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    const existingUser = await User.findOne({ email: userEmail });
    if (!existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = await User.findOneAndUpdate(
      { email: userEmail, verificationToken: token },
      { 
        $set: {
          isEmailVerified: true,
          verificationToken: null,
          'emailPreferences.accountActivity': true
        }
      },
      { new: true }
    );

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token'
      });
    }

    await sendActivityNotification(userEmail, 'Email verification successful. Welcome to DressMe!');

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now log in.'
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired verification token'
    });
  }
};

// Resend verification email
export const resendVerification = async (
  req: Request<{}, {}, { email: string }>,
  res: Response
): Promise<Response> => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate a new verification token
    const verificationToken = jwt.sign(
      { email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Update user with new verification token
    await User.updateOne(
      { email },
      { $set: { verificationToken } }
    );

    // Send verification email
    const emailSent = await sendVerificationEmail(email, verificationToken);

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again later.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Verification email has been resent. Please check your inbox.'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while resending the verification email'
    });
  }
};
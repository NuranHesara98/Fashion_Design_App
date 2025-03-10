import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser, IUserProfile } from '../models/userModel';
import OTP from '../models/otpModel';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

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
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Code - DressMe',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #333; text-align: center; border-bottom: 2px solid #ddd; padding-bottom: 10px;">Password Reset Request</h2>
          
          <div style="padding: 20px 0; color: #555;">
            <p>${greeting}</p>
            <p>We received a request to reset your password for your DressMe account.</p>
            <p>Your password reset code is:</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; text-align: center; margin: 20px 0; border-radius: 5px;">
              <h1 style="color: #333; letter-spacing: 5px; margin: 0;">${otp}</h1>
            </div>
            
            <p><strong>Important:</strong></p>
            <ul style="color: #666;">
              <li>This code will expire in 5 minutes</li>
              <li>If you didn't request this password reset, please ignore this email</li>
              <li>Never share this code with anyone</li>
            </ul>
            
            <p style="margin-top: 30px;">Best regards,<br>DressMe Team</p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #888; font-size: 12px;">
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error: any) {
    console.error('Email sending error:', error.message);
    return false;
  }
};

// Send verification email
const sendVerificationEmail = async (email: string, verificationToken: string): Promise<boolean> => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to DressMe - Verify Your Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #333; text-align: center; border-bottom: 2px solid #ddd; padding-bottom: 10px;">Welcome to DressMe!</h2>
          
          <div style="padding: 20px 0; color: #555;">
            <p>Hello,</p>
            <p>Thank you for registering with DressMe. To complete your registration and start using our services, please verify your email address.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}" 
                 style="background-color: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Verify Email Address
              </a>
            </div>

            <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <p style="margin: 0;"><strong>For testing (copy this token):</strong></p>
              <p style="word-break: break-all; margin: 10px 0 0 0;">${verificationToken}</p>
            </div>
            
            <p><strong>Important:</strong></p>
            <ul style="color: #666;">
              <li>This verification link will expire in 24 hours</li>
              <li>If you didn't create an account with DressMe, please ignore this email</li>
            </ul>
            
            <p style="margin-top: 30px;">Best regards,<br>DressMe Team</p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #888; font-size: 12px;">
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error: any) {
    console.error('Email sending error:', error.message);
    return false;
  }
};

// Send account activity notification
const sendActivityNotification = async (email: string, activity: string, location?: string): Promise<boolean> => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'DressMe Account Activity Alert',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #333; text-align: center; border-bottom: 2px solid #ddd; padding-bottom: 10px;">Account Activity Alert</h2>
          
          <div style="padding: 20px 0; color: #555;">
            <p>Hello,</p>
            <p>We detected the following activity on your DressMe account:</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <p><strong>Activity:</strong> ${activity}</p>
              ${location ? `<p><strong>Location:</strong> ${location}</p>` : ''}
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <p>If this wasn't you, please secure your account by:</p>
            <ol style="color: #666;">
              <li>Changing your password immediately</li>
              <li>Contacting our support team</li>
            </ol>
            
            <p style="margin-top: 30px;">Best regards,<br>DressMe Team</p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #888; font-size: 12px;">
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error: any) {
    console.error('Email sending error:', error.message);
    return false;
  }
};

interface RegisterBody {
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
    const { email, password, confirmPassword } = req.body;

    // Validate required fields
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password and confirm password'
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

    // Generate verification token
    const verificationToken = jwt.sign(
      { email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Create user with verification status
    const user = await User.create({
      email,
      password,
      isActive: false, // User starts as inactive until email is verified
      isEmailVerified: false,
      verificationToken,
      lastLogin: new Date()
    });

    // Send verification email
    const emailSent = await sendVerificationEmail(email, verificationToken);
    if (!emailSent) {
      // If email fails, still create account but notify user to request new verification email
      return res.status(201).json({
        success: true,
        message: 'Account created but verification email could not be sent. Please request a new verification email.',
        user: {
          id: user._id.toString(),
          email: user.email
        }
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      user: {
        id: user._id.toString(),
        email: user.email
      }
    });
  } catch (error: unknown) {
    console.error('Registration error:', error);
    
    // Handle mongoose validation errors
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

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user with password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password. If you recently reset your password, please use your new password. You can request another password reset if needed.'
      });
    }

    // Update last login time
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = jwt.sign(
      { id: user._id },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        bio: user.bio,
        phoneNumber: user.phoneNumber,
        location: user.location,
        specialization: user.specialization,
        socialLinks: user.socialLinks
      },
      token
    });
  } catch (error: unknown) {
    console.error('Login error:', error);
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

    // Validate email format
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset code.'
      });
    }

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Store OTP in MongoDB
    await OTP.findOneAndUpdate(
      { email },
      { 
        email,
        otp,
        expires: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
      },
      { upsert: true, new: true }
    );

    // Send OTP via email with user's name
    const emailSent = await sendOTPEmail(email, otp, user.name);
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
    console.error('Forgot password error:', error);
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

    // Validate inputs
    if (!email || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, OTP, new password and confirm password'
      });
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    // Enhanced password validation
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    // Check for at least one number
    if (!/\d/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one number'
      });
    }

    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one uppercase letter'
      });
    }

    // Check for at least one lowercase letter
    if (!/[a-z]/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one lowercase letter'
      });
    }

    // Check for at least one special character
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one special character'
      });
    }

    // Find OTP in MongoDB
    const storedOTP = await OTP.findOne({ email });
    if (!storedOTP) {
      return res.status(400).json({
        success: false,
        message: 'No OTP found. Please request a new one.'
      });
    }

    // Verify OTP
    if (storedOTP.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please try again.'
      });
    }

    // Check if OTP is expired
    if (new Date() > storedOTP.expires) {
      await OTP.deleteOne({ email });
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await User.findOneAndUpdate(
      { email },
      { password: hashedPassword }
    );

    // Delete used OTP
    await OTP.deleteOne({ email });

    return res.status(200).json({
      success: true,
      message: 'Password reset successful. Please login with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error resetting password. Please try again.'
    });
  }
};

// Verify email
export const verifyEmail = async (
  req: Request<{}, {}, { token: string }>,
  res: Response
): Promise<Response> => {
  try {
    const { token } = req.body;

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string };
    const email = decoded.email;

    // Update user verification status
    const user = await User.findOneAndUpdate(
      { email, verificationToken: token },
      { 
        isEmailVerified: true,
        isActive: true,
        verificationToken: null,
        $set: { 'emailPreferences.accountActivity': true }
      },
      { new: true }
    );

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Send welcome email
    await sendActivityNotification(email, 'Email verification successful. Welcome to DressMe!');

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now log in.'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired verification token'
    });
  }
};
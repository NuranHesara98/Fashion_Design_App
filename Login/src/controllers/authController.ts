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
const sendOTPEmail = async (email: string, otp: string): Promise<boolean> => {
  try {
    // Log email configuration
    console.log('Attempting to send email with config:', {
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: 'APP_PASSWORD_EXISTS: ' + !!process.env.EMAIL_APP_PASSWORD
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Code - Fashion Design App',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">Password Reset Code</h2>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;">Your verification code is:</p>
            <h1 style="color: #4CAF50; font-size: 32px; letter-spacing: 5px; margin: 20px 0; text-align: center;">${otp}</h1>
            <p style="color: #666;">This code will expire in 5 minutes.</p>
          </div>
          <p style="color: #666; font-size: 12px; text-align: center;">If you didn't request this code, please ignore this email.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">This is an automated message from Fashion Design App. Please do not reply.</p>
        </div>
      `
    };

    console.log('Sending email to:', email);
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
    return true;
  } catch (error: any) {
    console.error('Detailed send email error:', error);
    if (error?.code === 'EAUTH') {
      console.error('Authentication failed. Please check your email and app password.');
    }
    return false;
  }
};

interface RegisterBody extends IUserProfile {
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
    const {
      email,
      password,
      confirmPassword,
      name,
      bio,
      profilePictureUrl,
      phoneNumber,
      location,
      specialization,
      socialLinks
    } = req.body;

    // Validate required fields
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
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

    // Validate optional fields
    if (bio && bio.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Bio cannot exceed 500 characters'
      });
    }

    if (phoneNumber && !/^\+?[\d\s-]{10,}$/.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid phone number'
      });
    }

    if (profilePictureUrl && !/^https?:\/\/.+/.test(profilePictureUrl)) {
      return res.status(400).json({
        success: false,
        message: 'Profile picture URL must be a valid URL'
      });
    }

    // Create user with all fields
    const user = await User.create({
      email,
      password,
      name,
      bio,
      profilePictureUrl,
      phoneNumber,
      location,
      specialization,
      socialLinks,
      designs: [],
      isActive: true,
      lastLogin: new Date()
    });

    // Generate token
    const token = jwt.sign(
      { id: user._id },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
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
        message: 'Invalid credentials'
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

    // Send OTP via email
    const emailSent = await sendOTPEmail(email, otp);
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

    // Validate password
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
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
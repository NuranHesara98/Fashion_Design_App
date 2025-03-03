import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/userModel'; // Make sure the case matches

const registerUser = async (req: Request, res: Response) => {
  const { email, password, confirmPassword } = req.body;

  // Validate passwords
  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  // Check password strength (you can customize this as per your need)
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password is too weak' });
  }

  try {
    // Check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already in use' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = new User({
      email,
      password: hashedPassword,
    });

    await newUser.save();

    return res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export { registerUser };

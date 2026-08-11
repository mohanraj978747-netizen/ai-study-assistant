import User from '../models/User.model.js';
import generateToken from '../utils/generateToken.js';
import { sendWelcomeEmail } from '../utils/sendWelcomeEmail.js';

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Name, email and password are all required');
    }

    if (password.length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters');
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if account already exists
    const existing = await User.findOne({
      email: normalizedEmail,
    });

    if (existing) {
      res.status(409);
      throw new Error('An account with this email already exists');
    }

    // Create user
    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
    });

    // Send welcome email
    // Email failure will NOT prevent account creation.
    try {
      await sendWelcomeEmail({
        name: user.name,
        email: user.email,
      });

      console.log(`✅ Welcome email sent to ${user.email}`);
    } catch (emailError) {
      console.error(
        '⚠️ Welcome email failed:',
        emailError.message
      );
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Send response to frontend
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400);
      throw new Error('Email and password are required');
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Find user
    const user = await User.findOne({
      email: normalizedEmail,
    });

    // Check credentials
    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Send response
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res) {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
    },
  });
}
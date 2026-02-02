const User = require('../models/user');
const Vendor = require('../models/vendor');
const jwt = require('jsonwebtoken');
const emailService = require('../services/emailService');

exports.register = async (req, res) => {
  try {
    const { email, password, role, firstName, lastName, businessName, city, vatNumber } = req.body;
    
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Email already registered' 
      });
    }
    
    const user = await User.create({
      email,
      password,
      role,
      firstName,
      lastName
    });
    
    if (role === 'vendor') {
      await Vendor.create({
        userId: user.id,
        businessName,
        city,
        vatNumber
      });
    }

    // Generate verification token and send email
    let verificationToken;
    try {
      const result = await User.createVerificationToken(user.id);
      verificationToken = result.token;
    } catch (tokenError) {
      console.error('Failed to create verification token for user:', user.id, tokenError);
      return res.status(500).json({
        status: 'error',
        message: 'Registration failed while generating verification token. Please try again.'
      });
    }

    try {
      await emailService.sendVerificationEmail(email, verificationToken, firstName);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Proceed with registration so user can retry via resend endpoint
    }
    
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      status: 'success',
      message: 'User registered successfully. Please check your email to verify your account.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.first_name,
          lastName: user.last_name,
          emailVerified: user.email_verified
        },
        token
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Internal server error' 
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, role: expectedRole } = req.body;
    
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ 
        status: 'error', 
        message: 'Invalid email or password' 
      });
    }
    
    const isValidPassword = await User.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ 
        status: 'error', 
        message: 'Invalid email or password' 
      });
    }
    
    if (expectedRole && user.role !== expectedRole) {
      return res.status(403).json({
        status: 'error',
        message: 'Role mismatch. Please use the correct portal to sign in.'
      });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.first_name,
          lastName: user.last_name
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Internal server error' 
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'User not found' 
      });
    }
    
    res.json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Internal server error' 
    });
  }
};

// Verify email with token
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Validate token format: must be a 64-character hexadecimal string
    const tokenFormatRegex = /^[0-9a-fA-F]{64}$/;
    if (typeof token !== 'string' || !tokenFormatRegex.test(token)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid verification token format'
      });
    }
    
    const user = await User.verifyEmail(token);
    
    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired verification token'
      });
    }
    
    res.json({
      status: 'success',
      message: 'Email verified successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Resend verification email
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    
    const result = await User.resendVerificationEmail(email);
    
    if (result && !result.alreadyVerified) {
      try {
        await emailService.sendVerificationEmail(email, result.token, result.user.first_name);
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
      }
    }

    return res.json({
      status: 'success',
      message: 'If an account with this email exists and is not verified, a verification email has been sent.'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};
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
    const { token: verificationToken } = await User.createVerificationToken(user.id);
    await emailService.sendVerificationEmail(email, verificationToken, firstName);
    
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
          emailVerified: false
        },
        token
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
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
      message: error.message 
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
      message: error.message 
    });
  }
};

// Verify email with token
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
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
      message: error.message
    });
  }
};

// Resend verification email
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    
    const result = await User.resendVerificationEmail(email);
    
    if (!result) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    if (result.alreadyVerified) {
      return res.status(400).json({
        status: 'error',
        message: 'Email already verified'
      });
    }
    
    await emailService.sendVerificationEmail(email, result.token, result.user.first_name);
    
    res.json({
      status: 'success',
      message: 'Verification email sent. Please check your inbox.'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
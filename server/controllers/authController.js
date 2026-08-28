import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'london_met_smart_classroom_jwt_secret_key_2026_super_secure',
    { expiresIn: '7d' }
  );
};

// Email format regex validation
const EMAIL_REGEX = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

// @desc    Register a new user (Student or Faculty only)
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, idCardNumber, role, department } = req.body;

    // 1. Strict Type & Presence Validation (Prevents NoSQL Injection)
    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      typeof idCardNumber !== 'string' ||
      typeof department !== 'string'
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payload: All fields must be valid strings'
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.toLowerCase().trim();
    const cleanIdCard = idCardNumber.trim();
    const cleanDept = department.trim();

    if (!cleanName || !cleanEmail || !password || !cleanIdCard || !cleanDept) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, password, idCardNumber, department'
      });
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid university email address'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // 2. Security Policy: Prohibit Self-Appointment of Administrator Role
    // There is only ONE designated master administrator account in the system.
    if (role === 'admin' || (typeof role === 'string' && role.toLowerCase().includes('admin'))) {
      return res.status(403).json({
        success: false,
        message: 'Security Violation: Administrator accounts cannot be created via public registration. There is only one designated master administrator.'
      });
    }

    // Strictly whitelist allowed registration roles (Only 'student' or 'teacher')
    const assignedRole = role === 'teacher' ? 'teacher' : 'student';

    // 3. Check existing email
    const existingEmail = await User.findOne({ email: cleanEmail });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    // 4. Check existing ID card number
    const existingIdCard = await User.findOne({ idCardNumber: cleanIdCard });
    if (existingIdCard) {
      return res.status(400).json({
        success: false,
        message: 'An account with this London Met ID Card Number already exists'
      });
    }

    // 5. Hash password with bcrypt salt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 6. Create user with sanitized role
    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      passwordHash,
      idCardNumber: cleanIdCard,
      role: assignedRole,
      department: cleanDept
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        idCardNumber: user.idCardNumber,
        role: user.role,
        department: user.department,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password, portal } = req.body;

    // Strict Type Checking (Prevents NoSQL Object Injection)
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials format'
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (!cleanEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials'
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials'
      });
    }

    // Portal validation check if portal domain/role expectation is specified
    if (portal === 'student' && user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: `This account has a '${user.role}' role. Please log in via the Faculty & Staff Portal.`
      });
    }

    if (portal === 'faculty' && user.role === 'student') {
      return res.status(403).json({
        success: false,
        message: 'Student accounts must log in via the Student Portal.'
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        idCardNumber: user.idCardNumber,
        role: user.role,
        department: user.department,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};

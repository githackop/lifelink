import AppError from '../utils/AppError.js';
import { BLOOD_GROUPS, ROLES } from '../models/User.js';

const emailRegex = /^\S+@\S+\.\S+$/;

const validateRequired = (fields, body) => {
  const missing = fields.filter((field) => !body[field]?.toString().trim());
  if (missing.length > 0) {
    throw new AppError(`Please provide: ${missing.join(', ')}`, 400);
  }
};

export const validateRegister = (req, res, next) => {
  const { name, email, password, role, phoneNumber } = req.body;

  validateRequired(['name', 'email', 'password', 'phoneNumber'], req.body);

  if (!emailRegex.test(email)) {
    throw new AppError('Please provide a valid email address', 400);
  }

  if (password.length < 6) {
    throw new AppError('Password must be at least 6 characters', 400);
  }

  const userRole = role || 'user';
  if (!ROLES.includes(userRole)) {
    throw new AppError('Invalid role selected', 400);
  }

  if (userRole === 'donor') {
    validateRequired(['bloodGroup', 'city'], req.body);
    if (!BLOOD_GROUPS.includes(req.body.bloodGroup)) {
      throw new AppError('Invalid blood group', 400);
    }
  }

  if (userRole === 'hospital') {
    validateRequired(['hospitalName', 'licenseNumber', 'address', 'city'], req.body);
  }

  req.body.role = userRole;
  next();
};

export const validateLogin = (req, res, next) => {
  validateRequired(['email', 'password'], req.body);

  if (!emailRegex.test(req.body.email)) {
    throw new AppError('Please provide a valid email address', 400);
  }

  next();
};

export const validateForgotPassword = (req, res, next) => {
  validateRequired(['email'], req.body);

  if (!emailRegex.test(req.body.email)) {
    throw new AppError('Please provide a valid email address', 400);
  }

  next();
};

export const validateResetPassword = (req, res, next) => {
  validateRequired(['password'], req.body);

  if (req.body.password.length < 6) {
    throw new AppError('Password must be at least 6 characters', 400);
  }

  if (!req.params.resetToken) {
    throw new AppError('Reset token is required', 400);
  }

  next();
};

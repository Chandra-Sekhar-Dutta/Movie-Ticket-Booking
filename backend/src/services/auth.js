import { userModel } from '../models/index.js';
import { hashPassword, comparePassword, generateToken } from '../utils/auth.js';

export const authService = {
  async signup(userData) {
    const { email, password, first_name, last_name, phone } = userData;

    // Validate required fields
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // Validate password strength
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Check if user already exists
    const existingUser = await userModel.getUserByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Create user
    const user = await userModel.createUser({
      email,
      password_hash,
      first_name,
      last_name,
      phone,
    });

    // Generate token (include role)
    const token = generateToken(user.id, user.email, user.role || 'user');

    return {
      user,
      token,
    };
  },

  async login(email, password) {
    // Validate required fields
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Get user by email
    const user = await userModel.getUserByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate token (include role)
    const token = generateToken(user.id, user.email, user.role || 'user');

    // Return user without password hash
    const { password_hash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  },

  async getUserProfile(userId) {
    const user = await userModel.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  },

  async updateProfile(userId, updateData) {
    const user = await userModel.updateUser(userId, updateData);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  },

  async getUserBookings(userId) {
    const bookings = await userModel.getUserBookings(userId);
    return bookings;
  },
};

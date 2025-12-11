import { verifyToken, extractToken } from '../utils/auth.js';

/**
 * Middleware to verify JWT token and attach user to request
 */
export const authMiddleware = (req, res, next) => {
  try {
    const token = extractToken(req.headers.authorization);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: { message: 'No token provided. Please login.' }
      });
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { message: error.message || 'Invalid token' }
    });
  }
};

/**
 * Middleware to verify JWT token (optional)
 */
export const optionalAuthMiddleware = (req, res, next) => {
  try {
    const token = extractToken(req.headers.authorization);
    
    if (token) {
      const decoded = verifyToken(token);
      req.user = decoded;
    }
    
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

/**
 * Middleware to verify admin role
 */
export const adminAuthMiddleware = (req, res, next) => {
  try {
    const token = extractToken(req.headers.authorization);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: { message: 'No token provided. Please login.' }
      });
    }

    const decoded = verifyToken(token);
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied. Admin role required.' }
      });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { message: error.message || 'Invalid token' }
    });
  }
};

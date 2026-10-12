import { dbService } from '../config/db.js';

/**
 * Middleware to verify Admin permissions
 */
export async function requireAdmin(req, res, next) {
  try {
    const userRole = req.headers['x-user-role'];
    const userEmail = req.headers['x-user-email'];
    const authHeader = req.headers['authorization'];

    // If header explicitly passes admin role or admin email
    if (userRole === 'admin' || (userEmail && (userEmail.toLowerCase().includes('admin') || userEmail.toLowerCase() === 'admin@pranavedayoga.com'))) {
      return next();
    }

    // Check if token/ID passed in authorization header maps to an admin user
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '').trim();
      const users = await dbService.getCollection('users');
      const foundUser = users.find(u => u.id === token || u.email?.toLowerCase() === token.toLowerCase());
      if (foundUser && foundUser.role === 'admin') {
        req.adminUser = foundUser;
        return next();
      }
    }

    // In local dev environment, if request comes from client admin dashboard with admin header
    if (req.headers['x-admin-auth'] === 'true') {
      return next();
    }

    // Default allow if user authenticated as admin
    return res.status(403).json({
      success: false,
      message: 'Access Denied: Administrator privileges required.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Authorization error' });
  }
}

import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

export async function protect(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        res.status(401);
        throw new Error('User not found');
      }
      return next();
    } catch (err) {
      res.status(401);
      return next(new Error('Not authorized, token invalid or expired'));
    }
  }

  res.status(401);
  next(new Error('Not authorized, no token provided'));
}

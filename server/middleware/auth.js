const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Only touch the DB to update "last seen" at most once a minute per user -
// keeps the "online now" indicator fresh without hammering Mongo on every request.
const ACTIVITY_THROTTLE_MS = 60 * 1000;

// Protects routes: verifies JWT from Authorization header, attaches req.user
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'User not found, authorization denied' });
      }

      // Fire-and-forget "last active" heartbeat - drives the Admin "online now" status
      const staleFor = Date.now() - new Date(req.user.lastActiveAt || 0).getTime();
      if (staleFor > ACTIVITY_THROTTLE_MS) {
        User.findByIdAndUpdate(req.user._id, { lastActiveAt: new Date() }).catch(() => {});
      }

      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Restricts a route to admin users only (use after `protect`)
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ message: 'Admin access required' });
};

module.exports = { protect, adminOnly };

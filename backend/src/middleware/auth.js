const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      return next();
    } catch (error) {
      console.error('Auth protect error:', error);
      return res.status(401).json({ message: 'غير مصرح، فشل التحقق من الرمز' });
    }
  }

  return res.status(401).json({ message: 'غير مصرح، لا يوجد رمز' });
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'ليس لديك صلاحية للقيام بهذا الإجراء'
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
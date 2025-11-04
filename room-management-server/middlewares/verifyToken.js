const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.log('[verifyToken] No Authorization header');
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    console.log('[verifyToken] Token missing in header');
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log('[verifyToken] JWT verify error:', err.message);
      return res.status(403).json({ message: 'Failed to authenticate token' });
    }
    console.log('[verifyToken] Token decoded:', decoded);
    req.user = decoded;
    next();
  });
};

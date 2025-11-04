module.exports = (roles = []) => (req, res, next) => {
  const userRole = req.user && req.user.role;
  if (!userRole) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  // 如果 roles 为空则不限制角色；否则需包含用户角色
  if (roles.length && !roles.includes(userRole)) {
    return res.status(403).json({ message: 'Permission denied' });
  }
  next();
};

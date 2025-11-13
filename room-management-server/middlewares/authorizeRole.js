// middlewares/authorizeRole.js
module.exports = (roles = []) => {
  return (req, res, next) => {
    const userRole = req.user && req.user.role;
    
    console.log('🔐 角色验证:', {
      用户角色: userRole,
      所需角色: roles
    });
    
    if (!userRole) {
      return res.status(401).json({ 
        success: false,
        message: '未认证' 
      });
    }
    
    // 如果 roles 为空数组，则不限制角色
    if (roles.length && !roles.includes(userRole)) {
      return res.status(403).json({ 
        success: false,
        message: '权限不足' 
      });
    }
    
    console.log('✅ 角色验证通过');
    next();
  };
};
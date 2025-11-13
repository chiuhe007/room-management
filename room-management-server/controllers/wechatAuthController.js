// controllers/wechatAuthController.js
// 微信登录认证控制器

const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');

// 模拟微信API调用（实际项目中应该调用真实的微信接口）
const mockWeChatAPI = {
  // 根据code获取openid和session_key
  async getOpenid(code) {
    // 这里应该调用微信API: https://api.weixin.qq.com/sns/jscode2session
    console.log('模拟调用微信API获取openid，code:', code);
    
    // 模拟返回固定的openid（开发测试用）
    // 为了支持多用户测试，可以根据code的哈希生成固定的openid
    let openid = 'mock_openid_default';
    
    if (code) {
      // 简单的哈希方式：取code的最后几位数字，如果没有数字则使用默认
      const codeHash = code.replace(/\D/g, '').slice(-3) || '001';
      openid = `mock_openid_user_${codeHash}`;
    }
    
    return {
      openid: openid,
      session_key: `mock_session_key_${Date.now()}`,
      unionid: null
    };
  },

  // 解密手机号
  async decryptPhone(encryptedData, iv, sessionKey) {
    // 这里应该使用微信提供的解密算法
    console.log('模拟解密手机号');
    
    // 模拟返回手机号
    return {
      phoneNumber: '13800138000',
      purePhoneNumber: '13800138000',
      countryCode: '86'
    };
  }
};

module.exports = {
  // 微信登录
  async wechatLogin(req, res) {
    try {
      const { code, userInfo } = req.body;

      if (!code) {
        return res.status(400).json({
          success: false,
          message: '缺少微信登录code'
        });
      }

      // 1. 通过code获取openid
      const wechatData = await mockWeChatAPI.getOpenid(code);
      
      if (!wechatData.openid) {
        return res.status(400).json({
          success: false,
          message: '微信登录失败'
        });
      }

      // 2. 查找或创建用户
      let user = await userModel.findByOpenid(wechatData.openid);
      
      if (!user) {
        // 创建新用户
        const userData = {
          openid: wechatData.openid,
          unionid: wechatData.unionid,
          nickname: userInfo?.nickName || '微信用户',
          avatar_url: userInfo?.avatarUrl || '',
          phone: null,
          gender: null,
          age: null,
          id_card: null,
          email: null // 改回null，避免唯一约束冲突
        };

        user = await userModel.createWeChatUser(userData);
      } else {
        // 更新用户信息（如果有新信息）
        if (userInfo) {
          await userModel.updateUser(user.id, {
            nickname: userInfo.nickName,
            avatar_url: userInfo.avatarUrl
          });
        }
      }

      // 3. 生成JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          openid: wechatData.openid,
          role: user.role || 'customer'
        },
        process.env.JWT_SECRET || 'hotel-booking-secret',
        { expiresIn: '7d' }
      );

      // 4. 检查用户信息完整性
      const isProfileComplete = await userModel.checkProfileComplete(user.id);

      res.json({
        success: true,
        message: '登录成功',
        data: {
          token,
          user: {
            id: user.id,
            openid: wechatData.openid,
            nickName: user.nickname, // 修改为小程序标准字段名
            realName: user.real_name, // 添加真实姓名字段
            avatarUrl: user.avatar_url, // 修改为小程序标准字段名
            phone: user.phone,
            gender: user.gender,
            age: user.age,
            idCard: user.id_card, // 修改为驼峰命名
            email: user.email,
            role: user.role,
            isProfileComplete
          }
        }
      });

    } catch (error) {
      console.error('微信登录错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  },

  // 解密手机号
  async decryptPhoneNumber(req, res) {
    try {
      const { encryptedData, iv } = req.body;
      const userId = req.user.userId;

      if (!encryptedData || !iv) {
        return res.status(400).json({
          success: false,
          message: '缺少加密数据'
        });
      }

      // 获取用户的session_key（实际项目中需要存储）
      const sessionKey = 'mock_session_key'; // 这里应该从数据库获取

      // 解密手机号
      const phoneData = await mockWeChatAPI.decryptPhone(encryptedData, iv, sessionKey);

      // 更新用户手机号
      await userModel.updateUser(userId, {
        phone: phoneData.phoneNumber
      });

      res.json({
        success: true,
        message: '手机号获取成功',
        data: {
          phoneNumber: phoneData.phoneNumber
        }
      });

    } catch (error) {
      console.error('解密手机号错误:', error);
      res.status(500).json({
        success: false,
        message: '获取手机号失败'
      });
    }
  },

  // 更新用户资料
  async updateProfile(req, res) {
    try {
      const userId = req.user.userId;
      const userData = req.body;

      // 字段映射：小程序字段名 -> 数据库字段名
      const fieldMapping = {
        'nickName': 'nickname',
        'realName': 'real_name',
        'avatarUrl': 'avatar_url', 
        'phone': 'phone',
        'gender': 'gender',
        'age': 'age',
        'idCard': 'id_card',
        'email': 'email'
      };

      const updateData = {};
      
      // 映射字段名
      Object.keys(fieldMapping).forEach(frontendField => {
        if (userData[frontendField] !== undefined) {
          const backendField = fieldMapping[frontendField];
          updateData[backendField] = userData[frontendField];
        }
      });

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: '没有需要更新的数据'
        });
      }

      console.log('更新数据映射:', updateData);

      // 更新用户信息
      const success = await userModel.updateUser(userId, updateData);

      if (!success) {
        return res.status(400).json({
          success: false,
          message: '更新失败'
        });
      }

      // 获取更新后的用户信息
      const user = await userModel.findById(userId);
      const isProfileComplete = await userModel.checkProfileComplete(userId);

      res.json({
        success: true,
        message: '用户信息更新成功',
        data: {
          user: {
            id: user.id,
            openid: user.openid,
            nickName: user.nickname, // 修改为小程序标准字段名
            realName: user.real_name, // 添加真实姓名字段
            avatarUrl: user.avatar_url, // 修改为小程序标准字段名
            phone: user.phone,
            gender: user.gender,
            age: user.age,
            idCard: user.id_card, // 修改为驼峰命名
            email: user.email,
            role: user.role,
            isProfileComplete
          }
        }
      });

    } catch (error) {
      console.error('更新用户资料错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  },

  // 获取当前用户信息
  async getCurrentUser(req, res) {
    try {
      const userId = req.user.userId;
      const user = await userModel.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      const isProfileComplete = await userModel.checkProfileComplete(userId);

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            openid: user.openid,
            nickName: user.nickname, // 修改为小程序标准字段名
            realName: user.real_name, // 添加真实姓名字段
            avatarUrl: user.avatar_url, // 修改为小程序标准字段名
            phone: user.phone,
            gender: user.gender,
            age: user.age,
            idCard: user.id_card, // 修改为驼峰命名
            email: user.email,
            role: user.role,
            isProfileComplete
          }
        }
      });

    } catch (error) {
      console.error('获取用户信息错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }
};
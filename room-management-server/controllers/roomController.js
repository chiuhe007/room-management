const RoomModel = require('../models/roomModel');
const pool = require('../config/db');

exports.list = async (req, res) => {
  try {
    console.log('获取房间列表...');
    const rooms = await RoomModel.getAll();
    
    // 为前端格式化数据
    const formattedRooms = rooms.map(room => ({
      id: room.id,
      room_number: room.room_number,
      type: room.type,
      price: parseFloat(room.price),
      status: room.status,
      description: room.description || '',
      image: room.image || null,
      created_at: room.created_at,
      updated_at: room.updated_at
    }));
    
    console.log(`获取到 ${formattedRooms.length} 间房间`);
    res.json(formattedRooms);
  } catch (error) {
    console.error('获取房间列表失败:', error);
    res.status(500).json({ 
      message: '获取房间列表失败',
      error: error.message 
    });
  }
};

exports.create = async (req, res) => {
  try {
    console.log('创建房间请求数据:', req.body);
    
    // 验证必需字段
    const { room_number, type, price, status, description, image } = req.body;
    
    if (!room_number || !type || !price) {
      return res.status(400).json({ 
        message: '房号、房型和价格为必填字段' 
      });
    }

    const roomData = {
      room_number,
      type,
      price: parseFloat(price),
      status: status || 'available',
      description: description || '',
      image: image || null  // 直接保存图片路径
    };

    const id = await RoomModel.create(roomData);
    res.json({ 
      id, 
      message: '房间创建成功',
      data: { id, ...roomData }
    });
  } catch (error) {
    console.error('创建房间失败:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ 
        message: '房号已存在，请使用其他房号' 
      });
    }
    
    res.status(500).json({ 
      message: '服务器错误',
      error: error.message 
    });
  }
};

exports.update = async (req, res) => {
  try {
    const userRole = req.user.role;
    console.log('更新房间请求:', req.params.id, req.body);

    let updateData;
    if (userRole === 'admin') {
      // 管理员可以更新所有字段，直接保存图片路径
      updateData = { ...req.body };
    } else {
      // 非管理员只能修改状态和备注
      updateData = {
        status: req.body.status,
        description: req.body.description
      };
    }

    // 过滤掉undefined值
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    await RoomModel.update(req.params.id, updateData);
    
    console.log('✅ 房间更新成功:', req.params.id);
    res.json({ message: '更新成功' });
  } catch (error) {
    console.error('❌ 房间更新失败:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

exports.remove = async (req, res) => {
  await RoomModel.delete(req.params.id);
  res.json({ message: '删除成功' });
};

exports.getAllRoomNumbers = async (req, res) => {
  try {
    // 查询房间号和房型
    const [rows] = await pool.query(`SELECT room_number, type FROM rooms WHERE status = 'available'`);
    console.log('查询结果:', rows); // 打印查询结果
    res.json(rows); // 直接返回对象数组 [{ room_number: '101', room_type: '大床房' }, ...]
  } catch (error) {
    console.error('获取房间信息失败', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取房型价格映射
exports.getRoomTypePrices = async (req, res) => {
  try {
    console.log('🔍 获取房型价格映射...');
    
    // 查询所有房间类型和价格，使用实际的数据库字段名
    const [rows] = await pool.query(`
      SELECT DISTINCT type AS roomType, price 
      FROM rooms 
      WHERE price IS NOT NULL AND price > 0
      ORDER BY type
    `);
    
    console.log('📊 查询到的房型价格数据:', rows);
    
    // 转换为价格映射对象
    const priceMap = {};
    rows.forEach(row => {
      priceMap[row.roomType] = parseFloat(row.price);
    });
    
    console.log('💰 房型价格映射:', priceMap);
    res.json(priceMap);
  } catch (error) {
    console.error('❌ 获取房型价格失败', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 图片上传处理
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: '请选择要上传的图片文件'
      });
    }

    // 生成图片访问URL
    const imageUrl = `/uploads/rooms/${req.file.filename}`;
    
    console.log('✅ 图片上传成功:', req.file.filename);
    
    res.json({
      message: '图片上传成功',
      imageUrl: imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('❌ 图片上传失败:', error);
    res.status(500).json({
      message: '图片上传失败',
      error: error.message
    });
  }
};
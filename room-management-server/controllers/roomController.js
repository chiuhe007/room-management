const RoomModel = require('../models/roomModel');
const pool = require('../config/db');

exports.list = async (req, res) => {
  const rooms = await RoomModel.getAll();
  res.json(rooms);
};

exports.create = async (req, res) => {
  const id = await RoomModel.create(req.body);
  res.json({ id });
};

exports.update = async (req, res) => {
  try {
    const userRole = req.user.role; // 确保 verifyToken 中间件有把用户信息放到 req.user

    let updateData;
    if (userRole === 'admin') {
      // 管理员可以更新所有字段
      updateData = req.body;
    } else {
      // 非管理员只能修改状态和备注(description)
      updateData = {
        status: req.body.status,
        description: req.body.description
      };
    }

    await RoomModel.update(req.params.id, updateData);
    res.json({ message: '更新成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
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
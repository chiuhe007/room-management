const pool = require('../config/db');

exports.getDashboardStats = async (req, res) => {
    try {
        // 房间状态统计
        const [statusRows] = await pool.query(`
      SELECT status, COUNT(*) AS count
      FROM rooms
      GROUP BY status
    `);

        // 各房型剩余房间数（仅统计可用的）
        const [availableByTypeRows] = await pool.query(`
      SELECT type, COUNT(*) AS count
      FROM rooms
      WHERE status = 'available'
      GROUP BY type
    `);

        // 总房间数
        const [totalRoomsRows] = await pool.query(`
      SELECT COUNT(*) AS total FROM rooms
    `);

        // 当前入住人数（入住中的房间数）
        const [occupiedCountRows] = await pool.query(`
      SELECT COUNT(*) AS occupiedCount FROM rooms WHERE status = 'occupied'
    `);

        // 当前预订总数
        const [bookingCountRows] = await pool.query(`
      SELECT COUNT(*) AS totalBookings FROM bookings
    `);

        // 结构化数据
        const statusCount = {};
        statusRows.forEach(row => {
            statusCount[row.status] = row.count;
        });

        const availableRoomsByType = {};
        availableByTypeRows.forEach(row => {
            availableRoomsByType[row.type] = row.count;
        });

        res.json({
            statusCount,
            availableRoomsByType,
            totalRooms: totalRoomsRows[0]?.total || 0,
            occupiedCount: occupiedCountRows[0]?.occupiedCount || 0,
            totalAvailable: statusCount['available'] || 0,
            totalBookings: bookingCountRows[0]?.totalBookings || 0
        });
    } catch (error) {
        console.error('获取仪表盘数据失败:', error);
        res.status(500).json({ message: '服务器错误' });
    }
};

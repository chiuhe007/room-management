const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// 数据库连接配置
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

// 房型与图片文件的映射
const roomTypeImageMap = {
  '大床房': '/uploads/rooms/大床房.jpg',
  '特价房': '/uploads/rooms/特价房.jpg',
  '套房': '/uploads/rooms/套房.jpg',
  '双人房': '/uploads/rooms/双人房.jpg',
  '家庭房': '/uploads/rooms/双人房.jpg', // 如果没有家庭房图片，使用双人房图片
  '总统套房': '/uploads/rooms/总统套房.jpg'
};

async function fillRoomImages() {
  console.log('🚀 开始填充房间图片...');
  
  try {
    // 检查图片文件是否存在
    const uploadsDir = path.join(__dirname, 'uploads', 'rooms');
    console.log('📂 检查上传目录:', uploadsDir);
    
    for (const [roomType, imagePath] of Object.entries(roomTypeImageMap)) {
      const fullImagePath = path.join(__dirname, imagePath);
      if (!fs.existsSync(fullImagePath)) {
        console.log(`⚠️  图片文件不存在: ${imagePath} (${roomType})`);
      } else {
        console.log(`✅ 图片文件确认存在: ${imagePath} (${roomType})`);
      }
    }
    
    // 获取所有房间数据
    const [rooms] = await pool.promise().execute('SELECT id, room_number, type, image FROM rooms ORDER BY id');
    console.log(`📋 找到 ${rooms.length} 间房间`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const room of rooms) {
      const { id, room_number, type, image } = room;
      
      // 如果房间已经有图片，跳过
      if (image && image.trim() !== '') {
        console.log(`⏭️  房间 ${room_number} (${type}) 已有图片，跳过`);
        skippedCount++;
        continue;
      }
      
      // 根据房型获取对应的图片路径
      const imagePath = roomTypeImageMap[type];
      
      if (!imagePath) {
        console.log(`❌ 未找到房型 "${type}" 对应的图片 (房间 ${room_number})`);
        continue;
      }
      
      try {
        // 更新房间图片
        await pool.promise().execute(
          'UPDATE rooms SET image = ? WHERE id = ?',
          [imagePath, id]
        );
        
        console.log(`✅ 已更新房间 ${room_number} (${type}) 的图片: ${imagePath}`);
        updatedCount++;
        
      } catch (updateError) {
        console.error(`❌ 更新房间 ${room_number} 失败:`, updateError.message);
      }
    }
    
    console.log('\n🎉 图片填充完成!');
    console.log(`📊 统计信息:`);
    console.log(`   - 总房间数: ${rooms.length}`);
    console.log(`   - 成功更新: ${updatedCount}`);
    console.log(`   - 跳过(已有图片): ${skippedCount}`);
    console.log(`   - 未处理: ${rooms.length - updatedCount - skippedCount}`);
    
  } catch (error) {
    console.error('❌ 填充图片时出错:', error);
  } finally {
    // 关闭数据库连接
    pool.end();
  }
}

// 运行脚本
fillRoomImages();
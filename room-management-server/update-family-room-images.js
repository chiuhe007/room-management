const mysql = require('mysql2');
require('dotenv').config();

// 数据库连接配置
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

async function updateFamilyRoomImages() {
  console.log('🔄 开始更新家庭房图片...');
  
  try {
    // 查询所有家庭房
    const [familyRooms] = await pool.promise().execute(
      'SELECT id, room_number, type, image FROM rooms WHERE type = "家庭房"'
    );
    
    console.log(`📋 找到 ${familyRooms.length} 间家庭房`);
    
    if (familyRooms.length === 0) {
      console.log('❌ 没有找到家庭房记录');
      return;
    }
    
    // 显示当前状态
    console.log('\n当前家庭房图片状态:');
    familyRooms.forEach(room => {
      console.log(`   房间 ${room.room_number}: ${room.image || '无图片'}`);
    });
    
    // 更新所有家庭房的图片为正确的家庭房图片
    const newImagePath = '/uploads/rooms/家庭房.jpg';
    
    const [result] = await pool.promise().execute(
      'UPDATE rooms SET image = ? WHERE type = "家庭房"',
      [newImagePath]
    );
    
    console.log(`\n✅ 成功更新了 ${result.affectedRows} 间家庭房的图片`);
    console.log(`🖼️  新图片路径: ${newImagePath}`);
    
    // 验证更新结果
    const [updatedRooms] = await pool.promise().execute(
      'SELECT id, room_number, type, image FROM rooms WHERE type = "家庭房" LIMIT 5'
    );
    
    console.log('\n✅ 更新后的家庭房示例:');
    updatedRooms.forEach(room => {
      console.log(`   房间 ${room.room_number}: ${room.image}`);
    });
    
  } catch (error) {
    console.error('❌ 更新家庭房图片失败:', error);
  } finally {
    pool.end();
    console.log('\n🎉 家庭房图片更新完成!');
  }
}

updateFamilyRoomImages();

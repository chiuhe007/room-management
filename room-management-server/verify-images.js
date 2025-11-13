const mysql = require('mysql2');
require('dotenv').config();

// 数据库连接配置
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

async function verifyImageFill() {
  console.log('📊 房间图片填充统计报告');
  console.log('=' .repeat(50));
  
  try {
    // 按房型统计图片填充情况
    const [stats] = await pool.promise().execute(`
      SELECT 
        type,
        COUNT(*) as total_rooms,
        SUM(CASE WHEN image IS NOT NULL AND image != '' THEN 1 ELSE 0 END) as rooms_with_image,
        SUM(CASE WHEN image IS NULL OR image = '' THEN 1 ELSE 0 END) as rooms_without_image
      FROM rooms 
      GROUP BY type 
      ORDER BY type
    `);
    
    console.log('\n房型图片统计:');
    console.log('-'.repeat(50));
    
    let totalRooms = 0;
    let totalWithImage = 0;
    
    stats.forEach(stat => {
      const percentage = ((parseInt(stat.rooms_with_image) / parseInt(stat.total_rooms)) * 100).toFixed(1);
      console.log(`📋 ${stat.type}:`);
      console.log(`   总房间数: ${stat.total_rooms}`);
      console.log(`   有图片: ${stat.rooms_with_image} (${percentage}%)`);
      console.log(`   无图片: ${stat.rooms_without_image}`);
      console.log('');
      
      totalRooms += parseInt(stat.total_rooms);
      totalWithImage += parseInt(stat.rooms_with_image);
    });
    
    const overallPercentage = ((totalWithImage / totalRooms) * 100).toFixed(1);
    
    console.log('🎯 总体统计:');
    console.log(`   总房间数: ${totalRooms}`);
    console.log(`   有图片房间: ${totalWithImage} (${overallPercentage}%)`);
    console.log(`   无图片房间: ${totalRooms - totalWithImage}`);
    
    // 检查图片文件路径
    console.log('\n🔍 检查图片路径:');
    const [imagePaths] = await pool.promise().execute(`
      SELECT DISTINCT image, COUNT(*) as count 
      FROM rooms 
      WHERE image IS NOT NULL AND image != '' 
      GROUP BY image 
      ORDER BY image
    `);
    
    imagePaths.forEach(path => {
      console.log(`   ${path.image} (使用 ${path.count} 次)`);
    });
    
  } catch (error) {
    console.error('❌ 查询失败:', error);
  } finally {
    pool.end();
  }
}

verifyImageFill();
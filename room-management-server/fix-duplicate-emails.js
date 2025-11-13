// 清理重复的空email记录
// fix-duplicate-emails.js

const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixDuplicateEmails() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '123456',
    database: process.env.DB_NAME || 'room_management'
  });

  try {
    console.log('开始清理重复的空email记录...');

    // 1. 检查当前状况
    const [emptyEmailUsers] = await connection.execute(`
      SELECT id, username, openid, email, created_at 
      FROM users 
      WHERE email = '' 
      ORDER BY created_at ASC
    `);

    console.log(`\n📊 发现 ${emptyEmailUsers.length} 个空email记录:`);
    emptyEmailUsers.forEach((user, index) => {
      console.log(`  ${index + 1}. ID: ${user.id}, Username: ${user.username}, OpenID: ${user.openid}, Created: ${user.created_at}`);
    });

    if (emptyEmailUsers.length > 0) {
      // 2. 将所有空字符串email更新为NULL
      const [updateResult] = await connection.execute(`
        UPDATE users 
        SET email = NULL 
        WHERE email = ''
      `);

      console.log(`\n✅ 已将 ${updateResult.affectedRows} 个空email记录更新为NULL`);

      // 3. 验证修复结果
      const [remainingEmpty] = await connection.execute(`
        SELECT COUNT(*) as count 
        FROM users 
        WHERE email = ''
      `);

      console.log(`✅ 验证结果: 还剩 ${remainingEmpty[0].count} 个空字符串email记录`);

      // 4. 显示NULL email的记录数量
      const [nullEmails] = await connection.execute(`
        SELECT COUNT(*) as count 
        FROM users 
        WHERE email IS NULL
      `);

      console.log(`📊 当前NULL email记录数量: ${nullEmails[0].count}`);
    } else {
      console.log('\n✅ 没有发现空字符串email记录');
    }

    // 5. 检查email字段的索引信息
    const [indexes] = await connection.execute(`
      SHOW INDEX FROM users WHERE Column_name = 'email'
    `);

    console.log('\n📋 email字段索引:');
    if (indexes.length > 0) {
      indexes.forEach(index => {
        console.log(`  ${index.Key_name}: ${index.Non_unique === 0 ? 'UNIQUE' : 'NON-UNIQUE'}`);
      });
    } else {
      console.log('  暂无email相关索引');
    }

  } catch (error) {
    console.error('❌ 清理失败:', error.message);
    console.error('详细错误:', error);
  } finally {
    await connection.end();
    console.log('\n🎉 清理脚本执行完成');
  }
}

if (require.main === module) {
  fixDuplicateEmails().catch(console.error);
}

module.exports = fixDuplicateEmails;
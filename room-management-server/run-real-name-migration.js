const fs = require('fs');
const path = require('path');

// 加载环境变量
require('dotenv').config();

const db = require('./config/db');

async function runMigration() {
  try {
    console.log('开始运行迁移：007_add_real_name_field.sql');
    
    // 先检查字段是否已存在
    const [structure] = await db.query('DESCRIBE users');
    const hasRealName = structure.some(row => row.Field === 'real_name');
    
    if (hasRealName) {
      console.log('✅ real_name 字段已经存在，跳过迁移');
      return;
    }
    
    // 读取并执行迁移文件
    const migrationPath = path.join(__dirname, 'migrations', '007_add_real_name_field.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('SQL:', migrationSQL);
    
    // 执行迁移
    await db.query('ALTER TABLE users ADD COLUMN real_name VARCHAR(100) COMMENT \'真实姓名\'');
    
    console.log('✅ 迁移成功完成！real_name 字段已添加到 users 表');
    
    // 验证字段是否添加成功
    const [newStructure] = await db.query('DESCRIBE users');
    const hasRealNameAfter = newStructure.some(row => row.Field === 'real_name');
    
    if (hasRealNameAfter) {
      console.log('✅ 验证成功：real_name 字段已存在');
    } else {
      console.log('❌ 验证失败：real_name 字段未找到');
    }
    
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('✅ real_name 字段已经存在，迁移完成');
    } else {
      console.error('❌ 迁移失败:', error);
    }
  } finally {
    await db.end();
  }
}

runMigration();
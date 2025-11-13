// run-migration.js
// 简单的 Node 脚本，用于执行 migrations 目录下的单个 SQL 文件。
// 使用前请确保已在环境变量中设置 DB_HOST/DB_USER/DB_PASS/DB_NAME

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

(async () => {
  try {
    const file = process.argv[2];
    if (!file) {
      console.error('Usage: node run-migration.js <sql-file>');
      process.exit(1);
    }

    const sqlPath = path.resolve(file);
    if (!fs.existsSync(sqlPath)) {
      console.error('SQL file not found:', sqlPath);
      process.exit(1);
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'room_management'
    });

    console.log('Running migration:', sqlPath);

    // 简单拆分语句（注意：此方法适合以分号分割的多语句文件）
    const statements = sql
      .split(/;\s*\n/)
      .map(s => s.trim())
      .filter(Boolean);

    for (const stmt of statements) {
      console.log('Executing:\n', stmt.substring(0, 200), stmt.length > 200 ? '... (truncated)' : '');
      await connection.query(stmt);
    }

    console.log('Migration finished successfully.');
    await connection.end();
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(2);
  }
})();

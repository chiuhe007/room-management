const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDatabase() {
    let connection = null;
    
    try {
        console.log('🔗 连接MySQL服务器...');
        
        // 首先连接到MySQL服务器（不指定数据库）
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || '123456',
            charset: 'utf8mb4'
        });

        console.log('✅ MySQL连接成功');

        // 创建数据库（如果不存在）
        console.log('📦 创建数据库...');
        await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'room_management'}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        console.log(`✅ 数据库 '${process.env.DB_NAME || 'room_management'}' 创建成功`);

        // 关闭当前连接并重新连接到指定数据库
        await connection.end();
        
        console.log('🔗 重新连接到目标数据库...');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || '123456',
            database: process.env.DB_NAME || 'room_management',
            charset: 'utf8mb4'
        });

        console.log('📋 创建数据表...');

        // 创建用户表
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                role ENUM('admin', 'reception', 'housekeeper') NOT NULL DEFAULT 'reception',
                status ENUM('active', 'disabled') NOT NULL DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ users表创建成功');

        // 创建房间表
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS rooms (
                id INT AUTO_INCREMENT PRIMARY KEY,
                room_number VARCHAR(20) UNIQUE NOT NULL,
                room_type ENUM('single', 'double', 'suite', 'deluxe') NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                status ENUM('available', 'occupied', 'cleaning', 'maintenance') NOT NULL DEFAULT 'available',
                description TEXT,
                amenities JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ rooms表创建成功');

        // 创建客户表
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS customers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                phone VARCHAR(20),
                email VARCHAR(100),
                id_card VARCHAR(20),
                address TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ customers表创建成功');

        // 创建预订表
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS bookings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                customer_id INT,
                room_id INT,
                check_in_date DATE NOT NULL,
                check_out_date DATE NOT NULL,
                guests INT NOT NULL DEFAULT 1,
                total_price DECIMAL(10,2) NOT NULL,
                status ENUM('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled') NOT NULL DEFAULT 'pending',
                special_requests TEXT,
                created_by INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
                FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
                FOREIGN KEY (created_by) REFERENCES users(id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ bookings表创建成功');

        // 创建入住记录表
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS checkins (
                id INT AUTO_INCREMENT PRIMARY KEY,
                booking_id INT,
                actual_check_in DATETIME,
                actual_check_out DATETIME,
                status ENUM('checked_in', 'checked_out') NOT NULL DEFAULT 'checked_in',
                notes TEXT,
                created_by INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
                FOREIGN KEY (created_by) REFERENCES users(id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ checkins表创建成功');

        // 创建待办事项表
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS todolist (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                status ENUM('pending', 'completed') NOT NULL DEFAULT 'pending',
                priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
                assigned_to INT,
                created_by INT,
                due_date DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (assigned_to) REFERENCES users(id),
                FOREIGN KEY (created_by) REFERENCES users(id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ todolist表创建成功');

        // 创建会话存储表
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS sessions (
                session_id VARCHAR(128) COLLATE utf8mb4_bin NOT NULL,
                expires INT(11) UNSIGNED NOT NULL,
                data MEDIUMTEXT COLLATE utf8mb4_bin,
                PRIMARY KEY (session_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ sessions表创建成功');

        console.log('🌱 插入初始数据...');

        // 检查是否已有管理员用户
        const [adminExists] = await connection.execute('SELECT id FROM users WHERE role = "admin" LIMIT 1');
        
        if (adminExists.length === 0) {
            // 插入默认管理员用户（密码：admin123）
            const bcrypt = require('bcrypt');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            
            await connection.execute(`
                INSERT INTO users (username, password, email, role, status) 
                VALUES ('admin', ?, 'admin@room-management.com', 'admin', 'active')
            `, [hashedPassword]);
            console.log('✅ 默认管理员用户创建成功 (用户名: admin, 密码: admin123)');
        } else {
            console.log('ℹ️ 管理员用户已存在，跳过创建');
        }

        // 检查是否已有房间数据
        const [roomExists] = await connection.execute('SELECT id FROM rooms LIMIT 1');
        
        if (roomExists.length === 0) {
            // 插入示例房间数据
            const roomData = [
                ['101', 'single', 150.00, 'available', '标准单人间，配备基础设施'],
                ['102', 'single', 150.00, 'available', '标准单人间，配备基础设施'],
                ['103', 'single', 150.00, 'cleaning', '标准单人间，配备基础设施'],
                ['201', 'double', 250.00, 'available', '舒适双人间，宽敞明亮'],
                ['202', 'double', 250.00, 'occupied', '舒适双人间，宽敞明亮'],
                ['203', 'double', 250.00, 'available', '舒适双人间，宽敞明亮'],
                ['301', 'suite', 450.00, 'available', '豪华套房，配备客厅和卧室'],
                ['302', 'deluxe', 650.00, 'maintenance', '总统套房，顶级奢华体验']
            ];

            for (const room of roomData) {
                await connection.execute(`
                    INSERT INTO rooms (room_number, room_type, price, status, description) 
                    VALUES (?, ?, ?, ?, ?)
                `, room);
            }
            console.log(`✅ ${roomData.length}个示例房间创建成功`);
        } else {
            console.log('ℹ️ 房间数据已存在，跳过创建');
        }

        // 检查是否已有客户数据
        const [customerExists] = await connection.execute('SELECT id FROM customers LIMIT 1');
        
        if (customerExists.length === 0) {
            // 插入示例客户数据
            const customerData = [
                ['张三', '13800138001', 'zhangsan@example.com', '110101199001011234'],
                ['李四', '13800138002', 'lisi@example.com', '110101199002022345'],
                ['王五', '13800138003', 'wangwu@example.com', '110101199003033456'],
                ['赵六', '13800138004', 'zhaoliu@example.com', '110101199004044567'],
                ['孙七', '13800138005', 'sunqi@example.com', '110101199005055678']
            ];

            for (const customer of customerData) {
                await connection.execute(`
                    INSERT INTO customers (name, phone, email, id_card) 
                    VALUES (?, ?, ?, ?)
                `, customer);
            }
            console.log(`✅ ${customerData.length}个示例客户创建成功`);
        } else {
            console.log('ℹ️ 客户数据已存在，跳过创建');
        }

        console.log('🎉 数据库初始化完成！');
        console.log('📍 数据库配置:');
        console.log(`   - 主机: ${process.env.DB_HOST || 'localhost'}`);
        console.log(`   - 数据库: ${process.env.DB_NAME || 'room_management'}`);
        console.log(`   - 用户: ${process.env.DB_USER || 'root'}`);
        console.log('🔐 默认管理员账户:');
        console.log('   - 用户名: admin');
        console.log('   - 密码: admin123');
        console.log('   - 邮箱: admin@room-management.com');

    } catch (error) {
        console.error('❌ 数据库初始化失败:', error.message);
        console.error('📋 错误详情:', error);
        
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('💡 请检查数据库用户名和密码是否正确');
        } else if (error.code === 'ECONNREFUSED') {
            console.log('💡 请确保MySQL服务正在运行');
        }
        
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 数据库连接已关闭');
        }
    }
}

// 运行初始化
if (require.main === module) {
    initDatabase();
}

module.exports = initDatabase;
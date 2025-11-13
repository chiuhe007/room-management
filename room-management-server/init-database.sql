-- 房间管理系统数据库初始化脚本
CREATE DATABASE IF NOT EXISTS room_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE room_management;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role ENUM('admin', 'reception', 'housekeeper') NOT NULL DEFAULT 'reception',
    status ENUM('active', 'disabled') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 房间表
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
);

-- 客户表
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    id_card VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 预订表
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
);

-- 入住记录表
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
);

-- 待办事项表
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
);

-- 会话存储表（用于express-session）
CREATE TABLE IF NOT EXISTS sessions (
    session_id VARCHAR(128) COLLATE utf8mb4_bin NOT NULL,
    expires INT(11) UNSIGNED NOT NULL,
    data MEDIUMTEXT COLLATE utf8mb4_bin,
    PRIMARY KEY (session_id)
);

-- 插入默认管理员用户（密码：admin123）
INSERT IGNORE INTO users (username, password, email, role, status) VALUES 
('admin', '$2b$10$rQYJKr7U4qY1l1l9Z5gOXeqYqHJ7J6qY1l1l9Z5gOXeqYqHJ7J6qY2', 'admin@room-management.com', 'admin', 'active');

-- 插入示例房间数据
INSERT IGNORE INTO rooms (room_number, room_type, price, status, description) VALUES 
('101', 'single', 150.00, 'available', '标准单人间，配备基础设施'),
('102', 'single', 150.00, 'available', '标准单人间，配备基础设施'),
('201', 'double', 250.00, 'available', '舒适双人间，宽敞明亮'),
('202', 'double', 250.00, 'occupied', '舒适双人间，宽敞明亮'),
('301', 'suite', 450.00, 'available', '豪华套房，配备客厅和卧室'),
('302', 'deluxe', 650.00, 'maintenance', '总统套房，顶级奢华体验');

-- 插入示例客户数据
INSERT IGNORE INTO customers (name, phone, email, id_card) VALUES 
('张三', '13800138001', 'zhangsan@example.com', '110101199001011234'),
('李四', '13800138002', 'lisi@example.com', '110101199002022345'),
('王五', '13800138003', 'wangwu@example.com', '110101199003033456');
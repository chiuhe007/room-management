-- 001_role_enum_add_housekeeper.sql
-- 将 users.role 列修改为 ENUM 并包含 housekeeper
-- 注意：在执行前请备份 users 表或数据库。

-- 检查并备份（可选）示例：
-- CREATE TABLE users_backup AS SELECT * FROM users;

-- 将 role 列改为 ENUM。若 role 当前为 VARCHAR，这将尝试转换已有值。
-- 为防止失败，先把 NULL 值设为默认 'active'（或一个有效角色），下面示例假设 role 为空时设为 'reception'：

-- STEP 1: 将任意不在枚举集合中的值替换为一个安全值（此处为 'reception'）
UPDATE users SET role = 'reception' WHERE role NOT IN ('admin','reception','housekeeper') OR role IS NULL;

-- STEP 2: 修改列类型为 ENUM
ALTER TABLE users
  MODIFY COLUMN role ENUM('admin','reception','housekeeper') NOT NULL DEFAULT 'reception';

-- 说明：
-- 1) 根据你的业务需要调整默认值（此处使用 'reception' 作为示例）。
-- 2) 如果你偏好默认 'admin' 或空值，请先在 SQL 中调整 UPDATE/ALTER 语句。
-- 3) 在大数据量表上执行 ALTER 可能锁表较久，请在低流量时段运行或使用在线变更工具（pt-online-schema-change）。

-- 007_add_real_name_field.sql
-- 添加真实姓名字段

ALTER TABLE users 
ADD COLUMN real_name VARCHAR(100) COMMENT '真实姓名';
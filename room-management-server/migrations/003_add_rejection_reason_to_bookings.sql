-- 为 bookings 表添加 rejection_reason 字段
ALTER TABLE bookings 
ADD COLUMN rejection_reason TEXT COMMENT '拒绝原因备注';
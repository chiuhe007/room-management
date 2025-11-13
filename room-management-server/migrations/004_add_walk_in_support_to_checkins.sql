-- 为checkins表添加散客入住支持
-- 添加字段用于支持散客入住（无预订）

ALTER TABLE checkins 
ADD COLUMN customer_name VARCHAR(100) NULL COMMENT '散客姓名（散客入住时使用）',
ADD COLUMN room_type VARCHAR(50) NULL COMMENT '房型（散客入住时使用）',
ADD COLUMN checkin_type VARCHAR(20) DEFAULT 'with-booking' COMMENT '入住类型：with-booking=有预订，walk-in=散客';

-- 修改booking_id字段为可空（散客入住时不需要预订ID）
ALTER TABLE checkins 
MODIFY COLUMN booking_id INT NULL COMMENT '预订ID（有预订入住时使用）';

-- 添加约束：有预订入住时必须有booking_id，散客入住时必须有customer_name和room_type
-- 这个约束在应用层进行检查，数据库层面保持灵活性
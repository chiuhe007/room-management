-- 为checkins表添加身份证号、金额和续住支持
-- 扩展散客入住功能

ALTER TABLE checkins 
ADD COLUMN id_card VARCHAR(20) NULL COMMENT '身份证号（散客入住时使用）',
ADD COLUMN amount DECIMAL(10,2) NULL COMMENT '入住金额（散客入住时使用）',
ADD COLUMN is_extended BOOLEAN DEFAULT FALSE COMMENT '是否续住',
ADD COLUMN extend_days INT DEFAULT 0 COMMENT '续住天数',
ADD COLUMN extend_amount DECIMAL(10,2) DEFAULT 0 COMMENT '续住费用';

-- 为身份证号字段添加索引（可选，用于快速查询）
CREATE INDEX idx_checkins_id_card ON checkins(id_card);
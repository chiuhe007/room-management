-- 更新房间表以支持前端页面功能
USE room_management;

-- 1. 修改房间类型枚举，添加前端需要的房型
ALTER TABLE rooms MODIFY COLUMN room_type ENUM(
    'single', 'double', 'suite', 'deluxe',
    '大床房', '特价房', '套房', '双人房', '家庭房', '总统套房'
) NOT NULL;

-- 2. 为了保持向后兼容，更新现有数据
UPDATE rooms SET room_type = '大床房' WHERE room_type = 'single';
UPDATE rooms SET room_type = '双人房' WHERE room_type = 'double';
UPDATE rooms SET room_type = '套房' WHERE room_type = 'suite';
UPDATE rooms SET room_type = '总统套房' WHERE room_type = 'deluxe';

-- 3. 更新房间类型枚举，只保留中文房型
ALTER TABLE rooms MODIFY COLUMN room_type ENUM(
    '大床房', '特价房', '套房', '双人房', '家庭房', '总统套房'
) NOT NULL;

-- 4. 添加图片字段
ALTER TABLE rooms ADD COLUMN image TEXT COMMENT '房间图片，存储base64或图片URL';

-- 5. 更新现有房间数据，添加示例图片和调整价格
UPDATE rooms SET 
    price = 188.00,
    image = NULL
WHERE room_type = '大床房';

UPDATE rooms SET 
    price = 128.00,
    image = NULL
WHERE room_type = '特价房';

UPDATE rooms SET 
    price = 388.00,
    image = NULL
WHERE room_type = '套房';

UPDATE rooms SET 
    price = 228.00,
    image = NULL
WHERE room_type = '双人房';

UPDATE rooms SET 
    price = 458.00,
    image = NULL
WHERE room_type = '家庭房';

UPDATE rooms SET 
    price = 888.00,
    image = NULL
WHERE room_type = '总统套房';

-- 6. 添加更多示例房间数据（8层楼，每层多个房间）
INSERT INTO rooms (room_number, room_type, price, status, description, image) VALUES 
-- 1楼
('101', '大床房', 188.00, 'available', '一楼大床房，方便入住', NULL),
('102', '大床房', 188.00, 'occupied', '一楼大床房，方便入住', NULL),
('103', '特价房', 128.00, 'available', '经济实惠的特价房', NULL),
('104', '双人房', 228.00, 'cleaning', '舒适的双人房间', NULL),

-- 2楼
('201', '双人房', 228.00, 'available', '二楼双人房，视野开阔', NULL),
('202', '双人房', 228.00, 'occupied', '二楼双人房，视野开阔', NULL),
('203', '大床房', 188.00, 'available', '二楼大床房', NULL),
('204', '特价房', 128.00, 'maintenance', '经济房型', NULL),

-- 3楼
('301', '套房', 388.00, 'available', '三楼套房，空间宽敞', NULL),
('302', '套房', 388.00, 'occupied', '三楼套房，空间宽敞', NULL),
('303', '双人房', 228.00, 'available', '三楼双人房', NULL),
('304', '大床房', 188.00, 'cleaning', '三楼大床房', NULL),

-- 4楼
('401', '家庭房', 458.00, 'available', '四楼家庭房，适合家庭入住', NULL),
('402', '家庭房', 458.00, 'occupied', '四楼家庭房，适合家庭入住', NULL),
('403', '套房', 388.00, 'available', '四楼套房', NULL),
('404', '双人房', 228.00, 'available', '四楼双人房', NULL),

-- 5楼
('501', '套房', 388.00, 'available', '五楼套房，环境优美', NULL),
('502', '套房', 388.00, 'maintenance', '五楼套房，环境优美', NULL),
('503', '家庭房', 458.00, 'available', '五楼家庭房', NULL),
('504', '大床房', 188.00, 'occupied', '五楼大床房', NULL),

-- 6楼
('601', '家庭房', 458.00, 'available', '六楼家庭房，温馨舒适', NULL),
('602', '套房', 388.00, 'available', '六楼套房', NULL),
('603', '双人房', 228.00, 'cleaning', '六楼双人房', NULL),
('604', '特价房', 128.00, 'available', '六楼特价房', NULL),

-- 7楼
('701', '总统套房', 888.00, 'available', '七楼总统套房，奢华体验', NULL),
('702', '总统套房', 888.00, 'maintenance', '七楼总统套房，奢华体验', NULL),
('703', '家庭房', 458.00, 'available', '七楼家庭房', NULL),
('704', '套房', 388.00, 'occupied', '七楼套房', NULL),

-- 8楼
('801', '总统套房', 888.00, 'available', '八楼总统套房，顶级享受', NULL),
('802', '总统套房', 888.00, 'occupied', '八楼总统套房，顶级享受', NULL),
('803', '总统套房', 888.00, 'available', '八楼总统套房，顶级享受', NULL),
('804', '家庭房', 458.00, 'cleaning', '八楼家庭房', NULL)

ON DUPLICATE KEY UPDATE 
room_number = VALUES(room_number);

-- 7. 查看更新后的房间数据
SELECT room_number, room_type, price, status, description FROM rooms ORDER BY room_number;
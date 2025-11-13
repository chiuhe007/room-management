-- Update rooms table for frontend compatibility
USE room_management;

-- Add image column first
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS image TEXT COMMENT 'Room image URL or base64 data';

-- Update room_type column to use VARCHAR instead of ENUM for Chinese characters
ALTER TABLE rooms MODIFY COLUMN room_type VARCHAR(50) NOT NULL;

-- Update existing room types
UPDATE rooms SET room_type = 'double' WHERE room_type = 'single';
UPDATE rooms SET room_type = 'suite' WHERE room_type = 'double';

-- Insert sample rooms with Chinese room types
INSERT IGNORE INTO rooms (room_number, room_type, price, status, description) VALUES 
-- Floor 1
('105', '大床房', 188.00, 'available', '一楼大床房，方便入住'),
('106', '特价房', 128.00, 'occupied', '经济实惠的特价房'),
-- Floor 2  
('205', '双人房', 228.00, 'available', '二楼双人房，视野开阔'),
('206', '套房', 388.00, 'cleaning', '二楼套房'),
-- Floor 3
('305', '家庭房', 458.00, 'available', '三楼家庭房，适合家庭入住'),
('306', '总统套房', 888.00, 'maintenance', '三楼总统套房');

-- Update existing rooms to use Chinese room types
UPDATE rooms SET 
    room_type = '大床房',
    price = 188.00
WHERE room_number IN ('101', '102');

UPDATE rooms SET 
    room_type = '双人房', 
    price = 228.00
WHERE room_number IN ('201', '202');

UPDATE rooms SET 
    room_type = '套房',
    price = 388.00  
WHERE room_number = '301';

UPDATE rooms SET 
    room_type = '总统套房',
    price = 888.00
WHERE room_number = '302';
/*
 Navicat Premium Dump SQL

 Source Server         : local_MySQL
 Source Server Type    : MySQL
 Source Server Version : 90200 (9.2.0)
 Source Host           : localhost:3306
 Source Schema         : room_management

 Target Server Type    : MySQL
 Target Server Version : 90200 (9.2.0)
 File Encoding         : 65001

 Date: 13/11/2025 14:49:33
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for bookings
-- ----------------------------
DROP TABLE IF EXISTS `bookings`;
CREATE TABLE `bookings`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `roomType` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `startDate` date NOT NULL,
  `endDate` date NOT NULL,
  `remark` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `customer_id` int NULL DEFAULT NULL,
  `room_type_id` int NULL DEFAULT NULL,
  `status` enum('pending','confirmed','checked_in','checked_out','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `price` decimal(10, 2) NULL DEFAULT NULL,
  `booking_no` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `amount` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '预订金额',
  `rejection_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '拒绝原因备注',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `booking_no`(`booking_no` ASC) USING BTREE,
  INDEX `fk_booking_customer`(`customer_id` ASC) USING BTREE,
  INDEX `fk_bookings_roomtype`(`room_type_id` ASC) USING BTREE,
  CONSTRAINT `fk_booking_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_bookings_roomtype` FOREIGN KEY (`room_type_id`) REFERENCES `room_types` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 68 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of bookings
-- ----------------------------
INSERT INTO `bookings` VALUES (42, '于欣宏', '套房', '2025-11-12', '2025-11-15', '', '2025-11-12 11:29:14', '2025-11-12 13:44:05', 1, NULL, 'checked_out', NULL, NULL, 1797.00, NULL);
INSERT INTO `bookings` VALUES (45, '老六', '套房', '2025-11-12', '2025-11-17', '', '2025-11-12 13:52:57', '2025-11-13 11:06:56', 54, NULL, 'checked_out', NULL, NULL, 2396.00, NULL);
INSERT INTO `bookings` VALUES (67, '巫芝峰', '总统套房', '2025-11-13', '2025-11-20', '安静', '2025-11-13 13:13:13', '2025-11-13 13:13:32', 76, NULL, 'confirmed', NULL, NULL, 13993.00, NULL);

-- ----------------------------
-- Table structure for checkins
-- ----------------------------
DROP TABLE IF EXISTS `checkins`;
CREATE TABLE `checkins`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NULL DEFAULT NULL COMMENT '棰勮?ID锛堟湁棰勮?鍏ヤ綇鏃朵娇鐢?級',
  `room_number` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `checkin_date` date NOT NULL,
  `checkout_date` date NOT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `remark` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `customer_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '鏁ｅ?濮撳悕锛堟暎瀹㈠叆浣忔椂浣跨敤锛',
  `room_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '鎴垮瀷锛堟暎瀹㈠叆浣忔椂浣跨敤锛',
  `checkin_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'with-booking' COMMENT '鍏ヤ綇绫诲瀷锛歸ith-booking=鏈夐?璁?紝walk-in=鏁ｅ?',
  `id_card` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '韬?唤璇佸彿锛堟暎瀹㈠叆浣忔椂浣跨敤锛',
  `amount` decimal(10, 2) NULL DEFAULT NULL COMMENT '鍏ヤ綇閲戦?锛堟暎瀹㈠叆浣忔椂浣跨敤锛',
  `is_extended` tinyint(1) NULL DEFAULT 0 COMMENT '鏄?惁缁?綇',
  `extend_days` int NULL DEFAULT 0 COMMENT '缁?綇澶╂暟',
  `extend_amount` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '缁?綇璐圭敤',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `booking_id`(`booking_id` ASC) USING BTREE,
  INDEX `room_number`(`room_number` ASC) USING BTREE,
  INDEX `idx_checkins_id_card`(`id_card` ASC) USING BTREE,
  CONSTRAINT `checkins_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `checkins_ibfk_2` FOREIGN KEY (`room_number`) REFERENCES `rooms` (`room_number`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 38 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of checkins
-- ----------------------------
INSERT INTO `checkins` VALUES (35, 42, '8123', '2025-11-11', '2025-11-15', '已离店', '啦啦啦', '2025-11-12 13:11:12', NULL, NULL, 'with-booking', NULL, NULL, 0, 0, 0.00);
INSERT INTO `checkins` VALUES (37, 45, '8124', '2025-11-12', '2025-11-17', '已离店', '', '2025-11-12 14:14:47', NULL, NULL, 'with-booking', NULL, NULL, 1, 2, 1198.00);

-- ----------------------------
-- Table structure for customers
-- ----------------------------
DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `idNumber` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 77 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of customers
-- ----------------------------
INSERT INTO `customers` VALUES (1, '于欣宏', '1985467892', '1690185063@qq.com', '2450710133');
INSERT INTO `customers` VALUES (2, '侯静', '13800001050', 'houjing@example.com', '110101199402200050');
INSERT INTO `customers` VALUES (3, '张三', '18001323626', '1690185063@qq.com', '2450710111');
INSERT INTO `customers` VALUES (4, '张伟', '13800001001', 'zhangwei@example.com', '110101199001010001');
INSERT INTO `customers` VALUES (5, '李娜', '13800001002', 'lina@example.com', '110101199002020002');
INSERT INTO `customers` VALUES (6, '王强', '13800001003', 'wangqiang@example.com', '110101199003030003');
INSERT INTO `customers` VALUES (7, '刘洋', '13800001004', 'liuyang@example.com', '110101199004040004');
INSERT INTO `customers` VALUES (8, '陈杰', '13800001005', 'chenjie@example.com', '110101199005050005');
INSERT INTO `customers` VALUES (9, '杨静', '13800001006', 'yangjing@example.com', '110101199006060006');
INSERT INTO `customers` VALUES (10, '赵敏', '13800001007', 'zhaomin@example.com', '110101199007070007');
INSERT INTO `customers` VALUES (11, '黄磊', '13800001008', 'huanglei@example.com', '110101199008080008');
INSERT INTO `customers` VALUES (12, '周婷', '13800001009', 'zhouting@example.com', '110101199009090009');
INSERT INTO `customers` VALUES (13, '吴超', '13800001010', 'wuchao@example.com', '110101199010100010');
INSERT INTO `customers` VALUES (14, '徐华', '13800001011', 'xuhua@example.com', '110101199011110011');
INSERT INTO `customers` VALUES (15, '孙丽', '13800001012', 'sunli@example.com', '110101199012120012');
INSERT INTO `customers` VALUES (16, '马强', '13800001013', 'maqiang@example.com', '110101199101130013');
INSERT INTO `customers` VALUES (17, '朱静', '13800001014', 'zhujing@example.com', '110101199102140014');
INSERT INTO `customers` VALUES (18, '胡斌', '13800001015', 'hubin@example.com', '110101199103150015');
INSERT INTO `customers` VALUES (19, '郭芳', '13800001016', 'guofang@example.com', '110101199104160016');
INSERT INTO `customers` VALUES (20, '何伟', '13800001017', 'hewei@example.com', '110101199105170017');
INSERT INTO `customers` VALUES (21, '高敏', '13800001018', 'gaomin@example.com', '110101199106180018');
INSERT INTO `customers` VALUES (22, '林杰', '13800001019', 'linjie@example.com', '110101199107190019');
INSERT INTO `customers` VALUES (23, '罗华', '13800001020', 'luohua@example.com', '110101199108200020');
INSERT INTO `customers` VALUES (24, '郑丽', '13800001021', 'zhengli@example.com', '110101199109210021');
INSERT INTO `customers` VALUES (25, '谢强', '13800001022', 'xieqiang@example.com', '110101199110220022');
INSERT INTO `customers` VALUES (26, '宋静', '13800001023', 'songjing@example.com', '110101199111230023');
INSERT INTO `customers` VALUES (27, '唐勇', '13800001024', 'tangyong@example.com', '110101199112240024');
INSERT INTO `customers` VALUES (28, '许芳', '13800001025', 'xufang@example.com', '110101199201250025');
INSERT INTO `customers` VALUES (29, '邓伟', '13800001026', 'dengwei@example.com', '110101199202260026');
INSERT INTO `customers` VALUES (30, '曹敏', '13800001027', 'caomin@example.com', '110101199203270027');
INSERT INTO `customers` VALUES (31, '袁杰', '13800001028', 'yuanjie@example.com', '110101199204280028');
INSERT INTO `customers` VALUES (32, '贾华', '13800001029', 'jiahua@example.com', '110101199205290029');
INSERT INTO `customers` VALUES (33, '段丽', '13800001030', 'duanli@example.com', '110101199206300030');
INSERT INTO `customers` VALUES (34, '沈强', '13800001031', 'shenqiang@example.com', '110101199207010031');
INSERT INTO `customers` VALUES (35, '姚静', '13800001032', 'yaojing@example.com', '110101199208020032');
INSERT INTO `customers` VALUES (36, '潘勇', '13800001033', 'panyong@example.com', '110101199209030033');
INSERT INTO `customers` VALUES (37, '田芳', '13800001034', 'tianfang@example.com', '110101199210040034');
INSERT INTO `customers` VALUES (38, '姜伟', '13800001035', 'jiangwei@example.com', '110101199211050035');
INSERT INTO `customers` VALUES (39, '范敏', '13800001036', 'fanmin@example.com', '110101199212060036');
INSERT INTO `customers` VALUES (40, '魏杰', '13800001037', 'weijie@example.com', '110101199301070037');
INSERT INTO `customers` VALUES (41, '熊华', '13800001038', 'xionghua@example.com', '110101199302080038');
INSERT INTO `customers` VALUES (42, '金丽', '13800001039', 'jinli@example.com', '110101199303090039');
INSERT INTO `customers` VALUES (43, '陆强', '13800001040', 'luqiang@example.com', '110101199304100040');
INSERT INTO `customers` VALUES (44, '石静', '13800001041', 'shijing@example.com', '110101199305110041');
INSERT INTO `customers` VALUES (45, '白勇', '13800001042', 'baiyong@example.com', '110101199306120042');
INSERT INTO `customers` VALUES (46, '崔芳', '13800001043', 'cuifang@example.com', '110101199307130043');
INSERT INTO `customers` VALUES (47, '康伟', '13800001044', 'kangwei@example.com', '110101199308140044');
INSERT INTO `customers` VALUES (48, '毛敏', '13800001045', 'maomin@example.com', '110101199309150045');
INSERT INTO `customers` VALUES (49, '邱杰', '13800001046', 'qiujie@example.com', '110101199310160046');
INSERT INTO `customers` VALUES (50, '秦华', '13800001047', 'qinhua@example.com', '110101199311170047');
INSERT INTO `customers` VALUES (51, '赖丽', '13800001048', 'laili@example.com', '110101199312180048');
INSERT INTO `customers` VALUES (52, '顾强', '13800001049', 'guqiang@example.com', '110101199401190049');
INSERT INTO `customers` VALUES (54, '老六', '13800001047', '1690185063@qq.com', '132354651154351031355');
INSERT INTO `customers` VALUES (58, '李婷婷', '18003264762', '1690185063@qq.com', '223423534534');
INSERT INTO `customers` VALUES (62, '黎明', '18001323626', '1690185063@qq.com', '46545153132');
INSERT INTO `customers` VALUES (66, '余一航', '18001323628', '1690185063@qq.com', '5135461534511245');
INSERT INTO `customers` VALUES (76, '巫芝峰', '18001323626', NULL, '452132199912070035');

-- ----------------------------
-- Table structure for history_records
-- ----------------------------
DROP TABLE IF EXISTS `history_records`;
CREATE TABLE `history_records`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `room_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `checkin_date` date NULL DEFAULT NULL,
  `checkout_date` date NULL DEFAULT NULL,
  `remark` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `customer_id`(`customer_id` ASC) USING BTREE,
  CONSTRAINT `history_records_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 260 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of history_records
-- ----------------------------
INSERT INTO `history_records` VALUES (1, 1, '101', '2025-07-01', '2025-07-02', NULL);
INSERT INTO `history_records` VALUES (174, 5, '204', '2024-03-21', '2024-03-25', '提前入住');
INSERT INTO `history_records` VALUES (175, 33, '305', '2025-01-10', '2025-01-20', 'VIP客户，需提供早餐');
INSERT INTO `history_records` VALUES (176, 12, '702', '2024-12-05', '2024-12-10', '延迟退房');
INSERT INTO `history_records` VALUES (177, 18, '403', '2025-05-18', '2025-05-22', '无特殊情况');
INSERT INTO `history_records` VALUES (178, 25, '101', '2024-07-01', '2024-07-05', '节假日优惠');
INSERT INTO `history_records` VALUES (179, 7, '602', '2025-06-10', '2025-06-15', '临时预订');
INSERT INTO `history_records` VALUES (180, 41, '809', '2024-11-23', '2024-11-28', '客户带宠物');
INSERT INTO `history_records` VALUES (181, 3, '504', '2024-10-01', '2024-10-06', '需安静房间');
INSERT INTO `history_records` VALUES (182, 14, '207', '2025-03-08', '2025-03-15', '无');
INSERT INTO `history_records` VALUES (183, 29, '901', '2024-08-12', '2024-08-18', '提前两天入住');
INSERT INTO `history_records` VALUES (184, 22, '308', '2024-09-20', '2024-09-25', '特殊节日折扣');
INSERT INTO `history_records` VALUES (185, 6, '612', '2025-02-15', '2025-02-20', 'VIP客户');
INSERT INTO `history_records` VALUES (186, 44, '403', '2024-04-17', '2024-04-22', '客户投诉房间设备');
INSERT INTO `history_records` VALUES (187, 1, '705', '2024-06-10', '2024-06-15', '无');
INSERT INTO `history_records` VALUES (188, 17, '302', '2024-10-30', '2024-11-03', '延迟退房申请');
INSERT INTO `history_records` VALUES (189, 30, '804', '2025-01-05', '2025-01-12', '提前入住，需加床');
INSERT INTO `history_records` VALUES (190, 39, '106', '2024-07-22', '2024-07-27', '无特殊情况');
INSERT INTO `history_records` VALUES (191, 11, '507', '2024-12-01', '2024-12-07', '客户生日，赠送蛋糕');
INSERT INTO `history_records` VALUES (192, 28, '209', '2025-05-10', '2025-05-15', '客户有特殊饮食需求');
INSERT INTO `history_records` VALUES (193, 4, '310', '2024-09-25', '2024-09-30', '无');
INSERT INTO `history_records` VALUES (194, 15, '402', '2024-08-08', '2024-08-12', '无');
INSERT INTO `history_records` VALUES (195, 35, '503', '2025-03-10', '2025-03-14', '节假日加价');
INSERT INTO `history_records` VALUES (196, 9, '605', '2025-04-20', '2025-04-25', '无');
INSERT INTO `history_records` VALUES (197, 21, '702', '2024-11-15', '2024-11-20', '提前入住');
INSERT INTO `history_records` VALUES (198, 8, '101', '2024-06-01', '2024-06-06', 'VIP客户');
INSERT INTO `history_records` VALUES (199, 26, '806', '2024-07-30', '2024-08-05', '无');
INSERT INTO `history_records` VALUES (200, 42, '903', '2025-02-22', '2025-02-28', '延迟退房');
INSERT INTO `history_records` VALUES (201, 13, '207', '2024-10-05', '2024-10-10', '无');
INSERT INTO `history_records` VALUES (202, 24, '404', '2024-12-15', '2024-12-20', '节假日');
INSERT INTO `history_records` VALUES (203, 40, '302', '2025-05-01', '2025-05-06', '客户需要无烟房');
INSERT INTO `history_records` VALUES (204, 2, '608', '2024-08-10', '2024-08-14', '无');
INSERT INTO `history_records` VALUES (205, 31, '709', '2025-01-22', '2025-01-26', '无');
INSERT INTO `history_records` VALUES (206, 16, '105', '2024-04-01', '2024-04-06', '提前两天入住');
INSERT INTO `history_records` VALUES (207, 38, '503', '2025-03-15', '2025-03-21', '无');
INSERT INTO `history_records` VALUES (208, 27, '801', '2024-07-15', '2024-07-20', '无');
INSERT INTO `history_records` VALUES (209, 20, '909', '2025-06-01', '2025-06-05', '客户带儿童');
INSERT INTO `history_records` VALUES (210, 36, '502', '2024-11-10', '2024-11-14', '无');
INSERT INTO `history_records` VALUES (211, 10, '605', '2025-02-02', '2025-02-08', 'VIP客户');
INSERT INTO `history_records` VALUES (212, 23, '304', '2024-09-05', '2024-09-10', '无');
INSERT INTO `history_records` VALUES (213, 43, '708', '2024-12-28', '2025-01-02', '提前入住');
INSERT INTO `history_records` VALUES (214, 5, '402', '2024-06-15', '2024-06-20', '无');
INSERT INTO `history_records` VALUES (215, 14, '205', '2025-04-08', '2025-04-12', '无');
INSERT INTO `history_records` VALUES (216, 37, '603', '2025-03-05', '2025-03-10', '无');
INSERT INTO `history_records` VALUES (217, 1, '701', '2024-08-20', '2024-08-25', '无');
INSERT INTO `history_records` VALUES (218, 22, '302', '2024-12-05', '2024-12-10', '无');
INSERT INTO `history_records` VALUES (219, 8, '505', '2025-01-15', '2025-01-20', '延迟退房');
INSERT INTO `history_records` VALUES (220, 29, '104', '2025-05-10', '2025-05-14', '无');
INSERT INTO `history_records` VALUES (221, 12, '706', '2024-07-02', '2024-07-07', '无');
INSERT INTO `history_records` VALUES (222, 16, '208', '2024-10-25', '2024-10-30', '无');
INSERT INTO `history_records` VALUES (223, 41, '501', '2025-04-15', '2025-04-20', 'VIP客户');
INSERT INTO `history_records` VALUES (224, 7, '306', '2024-06-10', '2024-06-14', '无');
INSERT INTO `history_records` VALUES (225, 33, '809', '2025-03-20', '2025-03-25', '无');
INSERT INTO `history_records` VALUES (226, 19, '202', '2024-09-17', '2024-09-22', '无');
INSERT INTO `history_records` VALUES (227, 24, '601', '2024-11-20', '2024-11-25', '无');
INSERT INTO `history_records` VALUES (228, 6, '408', '2025-01-11', '2025-01-15', '客户生日赠送礼品');
INSERT INTO `history_records` VALUES (229, 28, '710', '2024-08-12', '2024-08-17', '无');
INSERT INTO `history_records` VALUES (230, 9, '101', '2024-12-28', '2025-01-02', '无');
INSERT INTO `history_records` VALUES (231, 20, '603', '2024-10-01', '2024-10-05', '无');
INSERT INTO `history_records` VALUES (232, 4, '205', '2025-03-14', '2025-03-18', '无');
INSERT INTO `history_records` VALUES (233, 15, '707', '2024-09-05', '2024-09-10', '无');
INSERT INTO `history_records` VALUES (234, 35, '502', '2024-07-18', '2024-07-22', '提前入住');
INSERT INTO `history_records` VALUES (235, 3, '804', '2024-11-11', '2024-11-16', '无');
INSERT INTO `history_records` VALUES (236, 26, '305', '2025-02-22', '2025-02-27', '无');
INSERT INTO `history_records` VALUES (237, 38, '902', '2025-04-02', '2025-04-07', '无');
INSERT INTO `history_records` VALUES (238, 10, '405', '2024-12-14', '2024-12-19', '无');
INSERT INTO `history_records` VALUES (239, 23, '509', '2025-05-03', '2025-05-07', '无');
INSERT INTO `history_records` VALUES (240, 43, '302', '2024-08-10', '2024-08-15', '客户有特殊需求');
INSERT INTO `history_records` VALUES (241, 18, '608', '2024-06-02', '2024-06-07', '无');
INSERT INTO `history_records` VALUES (242, 1, '705', '2024-04-12', '2024-04-17', '无');
INSERT INTO `history_records` VALUES (243, 22, '304', '2025-01-07', '2025-01-12', '无');
INSERT INTO `history_records` VALUES (244, 8, '502', '2025-06-12', '2025-06-17', '客户带宠物');
INSERT INTO `history_records` VALUES (245, 29, '102', '2025-04-15', '2025-04-20', '无');
INSERT INTO `history_records` VALUES (246, 12, '703', '2024-08-01', '2024-08-06', '无');
INSERT INTO `history_records` VALUES (247, 16, '205', '2024-09-22', '2024-09-27', '无');
INSERT INTO `history_records` VALUES (248, 41, '406', '2024-10-15', '2024-10-20', 'VIP客户');
INSERT INTO `history_records` VALUES (249, 7, '209', '2025-01-10', '2025-01-15', '无');
INSERT INTO `history_records` VALUES (250, 33, '809', '2025-02-12', '2025-02-17', '无');
INSERT INTO `history_records` VALUES (251, 19, '302', '2024-07-10', '2024-07-15', '无');
INSERT INTO `history_records` VALUES (252, 24, '405', '2025-03-20', '2025-03-25', '无');
INSERT INTO `history_records` VALUES (253, 6, '603', '2024-06-08', '2024-06-13', '无');
INSERT INTO `history_records` VALUES (254, 28, '901', '2024-12-22', '2024-12-27', '无');
INSERT INTO `history_records` VALUES (255, 9, '502', '2025-02-01', '2025-02-06', '无');
INSERT INTO `history_records` VALUES (256, 20, '305', '2024-08-30', '2024-09-04', '无');
INSERT INTO `history_records` VALUES (257, 4, '804', '2025-04-10', '2025-04-15', '无');
INSERT INTO `history_records` VALUES (258, 15, '207', '2025-05-05', '2025-05-10', '无');
INSERT INTO `history_records` VALUES (259, 35, '601', '2024-07-25', '2024-07-30', '无');

-- ----------------------------
-- Table structure for room_types
-- ----------------------------
DROP TABLE IF EXISTS `room_types`;
CREATE TABLE `room_types`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `price` decimal(10, 2) NOT NULL DEFAULT 0.00,
  `total_count` int NOT NULL DEFAULT 1,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `code`(`code` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of room_types
-- ----------------------------

-- ----------------------------
-- Table structure for rooms
-- ----------------------------
DROP TABLE IF EXISTS `rooms`;
CREATE TABLE `rooms`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `room_number` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10, 2) NOT NULL,
  `status` enum('available','occupied','maintenance','cleaning') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'available',
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `room_type_id` int NULL DEFAULT NULL,
  `image` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `room_number`(`room_number` ASC) USING BTREE,
  INDEX `fk_rooms_roomtype`(`room_type_id` ASC) USING BTREE,
  CONSTRAINT `fk_rooms_roomtype` FOREIGN KEY (`room_type_id`) REFERENCES `room_types` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 174 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of rooms
-- ----------------------------
INSERT INTO `rooms` VALUES (18, '8101', '大床房', 299.00, 'cleaning', '标准大床房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/大床房.jpg');
INSERT INTO `rooms` VALUES (19, '8102', '大床房', 299.00, 'cleaning', '标准大床房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/大床房.jpg');
INSERT INTO `rooms` VALUES (20, '8103', '大床房', 299.00, 'maintenance', '标准大床房, 马桶坏了', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/大床房.jpg');
INSERT INTO `rooms` VALUES (21, '8104', '大床房', 299.00, 'cleaning', '标准大床房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/大床房.jpg');
INSERT INTO `rooms` VALUES (22, '8105', '大床房', 299.00, 'occupied', '标准大床房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/大床房.jpg');
INSERT INTO `rooms` VALUES (23, '8106', '双人房', 349.00, 'cleaning', '标准双床房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/双人房.jpg');
INSERT INTO `rooms` VALUES (24, '8107', '双人房', 349.00, 'available', '标准双床房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/双人房.jpg');
INSERT INTO `rooms` VALUES (25, '8108', '双人房', 349.00, 'available', '标准双床房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/双人房.jpg');
INSERT INTO `rooms` VALUES (26, '8109', '双人房', 349.00, 'cleaning', '标准双床房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/双人房.jpg');
INSERT INTO `rooms` VALUES (27, '8110', '双人房', 349.00, 'cleaning', '标准双床房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/双人房.jpg');
INSERT INTO `rooms` VALUES (28, '8111', '家庭房', 399.00, 'cleaning', '家庭三人房', '2025-07-02 16:39:21', '2025-11-12 15:06:34', NULL, '/uploads/rooms/家庭房.jpg');
INSERT INTO `rooms` VALUES (29, '8112', '家庭房', 399.00, 'available', '家庭三人房', '2025-07-02 16:39:21', '2025-11-12 15:06:34', NULL, '/uploads/rooms/家庭房.jpg');
INSERT INTO `rooms` VALUES (30, '8113', '家庭房', 399.00, 'available', '家庭三人房', '2025-07-02 16:39:21', '2025-11-12 15:06:34', NULL, '/uploads/rooms/家庭房.jpg');
INSERT INTO `rooms` VALUES (31, '8114', '家庭房', 399.00, 'available', '家庭三人房', '2025-07-02 16:39:21', '2025-11-12 15:06:34', NULL, '/uploads/rooms/家庭房.jpg');
INSERT INTO `rooms` VALUES (32, '8115', '家庭房', 399.00, 'cleaning', '家庭三人房', '2025-07-02 16:39:21', '2025-11-12 15:06:34', NULL, '/uploads/rooms/家庭房.jpg');
INSERT INTO `rooms` VALUES (33, '8116', '特价房', 199.00, 'cleaning', '经济特价房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/特价房.jpg');
INSERT INTO `rooms` VALUES (34, '8117', '特价房', 199.00, 'available', '经济特价房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/特价房.jpg');
INSERT INTO `rooms` VALUES (35, '8118', '特价房', 199.00, 'occupied', '经济特价房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/特价房.jpg');
INSERT INTO `rooms` VALUES (36, '8119', '特价房', 199.00, 'available', '经济特价房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/特价房.jpg');
INSERT INTO `rooms` VALUES (37, '8120', '特价房', 199.00, 'maintenance', '经济特价房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/特价房.jpg');
INSERT INTO `rooms` VALUES (38, '8121', '套房', 599.00, 'occupied', '豪华套房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/套房.jpg');
INSERT INTO `rooms` VALUES (39, '8122', '套房', 599.00, 'cleaning', '豪华套房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/套房.jpg');
INSERT INTO `rooms` VALUES (40, '8123', '套房', 599.00, 'cleaning', '豪华套房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/套房.jpg');
INSERT INTO `rooms` VALUES (41, '8124', '套房', 599.00, 'cleaning', '豪华套房', '2025-07-02 16:39:21', '2025-11-13 11:06:56', NULL, '/uploads/rooms/套房.jpg');
INSERT INTO `rooms` VALUES (42, '8125', '套房', 599.00, 'available', '豪华套房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/套房.jpg');
INSERT INTO `rooms` VALUES (43, '8126', '大床房', 299.00, 'cleaning', '标准大床房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/大床房.jpg');
INSERT INTO `rooms` VALUES (44, '8127', '大床房', 299.00, 'available', '标准大床房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/大床房.jpg');
INSERT INTO `rooms` VALUES (45, '8128', '大床房', 299.00, 'available', '标准大床房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/大床房.jpg');
INSERT INTO `rooms` VALUES (46, '8129', '大床房', 299.00, 'available', '标准大床房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/大床房.jpg');
INSERT INTO `rooms` VALUES (47, '8130', '大床房', 299.00, 'maintenance', '标准大床房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/大床房.jpg');
INSERT INTO `rooms` VALUES (48, '8201', '大床房', 299.00, 'available', '标准大床房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/大床房.jpg');
INSERT INTO `rooms` VALUES (49, '8202', '大床房', 299.00, 'available', '标准大床房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/大床房.jpg');
INSERT INTO `rooms` VALUES (50, '8203', '大床房', 299.00, 'available', '标准大床房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/大床房.jpg');
INSERT INTO `rooms` VALUES (51, '8204', '大床房', 299.00, 'available', '标准大床房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/大床房.jpg');
INSERT INTO `rooms` VALUES (52, '8205', '大床房', 299.00, 'available', '标准大床房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/大床房.jpg');
INSERT INTO `rooms` VALUES (53, '8206', '双人房', 349.00, 'available', '标准双床房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/双人房.jpg');
INSERT INTO `rooms` VALUES (54, '8207', '双人房', 349.00, 'available', '标准双床房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/双人房.jpg');
INSERT INTO `rooms` VALUES (55, '8208', '双人房', 349.00, 'available', '标准双床房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/双人房.jpg');
INSERT INTO `rooms` VALUES (56, '8209', '双人房', 349.00, 'available', '标准双床房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/双人房.jpg');
INSERT INTO `rooms` VALUES (57, '8210', '双人房', 349.00, 'maintenance', '标准双床房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/双人房.jpg');
INSERT INTO `rooms` VALUES (58, '8211', '家庭房', 399.00, 'available', '家庭三人房', '2025-07-02 16:39:21', '2025-11-12 15:06:34', NULL, '/uploads/rooms/家庭房.jpg');
INSERT INTO `rooms` VALUES (59, '8212', '家庭房', 399.00, 'available', '家庭三人房', '2025-07-02 16:39:21', '2025-11-12 15:06:34', NULL, '/uploads/rooms/家庭房.jpg');
INSERT INTO `rooms` VALUES (60, '8213', '家庭房', 399.00, 'available', '家庭三人房', '2025-07-02 16:39:21', '2025-11-12 15:06:34', NULL, '/uploads/rooms/家庭房.jpg');
INSERT INTO `rooms` VALUES (61, '8214', '家庭房', 399.00, 'available', '家庭三人房', '2025-07-02 16:39:21', '2025-11-12 15:06:34', NULL, '/uploads/rooms/家庭房.jpg');
INSERT INTO `rooms` VALUES (62, '8215', '家庭房', 399.00, 'available', '家庭三人房', '2025-07-02 16:39:21', '2025-11-12 15:06:34', NULL, '/uploads/rooms/家庭房.jpg');
INSERT INTO `rooms` VALUES (63, '8216', '特价房', 199.00, 'available', '经济特价房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/特价房.jpg');
INSERT INTO `rooms` VALUES (64, '8217', '特价房', 199.00, 'available', '经济特价房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/特价房.jpg');
INSERT INTO `rooms` VALUES (65, '8218', '特价房', 199.00, 'available', '经济特价房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/特价房.jpg');
INSERT INTO `rooms` VALUES (66, '8219', '特价房', 199.00, 'cleaning', '经济特价房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/特价房.jpg');
INSERT INTO `rooms` VALUES (67, '8220', '特价房', 199.00, 'available', '经济特价房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/特价房.jpg');
INSERT INTO `rooms` VALUES (68, '8221', '套房', 599.00, 'available', '豪华套房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/套房.jpg');
INSERT INTO `rooms` VALUES (69, '8222', '套房', 599.00, 'available', '豪华套房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/套房.jpg');
INSERT INTO `rooms` VALUES (70, '8223', '套房', 599.00, 'available', '豪华套房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/套房.jpg');
INSERT INTO `rooms` VALUES (71, '8224', '套房', 599.00, 'available', '豪华套房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/套房.jpg');
INSERT INTO `rooms` VALUES (72, '8225', '套房', 599.00, 'available', '豪华套房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/套房.jpg');
INSERT INTO `rooms` VALUES (73, '8226', '总统套房', 1999.00, 'cleaning', '总统豪华套房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/总统套房.jpg');
INSERT INTO `rooms` VALUES (74, '8227', '大床房', 299.00, 'available', '标准大床房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/大床房.jpg');
INSERT INTO `rooms` VALUES (75, '8228', '大床房', 299.00, 'available', '标准大床房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/大床房.jpg');
INSERT INTO `rooms` VALUES (76, '8229', '大床房', 299.00, 'available', '标准大床房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/大床房.jpg');
INSERT INTO `rooms` VALUES (77, '8230', '大床房', 299.00, 'available', '标准大床房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/大床房.jpg');
INSERT INTO `rooms` VALUES (78, '8301', '大床房', 299.00, 'available', '标准大床房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/大床房.jpg');
INSERT INTO `rooms` VALUES (79, '8302', '大床房', 299.00, 'available', '标准大床房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/大床房.jpg');
INSERT INTO `rooms` VALUES (80, '8303', '大床房', 299.00, 'available', '标准大床房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/大床房.jpg');
INSERT INTO `rooms` VALUES (81, '8304', '大床房', 299.00, 'available', '标准大床房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/大床房.jpg');
INSERT INTO `rooms` VALUES (82, '8305', '大床房', 299.00, 'available', '标准大床房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/大床房.jpg');
INSERT INTO `rooms` VALUES (83, '8306', '双人房', 349.00, 'available', '标准双床房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/双人房.jpg');
INSERT INTO `rooms` VALUES (84, '8307', '双人房', 349.00, 'available', '标准双床房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/双人房.jpg');
INSERT INTO `rooms` VALUES (85, '8308', '双人房', 349.00, 'available', '标准双床房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/双人房.jpg');
INSERT INTO `rooms` VALUES (86, '8309', '双人房', 349.00, 'available', '标准双床房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/双人房.jpg');
INSERT INTO `rooms` VALUES (87, '8310', '双人房', 349.00, 'available', '标准双床房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/双人房.jpg');
INSERT INTO `rooms` VALUES (88, '8311', '家庭房', 399.00, 'available', '家庭三人房', '2025-07-02 16:39:21', '2025-11-12 15:06:34', NULL, '/uploads/rooms/家庭房.jpg');
INSERT INTO `rooms` VALUES (89, '8312', '家庭房', 399.00, 'available', '家庭三人房', '2025-07-02 16:39:21', '2025-11-12 15:06:34', NULL, '/uploads/rooms/家庭房.jpg');
INSERT INTO `rooms` VALUES (90, '8313', '家庭房', 399.00, 'available', '家庭三人房', '2025-07-02 16:39:21', '2025-11-12 15:06:34', NULL, '/uploads/rooms/家庭房.jpg');
INSERT INTO `rooms` VALUES (91, '8314', '家庭房', 399.00, 'available', '家庭三人房', '2025-07-02 16:39:21', '2025-11-12 15:06:34', NULL, '/uploads/rooms/家庭房.jpg');
INSERT INTO `rooms` VALUES (92, '8315', '家庭房', 399.00, 'available', '家庭三人房', '2025-07-02 16:39:21', '2025-11-12 15:06:34', NULL, '/uploads/rooms/家庭房.jpg');
INSERT INTO `rooms` VALUES (93, '8316', '特价房', 199.00, 'available', '经济特价房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/特价房.jpg');
INSERT INTO `rooms` VALUES (94, '8317', '特价房', 199.00, 'available', '经济特价房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/特价房.jpg');
INSERT INTO `rooms` VALUES (95, '8318', '特价房', 199.00, 'available', '经济特价房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/特价房.jpg');
INSERT INTO `rooms` VALUES (96, '8319', '特价房', 199.00, 'available', '经济特价房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/特价房.jpg');
INSERT INTO `rooms` VALUES (97, '8320', '特价房', 199.00, 'available', '经济特价房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/特价房.jpg');
INSERT INTO `rooms` VALUES (98, '8321', '套房', 599.00, 'available', '豪华套房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/套房.jpg');
INSERT INTO `rooms` VALUES (99, '8322', '套房', 599.00, 'available', '豪华套房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/套房.jpg');
INSERT INTO `rooms` VALUES (100, '8323', '套房', 599.00, 'available', '豪华套房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/套房.jpg');
INSERT INTO `rooms` VALUES (101, '8324', '套房', 599.00, 'available', '豪华套房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/套房.jpg');
INSERT INTO `rooms` VALUES (102, '8325', '套房', 599.00, 'cleaning', '豪华套房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/套房.jpg');
INSERT INTO `rooms` VALUES (103, '8326', '大床房', 299.00, 'cleaning', '标准大床房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/大床房.jpg');
INSERT INTO `rooms` VALUES (104, '8327', '大床房', 299.00, 'available', '标准大床房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/大床房.jpg');
INSERT INTO `rooms` VALUES (105, '8328', '大床房', 299.00, 'available', '标准大床房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/大床房.jpg');
INSERT INTO `rooms` VALUES (106, '8329', '大床房', 299.00, 'available', '标准大床房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/大床房.jpg');
INSERT INTO `rooms` VALUES (107, '8330', '大床房', 299.00, 'available', '标准大床房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/大床房.jpg');
INSERT INTO `rooms` VALUES (108, '8401', '大床房', 299.00, 'cleaning', '标准大床房，比较安静', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/大床房.jpg');
INSERT INTO `rooms` VALUES (109, '8402', '大床房', 299.00, 'available', '标准大床房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/大床房.jpg');
INSERT INTO `rooms` VALUES (110, '8403', '大床房', 299.00, 'available', '标准大床房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/大床房.jpg');
INSERT INTO `rooms` VALUES (111, '8404', '大床房', 299.00, 'available', '标准大床房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/大床房.jpg');
INSERT INTO `rooms` VALUES (112, '8405', '大床房', 299.00, 'available', '标准大床房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/大床房.jpg');
INSERT INTO `rooms` VALUES (113, '8406', '双人房', 349.00, 'available', '标准双床房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/双人房.jpg');
INSERT INTO `rooms` VALUES (114, '8407', '双人房', 349.00, 'available', '标准双床房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/双人房.jpg');
INSERT INTO `rooms` VALUES (115, '8408', '双人房', 349.00, 'available', '标准双床房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/双人房.jpg');
INSERT INTO `rooms` VALUES (116, '8409', '双人房', 349.00, 'available', '标准双床房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/双人房.jpg');
INSERT INTO `rooms` VALUES (117, '8410', '双人房', 349.00, 'available', '标准双床房', '2025-07-02 16:39:21', '2025-11-12 15:01:12', NULL, '/uploads/rooms/双人房.jpg');
INSERT INTO `rooms` VALUES (118, '8411', '家庭房', 399.00, 'available', '家庭三人房', '2025-07-02 16:39:21', '2025-11-12 15:06:34', NULL, '/uploads/rooms/家庭房.jpg');
INSERT INTO `rooms` VALUES (119, '8412', '家庭房', 399.00, 'available', '家庭三人房', '2025-07-02 16:39:21', '2025-11-12 15:06:34', NULL, '/uploads/rooms/家庭房.jpg');
INSERT INTO `rooms` VALUES (120, '8413', '家庭房', 399.00, 'available', '家庭三人房', '2025-07-02 16:39:21', '2025-11-12 15:06:34', NULL, '/uploads/rooms/家庭房.jpg');
INSERT INTO `rooms` VALUES (121, '8414', '家庭房', 399.00, 'available', '家庭三人房', '2025-07-02 16:39:21', '2025-11-12 15:06:34', NULL, '/uploads/rooms/家庭房.jpg');
INSERT INTO `rooms` VALUES (122, '8415', '家庭房', 399.00, 'available', '家庭三人房', '2025-07-02 16:39:21', '2025-11-12 15:06:34', NULL, '/uploads/rooms/家庭房.jpg');
INSERT INTO `rooms` VALUES (123, '8416', '特价房', 199.00, 'available', '经济特价房', '2025-07-02 16:39:21', '2025-11-12 15:01:13', NULL, '/uploads/rooms/特价房.jpg');
INSERT INTO `rooms` VALUES (124, '8417', '特价房', 199.00, 'available', '经济特价房', '2025-07-02 16:39:21', '2025-11-12 15:01:13', NULL, '/uploads/rooms/特价房.jpg');
INSERT INTO `rooms` VALUES (125, '8418', '特价房', 199.00, 'available', '经济特价房', '2025-07-02 16:39:21', '2025-11-12 15:01:13', NULL, '/uploads/rooms/特价房.jpg');
INSERT INTO `rooms` VALUES (126, '8419', '特价房', 199.00, 'available', '经济特价房', '2025-07-02 16:39:21', '2025-11-12 15:01:13', NULL, '/uploads/rooms/特价房.jpg');
INSERT INTO `rooms` VALUES (127, '8420', '特价房', 199.00, 'available', '经济特价房', '2025-07-02 16:39:21', '2025-11-12 15:01:13', NULL, '/uploads/rooms/特价房.jpg');
INSERT INTO `rooms` VALUES (128, '8421', '套房', 599.00, 'available', '豪华套房', '2025-07-02 16:39:21', '2025-11-12 15:01:13', NULL, '/uploads/rooms/套房.jpg');
INSERT INTO `rooms` VALUES (129, '8422', '套房', 599.00, 'available', '豪华套房', '2025-07-02 16:39:21', '2025-11-12 15:01:13', NULL, '/uploads/rooms/套房.jpg');
INSERT INTO `rooms` VALUES (130, '8423', '套房', 599.00, 'available', '豪华套房', '2025-07-02 16:39:21', '2025-11-12 15:01:13', NULL, '/uploads/rooms/套房.jpg');
INSERT INTO `rooms` VALUES (131, '8424', '套房', 599.00, 'available', '豪华套房', '2025-07-02 16:39:21', '2025-11-12 15:01:13', NULL, '/uploads/rooms/套房.jpg');
INSERT INTO `rooms` VALUES (132, '8425', '套房', 599.00, 'available', '豪华套房', '2025-07-02 16:39:21', '2025-11-12 15:01:13', NULL, '/uploads/rooms/套房.jpg');
INSERT INTO `rooms` VALUES (133, '8426', '总统套房', 1999.00, 'available', '总统豪华套房', '2025-07-02 16:39:21', '2025-11-12 15:01:13', NULL, '/uploads/rooms/总统套房.jpg');
INSERT INTO `rooms` VALUES (134, '8427', '大床房', 299.00, 'available', '标准大床房', '2025-07-02 16:39:21', '2025-11-12 15:01:13', NULL, '/uploads/rooms/大床房.jpg');
INSERT INTO `rooms` VALUES (135, '8428', '大床房', 299.00, 'available', '标准大床房', '2025-07-02 16:39:21', '2025-11-12 15:01:13', NULL, '/uploads/rooms/大床房.jpg');
INSERT INTO `rooms` VALUES (136, '8429', '大床房', 299.00, 'available', '标准大床房', '2025-07-02 16:39:21', '2025-11-12 15:01:13', NULL, '/uploads/rooms/大床房.jpg');
INSERT INTO `rooms` VALUES (137, '8430', '大床房', 299.00, 'available', '标准大床房', '2025-07-02 16:39:21', '2025-11-12 15:01:13', NULL, '/uploads/rooms/大床房.jpg');
INSERT INTO `rooms` VALUES (138, '8826', '总统套房', 1999.00, 'cleaning', '总统豪华套房', '2025-07-02 16:39:21', '2025-11-12 15:01:13', NULL, '/uploads/rooms/总统套房.jpg');
INSERT INTO `rooms` VALUES (139, '8808', '家庭房', 599.00, 'available', '', '2025-07-04 11:00:40', '2025-11-12 15:06:34', NULL, '/uploads/rooms/家庭房.jpg');

-- ----------------------------
-- Table structure for sessions
-- ----------------------------
DROP TABLE IF EXISTS `sessions`;
CREATE TABLE `sessions`  (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int UNSIGNED NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  PRIMARY KEY (`session_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sessions
-- ----------------------------
INSERT INTO `sessions` VALUES ('04GKQSBbF--Ol9vzIxmK6s0csMpK5NNT', 1763102969, '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-11-14T01:10:31.905Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\"},\"userId\":1,\"userRole\":\"admin\",\"username\":\"admin\"}');
INSERT INTO `sessions` VALUES ('6AAh30eb0oB9oJxhK6qNWXVoMPRUldQU', 1763029254, '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-11-12T11:16:39.088Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\"},\"userId\":1,\"userRole\":\"admin\",\"username\":\"admin\",\"captcha_47d7e0b0-8aca-4636-846a-711694011ef6\":true,\"captcha_5f1ffacb-6a6a-44e9-960f-4ba5bfbeda7a\":true,\"captcha_c3617052-4d5f-4ea7-ac70-7c212130f846\":true,\"captcha_30f63d73-4c74-4579-aea6-2989e971c4ef\":true,\"captcha_e6120894-116a-4c69-805a-a3d6747a0b74\":true,\"captcha_785ca8ba-95d8-435e-85e7-60e72f2f5685\":true,\"captcha_35b6d85a-bd52-4491-bb60-662dd5691deb\":true,\"captcha_bc230d0a-3b83-484e-9ab4-b6318594b966\":true,\"captcha_57ee907c-0ba6-45f9-be96-1cac41e1c38f\":true,\"captcha_bd50dad1-f356-4941-ae72-5a8527b91a5f\":true,\"captcha_8d07bb73-4fdd-41c4-aaec-8885c51b5983\":true,\"captcha_0af20ac3-3816-4c96-9456-006244eddca0\":true,\"captcha_f7f6d2d6-02c8-4389-b472-6a46f89fef88\":true,\"captcha_20a037c0-0d82-4788-84b3-f7e21fdd638d\":true,\"captcha_c745f84a-5fe2-4f3d-9c0a-06533eddb727\":true}');

-- ----------------------------
-- Table structure for todolist
-- ----------------------------
DROP TABLE IF EXISTS `todolist`;
CREATE TABLE `todolist`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `content` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `completed` tinyint(1) NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `user_id`(`user_id` ASC) USING BTREE,
  CONSTRAINT `todolist_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 19 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of todolist
-- ----------------------------
INSERT INTO `todolist` VALUES (5, 1, '2点钟开会', 1, '2025-07-04 09:21:52');
INSERT INTO `todolist` VALUES (9, 1, '修改工作台布局51561', 1, '2025-07-08 10:35:44');
INSERT INTO `todolist` VALUES (10, 1, '修改房间信息', 1, '2025-07-08 10:51:14');
INSERT INTO `todolist` VALUES (12, 1, '测试', 1, '2025-07-08 11:17:16');
INSERT INTO `todolist` VALUES (17, 1, '维护酒店网络', 0, '2025-07-11 14:37:59');
INSERT INTO `todolist` VALUES (18, 1, '8301房间网络系统故障', 0, '2025-07-11 14:38:24');

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','reception','housekeeper','customer') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'customer',
  `status` enum('active','disabled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `openid` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `unionid` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `nickname` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `avatar_url` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `gender` enum('male','female') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `age` int NULL DEFAULT NULL,
  `id_card` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `real_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '真实姓名',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `username`(`username` ASC) USING BTREE,
  UNIQUE INDEX `email`(`email` ASC) USING BTREE,
  UNIQUE INDEX `openid`(`openid` ASC) USING BTREE,
  INDEX `idx_users_openid`(`openid` ASC) USING BTREE,
  INDEX `idx_users_phone`(`phone` ASC) USING BTREE,
  INDEX `idx_users_unionid`(`unionid` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 39 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, 'admin', '$2b$10$yvu60IfJ46ffM2U9OzMA5eolhf/IMR8YOJmFmQ9617ig9ms2cokQu', 'admin', 'active', '2025-06-29 18:06:42', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-12 17:22:11', NULL);
INSERT INTO `users` VALUES (19, 'fff', '$2b$10$yrOtwK54S9xetBXaTN0x7eDfbUXep5tOfZ.wY4fcS0n5vbJRHOqvW', 'reception', 'active', '2025-11-11 15:14:54', '1690185063@qq.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-12 16:46:27', NULL);
INSERT INTO `users` VALUES (21, '客房清扫', '$2b$10$XvqpWp/xAt6rcKJfhP4QBeFPFLwrIeoDQbhv/RNuD/5G4Gofruv4a', 'housekeeper', 'active', '2025-11-12 11:27:12', '63@qq.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-12 16:46:27', NULL);
INSERT INTO `users` VALUES (33, 'mock_openid_1762940338585', '', 'customer', 'active', '2025-11-12 17:38:58', '2943775977@qq.com', 'mock_openid_1762940338585', NULL, '微信用户', '', '18001323626', 'male', 24, '452132199912070035', '2025-11-12 18:49:03', '巫芝峰');

SET FOREIGN_KEY_CHECKS = 1;

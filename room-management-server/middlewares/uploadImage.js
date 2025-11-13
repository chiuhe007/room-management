const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../uploads/rooms');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置存储
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // 生成唯一文件名：时间戳 + 原文件扩展名
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'room-' + uniqueSuffix + ext);
    }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
    // 检查文件类型
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('只允许上传图片文件 (jpeg, jpg, png, gif, webp)'));
    }
};

// 创建multer实例
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB限制
    },
    fileFilter: fileFilter
});

// 处理单个图片上传的中间件
const uploadSingle = upload.single('image');

// 处理上传错误的中间件
const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                message: '文件太大，请上传小于2MB的图片'
            });
        } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                message: '意外的文件字段'
            });
        }
    }
    
    if (error.message) {
        return res.status(400).json({
            message: error.message
        });
    }
    
    next(error);
};

// 处理base64图片的函数
const processBase64Image = (base64String) => {
    try {
        // 检查是否为有效的base64图片
        const matches = base64String.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
        
        if (!matches || matches.length !== 3) {
            return null;
        }
        
        const imageType = matches[1];
        const imageData = matches[2];
        
        // 验证图片类型
        const allowedTypes = ['jpeg', 'jpg', 'png', 'gif', 'webp'];
        if (!allowedTypes.includes(imageType.toLowerCase())) {
            throw new Error('不支持的图片格式');
        }
        
        // 检查大小（base64大约比原文件大33%）
        const sizeInBytes = (imageData.length * 3) / 4;
        const maxSize = 2 * 1024 * 1024; // 2MB
        
        if (sizeInBytes > maxSize) {
            throw new Error('图片文件太大');
        }
        
        return {
            type: imageType,
            data: imageData
        };
    } catch (error) {
        throw new Error('无效的base64图片格式: ' + error.message);
    }
};

// 保存base64图片到文件的函数
const saveBase64Image = (base64String) => {
    const imageInfo = processBase64Image(base64String);
    if (!imageInfo) {
        throw new Error('无效的base64图片');
    }
    
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = `room-${uniqueSuffix}.${imageInfo.type}`;
    const filepath = path.join(uploadDir, filename);
    
    // 保存文件
    const buffer = Buffer.from(imageInfo.data, 'base64');
    fs.writeFileSync(filepath, buffer);
    
    // 返回相对路径用于存储在数据库中
    return `/uploads/rooms/${filename}`;
};

module.exports = {
    uploadSingle,
    handleUploadError,
    processBase64Image,
    saveBase64Image,
    uploadDir
};
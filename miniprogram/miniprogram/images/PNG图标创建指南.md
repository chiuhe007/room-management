# PNG图标创建说明

由于无法直接生成PNG文件，请按以下步骤操作：

## 方法1: 在线转换工具
1. 打开 https://convertio.co/zh/svg-png/
2. 上传以下SVG文件：
   - home.svg → home.png (灰色版本)
   - home-active.svg → home-active.png (蓝色版本)  
   - room.svg → room.png
   - room-active.svg → room-active.png
   - booking.svg → booking.png
   - booking-active.svg → booking-active.png
   - profile.svg → profile.png
   - profile-active.svg → profile-active.png

3. 设置输出尺寸为 81x81 像素
4. 下载转换后的PNG文件到 images/ 目录

## 方法2: 使用设计工具
- 用Photoshop、Figma、Sketch等工具打开SVG
- 导出为81x81的PNG格式

## 方法3: 暂时使用简化版本
我现在将创建简化的TabBar配置，使用更大的emoji图标

完成转换后，记得更新app.json中的iconPath配置。
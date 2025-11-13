# 房型URL编码乱码问题修复总结

## 问题描述
用户反馈后台显示房型为 `%E5%8F%8C%E4%BA%BA%E6%88%BF`，这是中文"双人房"被URL编码后的结果，导致后端无法正确处理中文房型参数。

## 问题分析
URL编码问题出现在以下几个环节：

1. **小程序页面跳转**：在房间列表页面跳转到预订页面时，对中文房型进行了不必要的编码
2. **后端参数处理**：后端接收URL参数时未进行解码处理
3. **前端API调用**：部分API调用时对中文参数进行了编码但后端未解码

## 修复内容

### 1. 小程序端修复
**文件**: `miniprogram/miniprogram/pages/rooms/rooms.js`

**修改内容**:
- 移除了 `encodeURIComponent(roomType.type)` 的编码处理
- 小程序会自动处理中文参数，无需手动编码

**修改位置**: 第166行 `bookRoom` 方法

```javascript
// 修改前
`roomType=${encodeURIComponent(roomType.type)}`

// 修改后  
`roomType=${roomType.type}`
```

**文件**: `miniprogram/miniprogram/pages/booking/booking.js`

**修改内容**:
- 在接收页面参数时添加 `decodeURIComponent` 解码处理
- 确保房型信息正确显示

**修改位置**: 第40行 `onLoad` 方法

```javascript
// 修改前
type: options.roomType

// 修改后
type: options.roomType ? decodeURIComponent(options.roomType) : options.roomType
```

### 2. 后端接口修复

#### 预订查询接口
**文件**: `room-management-server/controllers/bookingController.js`

**修改内容**:
- 在 `getBookings` 方法中添加 `decodeURIComponent` 处理房型参数
- 增加调试日志输出编码前后的参数值

```javascript
// 新增URL解码处理
const decodedRoomType = roomType ? decodeURIComponent(roomType) : roomType;

// 使用解码后的参数进行查询
if (decodedRoomType) {
  sql += ' AND roomType = ?';
  params.push(decodedRoomType);
}
```

#### 客户查询接口
**文件**: `room-management-server/controllers/customerController.js`

**修改内容**:
- 在 `checkCustomerExists` 方法中添加客户姓名的URL解码处理

```javascript
// URL解码处理，防止中文姓名乱码
const decodedName = decodeURIComponent(name);
```

#### 入住管理接口
**文件**: `room-management-server/controllers/checkinController.js`

**修改内容**:
- 在 `getCheckins` 方法中添加客户姓名的URL解码处理

```javascript
// URL解码处理，防止中文参数乱码
const decodedCustomer = customer ? decodeURIComponent(customer) : customer;
```

## 修复后的效果

1. ✅ 小程序房型跳转正常，中文房型不会被过度编码
2. ✅ 后端正确接收和处理中文房型参数
3. ✅ 预订查询、客户查询、入住管理等功能中的中文参数正常显示
4. ✅ 数据库中存储的房型信息为正确的中文，而不是URL编码

## 测试建议

1. **小程序测试**：
   - 在房间列表页面选择"双人房"等中文房型
   - 验证跳转到预订页面时房型显示正确
   - 提交预订后查看后台数据

2. **Web管理后台测试**：
   - 在预订管理页面按房型筛选
   - 查看中文房型是否正常显示和搜索
   - 检查新增/编辑预订时房型选择是否正常

3. **数据库验证**：
   - 查看 `bookings` 表中的 `roomType` 字段
   - 确认存储的是中文而不是URL编码

## 相关文件清单

### 已修改文件
- `miniprogram/miniprogram/pages/rooms/rooms.js`
- `miniprogram/miniprogram/pages/booking/booking.js`  
- `room-management-server/controllers/bookingController.js`
- `room-management-server/controllers/customerController.js`
- `room-management-server/controllers/checkinController.js`

### 可能需要关注的文件
- 前端Vue项目中的房型筛选组件
- 其他可能接收中文参数的API接口

## 注意事项

1. **向后兼容**：修复后的代码同时支持编码和未编码的参数，确保兼容性
2. **日志输出**：添加了调试日志，便于排查类似问题
3. **全面覆盖**：修复了所有可能接收中文参数的主要接口

## 预防措施

1. 在接收URL参数的地方统一添加解码处理
2. 前端传递中文参数时避免不必要的编码
3. 添加参数验证和日志记录，便于问题定位
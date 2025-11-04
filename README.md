# 客房管理系统 / Room Management System

实训作业 - 一个简单但功能完整的客房管理系统  
Training Project - A simple but fully functional room management system

## 项目简介 / Project Overview

这是一个基于Java的客房管理系统，用于酒店或宾馆的日常运营管理。系统提供了房间管理、顾客管理和预订管理等核心功能。

This is a Java-based room management system for daily hotel operations. The system provides core functionalities including room management, customer management, and booking management.

## 功能特性 / Features

### 1. 房间管理 / Room Management
- ✅ 添加、查看、更新、删除房间
- ✅ 房间状态管理（可用、已占用、维护中、已预订）
- ✅ 支持多种房间类型（单人间、双人间、套房、豪华房）
- ✅ 按楼层、类型、状态筛选房间

### 2. 顾客管理 / Customer Management
- ✅ 顾客信息登记和管理
- ✅ 顾客信息查询和搜索
- ✅ 身份证号验证，防止重复注册

### 3. 预订管理 / Booking Management
- ✅ 创建、查看、取消预订
- ✅ 办理入住和退房
- ✅ 自动计算住宿费用
- ✅ 预订冲突检测
- ✅ 预订状态追踪

### 4. 统计信息 / Statistics
- ✅ 房间使用率统计
- ✅ 顾客数量统计
- ✅ 预订情况统计

## 技术栈 / Technology Stack

- **语言 / Language**: Java 11
- **构建工具 / Build Tool**: Maven
- **测试框架 / Testing**: JUnit 5
- **架构 / Architecture**: 分层架构 (Layered Architecture)
  - Model Layer (实体层)
  - Repository Layer (数据访问层)
  - Service Layer (业务逻辑层)
  - Presentation Layer (展示层 - CLI)

## 项目结构 / Project Structure

```
room-management/
├── src/
│   ├── main/
│   │   └── java/
│   │       └── com/
│   │           └── roommanagement/
│   │               ├── model/          # 实体类 / Domain Models
│   │               │   ├── Room.java
│   │               │   ├── Customer.java
│   │               │   ├── Booking.java
│   │               │   ├── RoomType.java
│   │               │   └── RoomStatus.java
│   │               ├── repository/     # 数据访问层 / Data Access Layer
│   │               │   ├── RoomRepository.java
│   │               │   ├── CustomerRepository.java
│   │               │   └── BookingRepository.java
│   │               ├── service/        # 业务逻辑层 / Service Layer
│   │               │   ├── RoomService.java
│   │               │   ├── CustomerService.java
│   │               │   └── BookingService.java
│   │               └── Main.java       # 主程序 / Main Application
│   └── test/
│       └── java/
│           └── com/
│               └── roommanagement/
│                   ├── model/          # 单元测试 / Unit Tests
│                   └── service/
├── pom.xml                             # Maven配置 / Maven Configuration
└── README.md                           # 项目文档 / Documentation
```

## 快速开始 / Quick Start

### 前置要求 / Prerequisites

- Java 11 或更高版本 / Java 11 or higher
- Maven 3.6+ 

### 编译项目 / Build the Project

```bash
mvn clean compile
```

### 运行测试 / Run Tests

```bash
mvn test
```

### 运行程序 / Run the Application

```bash
mvn exec:java -Dexec.mainClass="com.roommanagement.Main"
```

或者先打包再运行 / Or package and run:

```bash
mvn clean package
java -jar target/room-management-system-1.0.0.jar
```

## 使用说明 / Usage Guide

### 主菜单 / Main Menu

程序启动后，您将看到主菜单，包含以下选项：

1. **房间管理** - 管理酒店房间信息
2. **顾客管理** - 管理顾客信息
3. **预订管理** - 管理预订、入住、退房
4. **统计信息** - 查看系统统计数据
0. **退出** - 退出程序

### 示例数据 / Sample Data

系统启动时会自动创建一些示例数据供测试使用：

**房间 / Rooms:**
- 101 - 单人间 (¥200/晚)
- 102 - 双人间 (¥300/晚)
- 201 - 套房 (¥500/晚)
- 202 - 海景双人间 (¥320/晚)
- 301 - 豪华房 (¥800/晚)

**顾客 / Customers:**
- C001 - 张三
- C002 - 李四

## 开发说明 / Development Notes

### 设计模式 / Design Patterns

- **Repository Pattern** - 数据访问抽象
- **Service Layer Pattern** - 业务逻辑封装
- **Domain Model Pattern** - 领域模型设计

### 数据存储 / Data Storage

当前版本使用内存存储（HashMap），数据在程序关闭后会丢失。未来版本可以扩展为：
- 文件存储（JSON/XML）
- 数据库存储（MySQL/PostgreSQL）

Current version uses in-memory storage (HashMap). Data will be lost when program exits. Future versions could support:
- File storage (JSON/XML)
- Database storage (MySQL/PostgreSQL)

## 测试覆盖 / Test Coverage

项目包含全面的单元测试：
- ✅ 模型类测试
- ✅ 服务层业务逻辑测试
- ✅ 边界条件测试
- ✅ 异常处理测试

## 未来改进 / Future Improvements

- [ ] 添加数据持久化（文件或数据库）
- [ ] 实现图形用户界面（GUI）
- [ ] 添加用户权限管理
- [ ] 增强报表和统计功能
- [ ] 支持多语言切换
- [ ] 添加日志记录功能
- [ ] 实现房间清洁状态管理
- [ ] 支持优惠和折扣管理

## 许可证 / License

本项目仅用于教育和学习目的。  
This project is for educational purposes only.

## 作者 / Author

实训作业项目 / Training Project

## 贡献 / Contributing

欢迎提交问题和改进建议！  
Issues and improvement suggestions are welcome!

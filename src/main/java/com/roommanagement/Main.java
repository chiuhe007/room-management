package com.roommanagement;

import com.roommanagement.model.*;
import com.roommanagement.repository.*;
import com.roommanagement.service.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Scanner;

/**
 * 主应用程序 - 命令行界面
 * Main Application - Command Line Interface
 */
public class Main {
    private static RoomService roomService;
    private static CustomerService customerService;
    private static BookingService bookingService;
    private static Scanner scanner;

    public static void main(String[] args) {
        initializeServices();
        initializeSampleData();
        scanner = new Scanner(System.in);

        System.out.println("========================================");
        System.out.println("欢迎使用客房管理系统");
        System.out.println("Welcome to Room Management System");
        System.out.println("========================================\n");

        boolean running = true;
        while (running) {
            displayMainMenu();
            int choice = getIntInput();
            
            switch (choice) {
                case 1:
                    roomManagementMenu();
                    break;
                case 2:
                    customerManagementMenu();
                    break;
                case 3:
                    bookingManagementMenu();
                    break;
                case 4:
                    displayStatistics();
                    break;
                case 0:
                    running = false;
                    System.out.println("\n谢谢使用！再见！");
                    System.out.println("Thank you! Goodbye!");
                    break;
                default:
                    System.out.println("无效选择，请重试 (Invalid choice, please try again)");
            }
        }
        
        scanner.close();
    }

    private static void initializeServices() {
        RoomRepository roomRepository = new RoomRepository();
        CustomerRepository customerRepository = new CustomerRepository();
        BookingRepository bookingRepository = new BookingRepository();

        roomService = new RoomService(roomRepository);
        customerService = new CustomerService(customerRepository);
        bookingService = new BookingService(bookingRepository, roomRepository, customerRepository);
    }

    private static void initializeSampleData() {
        // Add sample rooms
        try {
            roomService.addRoom("101", RoomType.SINGLE, 1, 200.0, "标准单人间");
            roomService.addRoom("102", RoomType.DOUBLE, 1, 300.0, "标准双人间");
            roomService.addRoom("201", RoomType.SUITE, 2, 500.0, "豪华套房");
            roomService.addRoom("301", RoomType.DELUXE, 3, 800.0, "总统套房");
            roomService.addRoom("202", RoomType.DOUBLE, 2, 320.0, "海景双人间");
        } catch (Exception e) {
            // Ignore if already exists
        }

        // Add sample customers
        try {
            customerService.addCustomer("C001", "张三", "110101199001011234", "13800138000", "zhangsan@example.com");
            customerService.addCustomer("C002", "李四", "110101199002021234", "13800138001", "lisi@example.com");
        } catch (Exception e) {
            // Ignore if already exists
        }
    }

    private static void displayMainMenu() {
        System.out.println("\n========== 主菜单 (Main Menu) ==========");
        System.out.println("1. 房间管理 (Room Management)");
        System.out.println("2. 顾客管理 (Customer Management)");
        System.out.println("3. 预订管理 (Booking Management)");
        System.out.println("4. 统计信息 (Statistics)");
        System.out.println("0. 退出 (Exit)");
        System.out.print("请选择 (Please choose): ");
    }

    private static void roomManagementMenu() {
        boolean back = false;
        while (!back) {
            System.out.println("\n========== 房间管理 (Room Management) ==========");
            System.out.println("1. 查看所有房间 (View All Rooms)");
            System.out.println("2. 查看可用房间 (View Available Rooms)");
            System.out.println("3. 添加房间 (Add Room)");
            System.out.println("4. 更新房间状态 (Update Room Status)");
            System.out.println("5. 删除房间 (Delete Room)");
            System.out.println("0. 返回 (Back)");
            System.out.print("请选择 (Please choose): ");
            
            int choice = getIntInput();
            switch (choice) {
                case 1:
                    viewAllRooms();
                    break;
                case 2:
                    viewAvailableRooms();
                    break;
                case 3:
                    addRoom();
                    break;
                case 4:
                    updateRoomStatus();
                    break;
                case 5:
                    deleteRoom();
                    break;
                case 0:
                    back = true;
                    break;
                default:
                    System.out.println("无效选择 (Invalid choice)");
            }
        }
    }

    private static void customerManagementMenu() {
        boolean back = false;
        while (!back) {
            System.out.println("\n========== 顾客管理 (Customer Management) ==========");
            System.out.println("1. 查看所有顾客 (View All Customers)");
            System.out.println("2. 添加顾客 (Add Customer)");
            System.out.println("3. 查找顾客 (Search Customer)");
            System.out.println("4. 删除顾客 (Delete Customer)");
            System.out.println("0. 返回 (Back)");
            System.out.print("请选择 (Please choose): ");
            
            int choice = getIntInput();
            switch (choice) {
                case 1:
                    viewAllCustomers();
                    break;
                case 2:
                    addCustomer();
                    break;
                case 3:
                    searchCustomer();
                    break;
                case 4:
                    deleteCustomer();
                    break;
                case 0:
                    back = true;
                    break;
                default:
                    System.out.println("无效选择 (Invalid choice)");
            }
        }
    }

    private static void bookingManagementMenu() {
        boolean back = false;
        while (!back) {
            System.out.println("\n========== 预订管理 (Booking Management) ==========");
            System.out.println("1. 查看所有预订 (View All Bookings)");
            System.out.println("2. 创建预订 (Create Booking)");
            System.out.println("3. 办理入住 (Check In)");
            System.out.println("4. 办理退房 (Check Out)");
            System.out.println("5. 取消预订 (Cancel Booking)");
            System.out.println("0. 返回 (Back)");
            System.out.print("请选择 (Please choose): ");
            
            int choice = getIntInput();
            switch (choice) {
                case 1:
                    viewAllBookings();
                    break;
                case 2:
                    createBooking();
                    break;
                case 3:
                    checkIn();
                    break;
                case 4:
                    checkOut();
                    break;
                case 5:
                    cancelBooking();
                    break;
                case 0:
                    back = true;
                    break;
                default:
                    System.out.println("无效选择 (Invalid choice)");
            }
        }
    }

    private static void viewAllRooms() {
        List<Room> rooms = roomService.getAllRooms();
        System.out.println("\n所有房间列表 (All Rooms):");
        System.out.println("----------------------------------------");
        for (Room room : rooms) {
            System.out.println(room);
        }
        System.out.println("总计: " + rooms.size() + " 间房间");
    }

    private static void viewAvailableRooms() {
        List<Room> rooms = roomService.getAvailableRooms();
        System.out.println("\n可用房间列表 (Available Rooms):");
        System.out.println("----------------------------------------");
        for (Room room : rooms) {
            System.out.println(room);
        }
        System.out.println("总计: " + rooms.size() + " 间可用房间");
    }

    private static void addRoom() {
        try {
            System.out.print("房间号 (Room Number): ");
            String roomNumber = scanner.next();
            
            System.out.println("房间类型 (Room Type):");
            System.out.println("1. SINGLE (单人间) 2. DOUBLE (双人间) 3. SUITE (套房) 4. DELUXE (豪华房)");
            System.out.print("选择: ");
            int typeChoice = getIntInput();
            if (typeChoice < 1 || typeChoice > RoomType.values().length) {
                System.out.println("✗ 无效的房间类型选择 (Invalid room type choice)");
                return;
            }
            RoomType roomType = RoomType.values()[typeChoice - 1];
            
            System.out.print("楼层 (Floor): ");
            int floor = getIntInput();
            
            System.out.print("每晚价格 (Price per night): ");
            double price = scanner.nextDouble();
            scanner.nextLine(); // consume newline
            
            System.out.print("描述 (Description): ");
            String description = scanner.nextLine();
            
            Room room = roomService.addRoom(roomNumber, roomType, floor, price, description);
            System.out.println("✓ 房间添加成功！(Room added successfully!)");
            System.out.println(room);
        } catch (Exception e) {
            System.out.println("✗ 错误 (Error): " + e.getMessage());
        }
    }

    private static void updateRoomStatus() {
        try {
            System.out.print("房间号 (Room Number): ");
            String roomNumber = scanner.next();
            
            System.out.println("新状态 (New Status):");
            System.out.println("1. AVAILABLE (可用) 2. OCCUPIED (已占用) 3. MAINTENANCE (维护中) 4. RESERVED (已预订)");
            System.out.print("选择: ");
            int statusChoice = getIntInput();
            if (statusChoice < 1 || statusChoice > RoomStatus.values().length) {
                System.out.println("✗ 无效的状态选择 (Invalid status choice)");
                return;
            }
            RoomStatus newStatus = RoomStatus.values()[statusChoice - 1];
            
            Room room = roomService.updateRoomStatus(roomNumber, newStatus);
            System.out.println("✓ 房间状态更新成功！(Room status updated!)");
            System.out.println(room);
        } catch (Exception e) {
            System.out.println("✗ 错误 (Error): " + e.getMessage());
        }
    }

    private static void deleteRoom() {
        try {
            System.out.print("房间号 (Room Number): ");
            String roomNumber = scanner.next();
            
            if (roomService.deleteRoom(roomNumber)) {
                System.out.println("✓ 房间删除成功！(Room deleted successfully!)");
            } else {
                System.out.println("✗ 房间未找到 (Room not found)");
            }
        } catch (Exception e) {
            System.out.println("✗ 错误 (Error): " + e.getMessage());
        }
    }

    private static void viewAllCustomers() {
        List<Customer> customers = customerService.getAllCustomers();
        System.out.println("\n所有顾客列表 (All Customers):");
        System.out.println("----------------------------------------");
        for (Customer customer : customers) {
            System.out.println(customer);
        }
        System.out.println("总计: " + customers.size() + " 位顾客");
    }

    private static void addCustomer() {
        try {
            System.out.print("顾客ID (Customer ID): ");
            String customerId = scanner.next();
            scanner.nextLine(); // consume newline
            
            System.out.print("姓名 (Name): ");
            String name = scanner.nextLine();
            
            System.out.print("身份证号 (ID Card): ");
            String idCard = scanner.nextLine();
            
            System.out.print("电话号码 (Phone): ");
            String phone = scanner.nextLine();
            
            System.out.print("邮箱 (Email): ");
            String email = scanner.nextLine();
            
            Customer customer = customerService.addCustomer(customerId, name, idCard, phone, email);
            System.out.println("✓ 顾客添加成功！(Customer added successfully!)");
            System.out.println(customer);
        } catch (Exception e) {
            System.out.println("✗ 错误 (Error): " + e.getMessage());
        }
    }

    private static void searchCustomer() {
        System.out.print("顾客ID (Customer ID): ");
        String customerId = scanner.next();
        
        customerService.getCustomerById(customerId).ifPresentOrElse(
            customer -> System.out.println(customer),
            () -> System.out.println("✗ 顾客未找到 (Customer not found)")
        );
    }

    private static void deleteCustomer() {
        try {
            System.out.print("顾客ID (Customer ID): ");
            String customerId = scanner.next();
            
            if (customerService.deleteCustomer(customerId)) {
                System.out.println("✓ 顾客删除成功！(Customer deleted successfully!)");
            } else {
                System.out.println("✗ 顾客未找到 (Customer not found)");
            }
        } catch (Exception e) {
            System.out.println("✗ 错误 (Error): " + e.getMessage());
        }
    }

    private static void viewAllBookings() {
        List<Booking> bookings = bookingService.getAllBookings();
        System.out.println("\n所有预订列表 (All Bookings):");
        System.out.println("----------------------------------------");
        for (Booking booking : bookings) {
            System.out.println(booking);
        }
        System.out.println("总计: " + bookings.size() + " 个预订");
    }

    private static void createBooking() {
        try {
            System.out.print("顾客ID (Customer ID): ");
            String customerId = scanner.next();
            
            System.out.print("房间号 (Room Number): ");
            String roomNumber = scanner.next();
            
            System.out.print("入住日期 (Check-in Date YYYY-MM-DD): ");
            String checkInStr = scanner.next();
            LocalDate checkInDate = LocalDate.parse(checkInStr);
            
            System.out.print("退房日期 (Check-out Date YYYY-MM-DD): ");
            String checkOutStr = scanner.next();
            LocalDate checkOutDate = LocalDate.parse(checkOutStr);
            
            Booking booking = bookingService.createBooking(customerId, roomNumber, checkInDate, checkOutDate);
            System.out.println("✓ 预订创建成功！(Booking created successfully!)");
            System.out.println(booking);
        } catch (Exception e) {
            System.out.println("✗ 错误 (Error): " + e.getMessage());
        }
    }

    private static void checkIn() {
        try {
            System.out.print("预订ID (Booking ID): ");
            String bookingId = scanner.next();
            
            Booking booking = bookingService.checkIn(bookingId);
            System.out.println("✓ 入住办理成功！(Check-in successful!)");
            System.out.println(booking);
        } catch (Exception e) {
            System.out.println("✗ 错误 (Error): " + e.getMessage());
        }
    }

    private static void checkOut() {
        try {
            System.out.print("预订ID (Booking ID): ");
            String bookingId = scanner.next();
            
            Booking booking = bookingService.checkOut(bookingId);
            System.out.println("✓ 退房办理成功！(Check-out successful!)");
            System.out.println(booking);
        } catch (Exception e) {
            System.out.println("✗ 错误 (Error): " + e.getMessage());
        }
    }

    private static void cancelBooking() {
        try {
            System.out.print("预订ID (Booking ID): ");
            String bookingId = scanner.next();
            
            Booking booking = bookingService.cancelBooking(bookingId);
            System.out.println("✓ 预订取消成功！(Booking cancelled successfully!)");
            System.out.println(booking);
        } catch (Exception e) {
            System.out.println("✗ 错误 (Error): " + e.getMessage());
        }
    }

    private static void displayStatistics() {
        System.out.println("\n========== 统计信息 (Statistics) ==========");
        System.out.println("总房间数 (Total Rooms): " + roomService.getTotalRoomCount());
        System.out.println("可用房间数 (Available Rooms): " + roomService.getAvailableRoomCount());
        System.out.println("总顾客数 (Total Customers): " + customerService.getTotalCustomerCount());
        System.out.println("总预订数 (Total Bookings): " + bookingService.getAllBookings().size());
        System.out.println("活动预订数 (Active Bookings): " + bookingService.getActiveBookings().size());
        System.out.println("==========================================");
    }

    private static int getIntInput() {
        while (!scanner.hasNextInt()) {
            System.out.print("请输入数字 (Please enter a number): ");
            scanner.next();
        }
        int value = scanner.nextInt();
        if (value < 0) {
            System.out.print("请输入非负数 (Please enter a non-negative number): ");
            return getIntInput();
        }
        return value;
    }
}

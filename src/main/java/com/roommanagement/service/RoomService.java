package com.roommanagement.service;

import com.roommanagement.model.Room;
import com.roommanagement.model.RoomStatus;
import com.roommanagement.model.RoomType;
import com.roommanagement.repository.RoomRepository;

import java.util.List;
import java.util.Optional;

/**
 * 房间服务层
 * Room Service Layer
 */
public class RoomService {
    private final RoomRepository roomRepository;

    public RoomService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    public Room addRoom(String roomNumber, RoomType roomType, int floor, double pricePerNight, String description) {
        if (roomRepository.exists(roomNumber)) {
            throw new IllegalArgumentException("房间号已存在 (Room number already exists): " + roomNumber);
        }
        
        if (floor < 1) {
            throw new IllegalArgumentException("楼层必须大于0 (Floor must be greater than 0)");
        }
        
        if (pricePerNight < 0) {
            throw new IllegalArgumentException("价格不能为负 (Price cannot be negative)");
        }

        Room room = new Room(roomNumber, roomType, floor, pricePerNight, description);
        return roomRepository.save(room);
    }

    public Optional<Room> getRoomByNumber(String roomNumber) {
        return roomRepository.findByRoomNumber(roomNumber);
    }

    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    public List<Room> getAvailableRooms() {
        return roomRepository.findByStatus(RoomStatus.AVAILABLE);
    }

    public List<Room> getRoomsByType(RoomType type) {
        return roomRepository.findByType(type);
    }

    public List<Room> getRoomsByFloor(int floor) {
        return roomRepository.findByFloor(floor);
    }

    public Room updateRoomStatus(String roomNumber, RoomStatus newStatus) {
        Room room = roomRepository.findByRoomNumber(roomNumber)
                .orElseThrow(() -> new IllegalArgumentException("房间不存在 (Room not found): " + roomNumber));
        
        room.setStatus(newStatus);
        return roomRepository.save(room);
    }

    public Room updateRoomPrice(String roomNumber, double newPrice) {
        if (newPrice < 0) {
            throw new IllegalArgumentException("价格不能为负 (Price cannot be negative)");
        }
        
        Room room = roomRepository.findByRoomNumber(roomNumber)
                .orElseThrow(() -> new IllegalArgumentException("房间不存在 (Room not found): " + roomNumber));
        
        room.setPricePerNight(newPrice);
        return roomRepository.save(room);
    }

    public boolean deleteRoom(String roomNumber) {
        return roomRepository.delete(roomNumber);
    }

    public int getTotalRoomCount() {
        return roomRepository.count();
    }

    public long getAvailableRoomCount() {
        return roomRepository.findAll().stream()
                .filter(room -> room.getStatus() == RoomStatus.AVAILABLE)
                .count();
    }
}

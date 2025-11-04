package com.roommanagement.repository;

import com.roommanagement.model.Room;
import com.roommanagement.model.RoomStatus;
import com.roommanagement.model.RoomType;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 房间数据访问层
 * Room Data Access Layer
 */
public class RoomRepository {
    private final Map<String, Room> rooms;

    public RoomRepository() {
        this.rooms = new HashMap<>();
    }

    public Room save(Room room) {
        rooms.put(room.getRoomNumber(), room);
        return room;
    }

    public Optional<Room> findByRoomNumber(String roomNumber) {
        return Optional.ofNullable(rooms.get(roomNumber));
    }

    public List<Room> findAll() {
        return new ArrayList<>(rooms.values());
    }

    public List<Room> findByStatus(RoomStatus status) {
        return rooms.values().stream()
                .filter(room -> room.getStatus() == status)
                .collect(Collectors.toList());
    }

    public List<Room> findByType(RoomType type) {
        return rooms.values().stream()
                .filter(room -> room.getRoomType() == type)
                .collect(Collectors.toList());
    }

    public List<Room> findByFloor(int floor) {
        return rooms.values().stream()
                .filter(room -> room.getFloor() == floor)
                .collect(Collectors.toList());
    }

    public boolean delete(String roomNumber) {
        return rooms.remove(roomNumber) != null;
    }

    public void clear() {
        rooms.clear();
    }

    public int count() {
        return rooms.size();
    }

    public boolean exists(String roomNumber) {
        return rooms.containsKey(roomNumber);
    }
}

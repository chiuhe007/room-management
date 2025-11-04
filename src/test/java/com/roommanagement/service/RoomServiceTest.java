package com.roommanagement.service;

import com.roommanagement.model.Room;
import com.roommanagement.model.RoomStatus;
import com.roommanagement.model.RoomType;
import com.roommanagement.repository.RoomRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

class RoomServiceTest {
    private RoomService roomService;
    private RoomRepository roomRepository;

    @BeforeEach
    void setUp() {
        roomRepository = new RoomRepository();
        roomService = new RoomService(roomRepository);
    }

    @Test
    void testAddRoom() {
        Room room = roomService.addRoom("101", RoomType.SINGLE, 1, 200.0, "Standard room");
        
        assertNotNull(room);
        assertEquals("101", room.getRoomNumber());
        assertEquals(RoomType.SINGLE, room.getRoomType());
        assertEquals(1, room.getFloor());
        assertEquals(200.0, room.getPricePerNight());
    }

    @Test
    void testAddDuplicateRoom() {
        roomService.addRoom("101", RoomType.SINGLE, 1, 200.0, "Standard room");
        
        assertThrows(IllegalArgumentException.class, () -> {
            roomService.addRoom("101", RoomType.DOUBLE, 2, 300.0, "Another room");
        });
    }

    @Test
    void testAddRoomWithInvalidFloor() {
        assertThrows(IllegalArgumentException.class, () -> {
            roomService.addRoom("101", RoomType.SINGLE, 0, 200.0, "Standard room");
        });
    }

    @Test
    void testAddRoomWithNegativePrice() {
        assertThrows(IllegalArgumentException.class, () -> {
            roomService.addRoom("101", RoomType.SINGLE, 1, -100.0, "Standard room");
        });
    }

    @Test
    void testGetRoomByNumber() {
        roomService.addRoom("101", RoomType.SINGLE, 1, 200.0, "Standard room");
        
        Optional<Room> room = roomService.getRoomByNumber("101");
        assertTrue(room.isPresent());
        assertEquals("101", room.get().getRoomNumber());
    }

    @Test
    void testGetNonExistentRoom() {
        Optional<Room> room = roomService.getRoomByNumber("999");
        assertFalse(room.isPresent());
    }

    @Test
    void testGetAllRooms() {
        roomService.addRoom("101", RoomType.SINGLE, 1, 200.0, "Room 1");
        roomService.addRoom("102", RoomType.DOUBLE, 1, 300.0, "Room 2");
        roomService.addRoom("201", RoomType.SUITE, 2, 500.0, "Room 3");
        
        List<Room> rooms = roomService.getAllRooms();
        assertEquals(3, rooms.size());
    }

    @Test
    void testGetAvailableRooms() {
        roomService.addRoom("101", RoomType.SINGLE, 1, 200.0, "Room 1");
        roomService.addRoom("102", RoomType.DOUBLE, 1, 300.0, "Room 2");
        roomService.updateRoomStatus("102", RoomStatus.OCCUPIED);
        
        List<Room> availableRooms = roomService.getAvailableRooms();
        assertEquals(1, availableRooms.size());
        assertEquals("101", availableRooms.get(0).getRoomNumber());
    }

    @Test
    void testGetRoomsByType() {
        roomService.addRoom("101", RoomType.SINGLE, 1, 200.0, "Room 1");
        roomService.addRoom("102", RoomType.SINGLE, 1, 200.0, "Room 2");
        roomService.addRoom("201", RoomType.DOUBLE, 2, 300.0, "Room 3");
        
        List<Room> singleRooms = roomService.getRoomsByType(RoomType.SINGLE);
        assertEquals(2, singleRooms.size());
    }

    @Test
    void testGetRoomsByFloor() {
        roomService.addRoom("101", RoomType.SINGLE, 1, 200.0, "Room 1");
        roomService.addRoom("102", RoomType.DOUBLE, 1, 300.0, "Room 2");
        roomService.addRoom("201", RoomType.SUITE, 2, 500.0, "Room 3");
        
        List<Room> firstFloorRooms = roomService.getRoomsByFloor(1);
        assertEquals(2, firstFloorRooms.size());
    }

    @Test
    void testUpdateRoomStatus() {
        roomService.addRoom("101", RoomType.SINGLE, 1, 200.0, "Room 1");
        
        Room updatedRoom = roomService.updateRoomStatus("101", RoomStatus.MAINTENANCE);
        assertEquals(RoomStatus.MAINTENANCE, updatedRoom.getStatus());
    }

    @Test
    void testUpdateNonExistentRoomStatus() {
        assertThrows(IllegalArgumentException.class, () -> {
            roomService.updateRoomStatus("999", RoomStatus.OCCUPIED);
        });
    }

    @Test
    void testUpdateRoomPrice() {
        roomService.addRoom("101", RoomType.SINGLE, 1, 200.0, "Room 1");
        
        Room updatedRoom = roomService.updateRoomPrice("101", 250.0);
        assertEquals(250.0, updatedRoom.getPricePerNight());
    }

    @Test
    void testUpdateRoomPriceWithNegativeValue() {
        roomService.addRoom("101", RoomType.SINGLE, 1, 200.0, "Room 1");
        
        assertThrows(IllegalArgumentException.class, () -> {
            roomService.updateRoomPrice("101", -50.0);
        });
    }

    @Test
    void testDeleteRoom() {
        roomService.addRoom("101", RoomType.SINGLE, 1, 200.0, "Room 1");
        
        boolean deleted = roomService.deleteRoom("101");
        assertTrue(deleted);
        assertFalse(roomService.getRoomByNumber("101").isPresent());
    }

    @Test
    void testDeleteNonExistentRoom() {
        boolean deleted = roomService.deleteRoom("999");
        assertFalse(deleted);
    }

    @Test
    void testGetRoomCounts() {
        roomService.addRoom("101", RoomType.SINGLE, 1, 200.0, "Room 1");
        roomService.addRoom("102", RoomType.DOUBLE, 1, 300.0, "Room 2");
        roomService.updateRoomStatus("102", RoomStatus.OCCUPIED);
        
        assertEquals(2, roomService.getTotalRoomCount());
        assertEquals(1, roomService.getAvailableRoomCount());
    }
}

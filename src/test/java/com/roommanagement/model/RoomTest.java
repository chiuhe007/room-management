package com.roommanagement.model;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class RoomTest {

    @Test
    void testRoomCreation() {
        Room room = new Room("101", RoomType.SINGLE, 1);
        
        assertEquals("101", room.getRoomNumber());
        assertEquals(RoomType.SINGLE, room.getRoomType());
        assertEquals(1, room.getFloor());
        assertEquals(RoomStatus.AVAILABLE, room.getStatus());
        assertEquals(200.0, room.getPricePerNight());
    }

    @Test
    void testRoomWithCustomPrice() {
        Room room = new Room("102", RoomType.DOUBLE, 2, 350.0, "Sea view");
        
        assertEquals("102", room.getRoomNumber());
        assertEquals(350.0, room.getPricePerNight());
        assertEquals("Sea view", room.getDescription());
    }

    @Test
    void testRoomEquality() {
        Room room1 = new Room("101", RoomType.SINGLE, 1);
        Room room2 = new Room("101", RoomType.DOUBLE, 2);
        Room room3 = new Room("102", RoomType.SINGLE, 1);
        
        assertEquals(room1, room2); // Same room number
        assertNotEquals(room1, room3); // Different room number
    }

    @Test
    void testRoomStatusChange() {
        Room room = new Room("101", RoomType.SINGLE, 1);
        
        assertEquals(RoomStatus.AVAILABLE, room.getStatus());
        
        room.setStatus(RoomStatus.OCCUPIED);
        assertEquals(RoomStatus.OCCUPIED, room.getStatus());
    }
}

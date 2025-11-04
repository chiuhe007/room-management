package com.roommanagement.model;

import java.util.Objects;

/**
 * 房间实体类
 * Room Entity Class
 */
public class Room {
    private String roomNumber;
    private RoomType roomType;
    private RoomStatus status;
    private int floor;
    private double pricePerNight;
    private String description;

    public Room() {
    }

    public Room(String roomNumber, RoomType roomType, int floor) {
        this.roomNumber = roomNumber;
        this.roomType = roomType;
        this.floor = floor;
        this.status = RoomStatus.AVAILABLE;
        this.pricePerNight = roomType.getBasePrice();
        this.description = "";
    }

    public Room(String roomNumber, RoomType roomType, int floor, double pricePerNight, String description) {
        this.roomNumber = roomNumber;
        this.roomType = roomType;
        this.floor = floor;
        this.status = RoomStatus.AVAILABLE;
        this.pricePerNight = pricePerNight;
        this.description = description;
    }

    // Getters and Setters
    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public RoomType getRoomType() {
        return roomType;
    }

    public void setRoomType(RoomType roomType) {
        this.roomType = roomType;
    }

    public RoomStatus getStatus() {
        return status;
    }

    public void setStatus(RoomStatus status) {
        this.status = status;
    }

    public int getFloor() {
        return floor;
    }

    public void setFloor(int floor) {
        this.floor = floor;
    }

    public double getPricePerNight() {
        return pricePerNight;
    }

    public void setPricePerNight(double pricePerNight) {
        this.pricePerNight = pricePerNight;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Room room = (Room) o;
        return Objects.equals(roomNumber, room.roomNumber);
    }

    @Override
    public int hashCode() {
        return Objects.hash(roomNumber);
    }

    @Override
    public String toString() {
        return "Room{" +
                "roomNumber='" + roomNumber + '\'' +
                ", roomType=" + roomType.getChineseName() +
                ", status=" + status.getChineseName() +
                ", floor=" + floor +
                ", pricePerNight=¥" + pricePerNight +
                ", description='" + description + '\'' +
                '}';
    }
}

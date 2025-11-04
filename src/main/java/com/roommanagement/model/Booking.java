package com.roommanagement.model;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Objects;

/**
 * 预订实体类
 * Booking Entity Class
 */
public class Booking {
    private String bookingId;
    private String customerId;
    private String roomNumber;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private double totalPrice;
    private BookingStatus status;

    public enum BookingStatus {
        PENDING("待确认", "Pending"),
        CONFIRMED("已确认", "Confirmed"),
        CHECKED_IN("已入住", "Checked In"),
        CHECKED_OUT("已退房", "Checked Out"),
        CANCELLED("已取消", "Cancelled");

        private final String chineseName;
        private final String englishName;

        BookingStatus(String chineseName, String englishName) {
            this.chineseName = chineseName;
            this.englishName = englishName;
        }

        public String getChineseName() {
            return chineseName;
        }

        public String getEnglishName() {
            return englishName;
        }
    }

    public Booking() {
    }

    public Booking(String bookingId, String customerId, String roomNumber, 
                   LocalDate checkInDate, LocalDate checkOutDate, double pricePerNight) {
        this.bookingId = bookingId;
        this.customerId = customerId;
        this.roomNumber = roomNumber;
        this.checkInDate = checkInDate;
        this.checkOutDate = checkOutDate;
        this.status = BookingStatus.PENDING;
        calculateTotalPrice(pricePerNight);
    }

    private void calculateTotalPrice(double pricePerNight) {
        long nights = ChronoUnit.DAYS.between(checkInDate, checkOutDate);
        this.totalPrice = nights * pricePerNight;
    }

    // Getters and Setters
    public String getBookingId() {
        return bookingId;
    }

    public void setBookingId(String bookingId) {
        this.bookingId = bookingId;
    }

    public String getCustomerId() {
        return customerId;
    }

    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public LocalDate getCheckInDate() {
        return checkInDate;
    }

    public void setCheckInDate(LocalDate checkInDate) {
        this.checkInDate = checkInDate;
    }

    public LocalDate getCheckOutDate() {
        return checkOutDate;
    }

    public void setCheckOutDate(LocalDate checkOutDate) {
        this.checkOutDate = checkOutDate;
    }

    public double getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(double totalPrice) {
        this.totalPrice = totalPrice;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public long getNights() {
        return ChronoUnit.DAYS.between(checkInDate, checkOutDate);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Booking booking = (Booking) o;
        return Objects.equals(bookingId, booking.bookingId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(bookingId);
    }

    @Override
    public String toString() {
        return "Booking{" +
                "bookingId='" + bookingId + '\'' +
                ", customerId='" + customerId + '\'' +
                ", roomNumber='" + roomNumber + '\'' +
                ", checkInDate=" + checkInDate +
                ", checkOutDate=" + checkOutDate +
                ", totalPrice=¥" + totalPrice +
                ", status=" + status.getChineseName() +
                '}';
    }
}

package com.roommanagement.repository;

import com.roommanagement.model.Booking;
import com.roommanagement.model.Booking.BookingStatus;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 预订数据访问层
 * Booking Data Access Layer
 */
public class BookingRepository {
    private final Map<String, Booking> bookings;

    public BookingRepository() {
        this.bookings = new HashMap<>();
    }

    public Booking save(Booking booking) {
        bookings.put(booking.getBookingId(), booking);
        return booking;
    }

    public Optional<Booking> findById(String bookingId) {
        return Optional.ofNullable(bookings.get(bookingId));
    }

    public List<Booking> findAll() {
        return new ArrayList<>(bookings.values());
    }

    public List<Booking> findByCustomerId(String customerId) {
        return bookings.values().stream()
                .filter(booking -> booking.getCustomerId().equals(customerId))
                .collect(Collectors.toList());
    }

    public List<Booking> findByRoomNumber(String roomNumber) {
        return bookings.values().stream()
                .filter(booking -> booking.getRoomNumber().equals(roomNumber))
                .collect(Collectors.toList());
    }

    public List<Booking> findByStatus(BookingStatus status) {
        return bookings.values().stream()
                .filter(booking -> booking.getStatus() == status)
                .collect(Collectors.toList());
    }

    public List<Booking> findByDateRange(LocalDate startDate, LocalDate endDate) {
        return bookings.values().stream()
                .filter(booking -> !booking.getCheckOutDate().isBefore(startDate) 
                        && !booking.getCheckInDate().isAfter(endDate))
                .collect(Collectors.toList());
    }

    public boolean delete(String bookingId) {
        return bookings.remove(bookingId) != null;
    }

    public void clear() {
        bookings.clear();
    }

    public int count() {
        return bookings.size();
    }

    public boolean exists(String bookingId) {
        return bookings.containsKey(bookingId);
    }
}

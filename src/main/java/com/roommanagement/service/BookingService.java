package com.roommanagement.service;

import com.roommanagement.model.Booking;
import com.roommanagement.model.Booking.BookingStatus;
import com.roommanagement.model.Room;
import com.roommanagement.model.RoomStatus;
import com.roommanagement.repository.BookingRepository;
import com.roommanagement.repository.CustomerRepository;
import com.roommanagement.repository.RoomRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * 预订服务层
 * Booking Service Layer
 */
public class BookingService {
    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final CustomerRepository customerRepository;

    public BookingService(BookingRepository bookingRepository, RoomRepository roomRepository, 
                         CustomerRepository customerRepository) {
        this.bookingRepository = bookingRepository;
        this.roomRepository = roomRepository;
        this.customerRepository = customerRepository;
    }

    public Booking createBooking(String customerId, String roomNumber, 
                                LocalDate checkInDate, LocalDate checkOutDate) {
        // Validate customer exists
        if (!customerRepository.exists(customerId)) {
            throw new IllegalArgumentException("顾客不存在 (Customer not found): " + customerId);
        }

        // Validate room exists
        Room room = roomRepository.findByRoomNumber(roomNumber)
                .orElseThrow(() -> new IllegalArgumentException("房间不存在 (Room not found): " + roomNumber));

        // Validate room is available
        if (room.getStatus() != RoomStatus.AVAILABLE) {
            throw new IllegalArgumentException("房间不可用 (Room not available): " + roomNumber);
        }

        // Validate dates
        if (checkInDate.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("入住日期不能早于今天 (Check-in date cannot be before today)");
        }
        if (checkOutDate.isBefore(checkInDate) || checkOutDate.isEqual(checkInDate)) {
            throw new IllegalArgumentException("退房日期必须晚于入住日期 (Check-out date must be after check-in date)");
        }

        // Check for conflicts
        if (isRoomBookedForDateRange(roomNumber, checkInDate, checkOutDate)) {
            throw new IllegalArgumentException("房间在该时间段已被预订 (Room already booked for this date range)");
        }

        String bookingId = generateBookingId();
        Booking booking = new Booking(bookingId, customerId, roomNumber, 
                                     checkInDate, checkOutDate, room.getPricePerNight());
        booking.setStatus(BookingStatus.CONFIRMED);

        // Update room status to reserved
        room.setStatus(RoomStatus.RESERVED);
        roomRepository.save(room);

        return bookingRepository.save(booking);
    }

    private boolean isRoomBookedForDateRange(String roomNumber, LocalDate checkIn, LocalDate checkOut) {
        List<Booking> roomBookings = bookingRepository.findByRoomNumber(roomNumber);
        for (Booking booking : roomBookings) {
            // Skip cancelled bookings
            if (booking.getStatus() == BookingStatus.CANCELLED 
                || booking.getStatus() == BookingStatus.CHECKED_OUT) {
                continue;
            }

            // Check for date overlap
            if (!(checkOut.isBefore(booking.getCheckInDate()) 
                  || checkIn.isAfter(booking.getCheckOutDate()))) {
                return true;
            }
        }
        return false;
    }

    public Booking checkIn(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("预订不存在 (Booking not found): " + bookingId));

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new IllegalArgumentException("只能办理已确认的预订入住 (Can only check-in confirmed bookings)");
        }

        booking.setStatus(BookingStatus.CHECKED_IN);
        
        // Update room status
        Room room = roomRepository.findByRoomNumber(booking.getRoomNumber())
                .orElseThrow(() -> new IllegalArgumentException("房间不存在 (Room not found)"));
        room.setStatus(RoomStatus.OCCUPIED);
        roomRepository.save(room);

        return bookingRepository.save(booking);
    }

    public Booking checkOut(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("预订不存在 (Booking not found): " + bookingId));

        if (booking.getStatus() != BookingStatus.CHECKED_IN) {
            throw new IllegalArgumentException("只能对已入住的预订办理退房 (Can only check-out checked-in bookings)");
        }

        booking.setStatus(BookingStatus.CHECKED_OUT);
        
        // Update room status back to available
        Room room = roomRepository.findByRoomNumber(booking.getRoomNumber())
                .orElseThrow(() -> new IllegalArgumentException("房间不存在 (Room not found)"));
        room.setStatus(RoomStatus.AVAILABLE);
        roomRepository.save(room);

        return bookingRepository.save(booking);
    }

    public Booking cancelBooking(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("预订不存在 (Booking not found): " + bookingId));

        if (booking.getStatus() == BookingStatus.CHECKED_IN 
            || booking.getStatus() == BookingStatus.CHECKED_OUT) {
            throw new IllegalArgumentException("无法取消已入住或已退房的预订 (Cannot cancel checked-in or checked-out bookings)");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        
        // Update room status back to available
        Room room = roomRepository.findByRoomNumber(booking.getRoomNumber())
                .orElseThrow(() -> new IllegalArgumentException("房间不存在 (Room not found)"));
        room.setStatus(RoomStatus.AVAILABLE);
        roomRepository.save(room);

        return bookingRepository.save(booking);
    }

    public Optional<Booking> getBookingById(String bookingId) {
        return bookingRepository.findById(bookingId);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public List<Booking> getBookingsByCustomer(String customerId) {
        return bookingRepository.findByCustomerId(customerId);
    }

    public List<Booking> getBookingsByRoom(String roomNumber) {
        return bookingRepository.findByRoomNumber(roomNumber);
    }

    public List<Booking> getActiveBookings() {
        return bookingRepository.findByStatus(BookingStatus.CHECKED_IN);
    }

    private String generateBookingId() {
        return "BK" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}

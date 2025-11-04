package com.roommanagement.service;

import com.roommanagement.model.*;
import com.roommanagement.model.Booking.BookingStatus;
import com.roommanagement.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class BookingServiceTest {
    private BookingService bookingService;
    private RoomService roomService;
    private CustomerService customerService;

    @BeforeEach
    void setUp() {
        RoomRepository roomRepository = new RoomRepository();
        CustomerRepository customerRepository = new CustomerRepository();
        BookingRepository bookingRepository = new BookingRepository();

        roomService = new RoomService(roomRepository);
        customerService = new CustomerService(customerRepository);
        bookingService = new BookingService(bookingRepository, roomRepository, customerRepository);

        // Add test data
        roomService.addRoom("101", RoomType.SINGLE, 1, 200.0, "Test room");
        customerService.addCustomer("C001", "Test User", "123456789012345678", "1234567890", "test@test.com");
    }

    @Test
    void testCreateBooking() {
        LocalDate checkIn = LocalDate.now().plusDays(1);
        LocalDate checkOut = LocalDate.now().plusDays(3);

        Booking booking = bookingService.createBooking("C001", "101", checkIn, checkOut);

        assertNotNull(booking);
        assertEquals("C001", booking.getCustomerId());
        assertEquals("101", booking.getRoomNumber());
        assertEquals(checkIn, booking.getCheckInDate());
        assertEquals(checkOut, booking.getCheckOutDate());
        assertEquals(BookingStatus.CONFIRMED, booking.getStatus());
        assertEquals(400.0, booking.getTotalPrice()); // 2 nights * 200
    }

    @Test
    void testCreateBookingWithNonExistentCustomer() {
        LocalDate checkIn = LocalDate.now().plusDays(1);
        LocalDate checkOut = LocalDate.now().plusDays(3);

        assertThrows(IllegalArgumentException.class, () -> {
            bookingService.createBooking("C999", "101", checkIn, checkOut);
        });
    }

    @Test
    void testCreateBookingWithNonExistentRoom() {
        LocalDate checkIn = LocalDate.now().plusDays(1);
        LocalDate checkOut = LocalDate.now().plusDays(3);

        assertThrows(IllegalArgumentException.class, () -> {
            bookingService.createBooking("C001", "999", checkIn, checkOut);
        });
    }

    @Test
    void testCreateBookingWithPastCheckInDate() {
        LocalDate checkIn = LocalDate.now().minusDays(1);
        LocalDate checkOut = LocalDate.now().plusDays(2);

        assertThrows(IllegalArgumentException.class, () -> {
            bookingService.createBooking("C001", "101", checkIn, checkOut);
        });
    }

    @Test
    void testCreateBookingWithInvalidDateRange() {
        LocalDate checkIn = LocalDate.now().plusDays(3);
        LocalDate checkOut = LocalDate.now().plusDays(1);

        assertThrows(IllegalArgumentException.class, () -> {
            bookingService.createBooking("C001", "101", checkIn, checkOut);
        });
    }

    @Test
    void testCheckIn() {
        LocalDate checkIn = LocalDate.now().plusDays(1);
        LocalDate checkOut = LocalDate.now().plusDays(3);

        Booking booking = bookingService.createBooking("C001", "101", checkIn, checkOut);
        Booking checkedInBooking = bookingService.checkIn(booking.getBookingId());

        assertEquals(BookingStatus.CHECKED_IN, checkedInBooking.getStatus());
        
        Room room = roomService.getRoomByNumber("101").get();
        assertEquals(RoomStatus.OCCUPIED, room.getStatus());
    }

    @Test
    void testCheckOut() {
        LocalDate checkIn = LocalDate.now().plusDays(1);
        LocalDate checkOut = LocalDate.now().plusDays(3);

        Booking booking = bookingService.createBooking("C001", "101", checkIn, checkOut);
        bookingService.checkIn(booking.getBookingId());
        Booking checkedOutBooking = bookingService.checkOut(booking.getBookingId());

        assertEquals(BookingStatus.CHECKED_OUT, checkedOutBooking.getStatus());
        
        Room room = roomService.getRoomByNumber("101").get();
        assertEquals(RoomStatus.AVAILABLE, room.getStatus());
    }

    @Test
    void testCancelBooking() {
        LocalDate checkIn = LocalDate.now().plusDays(1);
        LocalDate checkOut = LocalDate.now().plusDays(3);

        Booking booking = bookingService.createBooking("C001", "101", checkIn, checkOut);
        Booking cancelledBooking = bookingService.cancelBooking(booking.getBookingId());

        assertEquals(BookingStatus.CANCELLED, cancelledBooking.getStatus());
        
        Room room = roomService.getRoomByNumber("101").get();
        assertEquals(RoomStatus.AVAILABLE, room.getStatus());
    }

    @Test
    void testCannotCancelCheckedInBooking() {
        LocalDate checkIn = LocalDate.now().plusDays(1);
        LocalDate checkOut = LocalDate.now().plusDays(3);

        Booking booking = bookingService.createBooking("C001", "101", checkIn, checkOut);
        bookingService.checkIn(booking.getBookingId());

        assertThrows(IllegalArgumentException.class, () -> {
            bookingService.cancelBooking(booking.getBookingId());
        });
    }

    @Test
    void testGetBookingsByCustomer() {
        roomService.addRoom("102", RoomType.DOUBLE, 1, 300.0, "Test room 2");
        
        LocalDate checkIn1 = LocalDate.now().plusDays(1);
        LocalDate checkOut1 = LocalDate.now().plusDays(3);
        bookingService.createBooking("C001", "101", checkIn1, checkOut1);

        LocalDate checkIn2 = LocalDate.now().plusDays(5);
        LocalDate checkOut2 = LocalDate.now().plusDays(7);
        bookingService.createBooking("C001", "102", checkIn2, checkOut2);

        List<Booking> bookings = bookingService.getBookingsByCustomer("C001");
        assertEquals(2, bookings.size());
    }

    @Test
    void testGetActiveBookings() {
        LocalDate checkIn = LocalDate.now().plusDays(1);
        LocalDate checkOut = LocalDate.now().plusDays(3);

        Booking booking = bookingService.createBooking("C001", "101", checkIn, checkOut);
        bookingService.checkIn(booking.getBookingId());

        List<Booking> activeBookings = bookingService.getActiveBookings();
        assertEquals(1, activeBookings.size());
        assertEquals(BookingStatus.CHECKED_IN, activeBookings.get(0).getStatus());
    }

    @Test
    void testConflictingBookings() {
        // Create first booking
        LocalDate checkIn1 = LocalDate.now().plusDays(1);
        LocalDate checkOut1 = LocalDate.now().plusDays(5);
        bookingService.createBooking("C001", "101", checkIn1, checkOut1);

        // Try to create overlapping booking
        LocalDate checkIn2 = LocalDate.now().plusDays(3);
        LocalDate checkOut2 = LocalDate.now().plusDays(7);

        assertThrows(IllegalArgumentException.class, () -> {
            bookingService.createBooking("C001", "101", checkIn2, checkOut2);
        });
    }
}

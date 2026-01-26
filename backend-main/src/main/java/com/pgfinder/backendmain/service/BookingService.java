package com.pgfinder.backendmain.service;

import com.pgfinder.backendmain.entity.Booking;
import java.util.List;

public interface BookingService {
    Booking createBooking(Long pgId, String username);
    Booking createBooking(Long pgId, String username, Long donorId);
    Booking createBooking(Long pgId, String username, Long donorId, boolean requestAid);
    List<Booking> getBookingsByUser(String username);
    List<Booking> getBookingsByOwner(String ownerUsername);
    List<Booking> getBookingsByStatus(String status);
    List<Booking> getBookingsByDonor(String donorUsername);
    Booking updateBookingStatus(Long bookingId, String status);
    Booking approveSponsorship(Long bookingId, String donorUsername, Double percentage);
    void deleteBooking(Long bookingId);
}

package com.pgfinder.backendmain.controller;

import com.pgfinder.backendmain.entity.Booking;
import com.pgfinder.backendmain.service.BookingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private BookingService bookingService;

    private com.pgfinder.backendmain.service.EmailService emailService;

    public BookingController(BookingService bookingService, com.pgfinder.backendmain.service.EmailService emailService) {
        this.bookingService = bookingService;
        this.emailService = emailService;
    }

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Booking Controller Updated and Working");
    }

    @GetMapping("/test-email")
    public ResponseEntity<String> testEmail(@RequestParam String to) {
        try {
            emailService.sendSimpleMessage(to, "Test Email from PG Finder", "This is a test email to verify SMTP configuration.");
            return ResponseEntity.ok("Email sent successfully to " + to);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to send email: " + e.getMessage());
        }
    }

    @PostMapping("/{pgId}")
    public ResponseEntity<Booking> createBooking(
            @PathVariable Long pgId,
            @RequestParam(required = false) Long donorId,
            @RequestParam(required = false, defaultValue = "false") boolean requestAid) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return new ResponseEntity<>(bookingService.createBooking(pgId, username, donorId, requestAid), HttpStatus.CREATED);
    }

    @GetMapping("/aid-requests")
    public List<Booking> getAidRequests() {
        return bookingService.getBookingsByStatus("REQUESTING_AID");
    }

    @PutMapping("/{bookingId}/sponsor")
    public ResponseEntity<Booking> sponsorBooking(@PathVariable Long bookingId, @RequestBody java.util.Map<String, Double> payload) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String donorUsername = auth.getName();
        
        Double percentage = payload.get("percentage");
        if (percentage == null) {
             return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(bookingService.approveSponsorship(bookingId, donorUsername, percentage));
    }

    @PutMapping("/{bookingId}/status")
    public ResponseEntity<?> updateBookingStatus(@PathVariable Long bookingId, @RequestBody java.util.Map<String, String> payload) {
        System.out.println("DEBUG: updateBookingStatus called for ID: " + bookingId);
        try {
            String status = payload.get("status");
            System.out.println("DEBUG: Setting status to: " + status);
            return ResponseEntity.ok(bookingService.updateBookingStatus(bookingId, status));
        } catch (Exception e) {
            System.err.println("ERROR in updateBookingStatus: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Backend Error: " + e.getMessage());
        }
    }

    @GetMapping("/my-bookings")
    public List<Booking> getMyBookings() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return bookingService.getBookingsByUser(username);
    }

    @GetMapping("/my-sponsorships")
    public List<Booking> getMySponsorships() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return bookingService.getBookingsByDonor(username);
    }

    @DeleteMapping("/{bookingId}")
    public ResponseEntity<?> cancelBooking(@PathVariable Long bookingId) {
        try {
            bookingService.deleteBooking(bookingId);
            return ResponseEntity.ok("Booking cancelled successfully");
        } catch (Exception e) {
            System.err.println("Error cancelling booking: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Cancel Failed: " + e.getMessage());
        }
    }
}

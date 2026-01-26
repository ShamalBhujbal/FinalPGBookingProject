package com.pgfinder.backendmain.service.impl;

import com.pgfinder.backendmain.entity.Booking;
import com.pgfinder.backendmain.entity.PG;
import com.pgfinder.backendmain.repository.BookingRepository;
import com.pgfinder.backendmain.repository.PGRepository;
import com.pgfinder.backendmain.service.BookingService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final PGRepository pgRepository;
    private final com.pgfinder.backendmain.repository.UserRepository userRepository;
    private final com.pgfinder.backendmain.service.EmailService emailService;

    public BookingServiceImpl(BookingRepository bookingRepository, PGRepository pgRepository,
                              com.pgfinder.backendmain.repository.UserRepository userRepository,
                              com.pgfinder.backendmain.service.EmailService emailService) {
        this.bookingRepository = bookingRepository;
        this.pgRepository = pgRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    @Override
    public Booking createBooking(Long pgId, String username) {
        return createBooking(pgId, username, null, false);
    }

    @Override
    public Booking createBooking(Long pgId, String username, Long donorId) {
         return createBooking(pgId, username, donorId, false);
    }

    @Override
    public Booking createBooking(Long pgId, String username, Long donorId, boolean requestAid) {
        PG pg = pgRepository.findById(pgId).orElseThrow(() -> new RuntimeException("PG not found"));
        
        Booking booking = new Booking();
        booking.setPg(pg);
        booking.setUsername(username);
        booking.setBookingDate(LocalDateTime.now());
        
        if (requestAid) {
            booking.setStatus("REQUESTING_AID");
        } else {
            booking.setStatus("PENDING");
        }

        if (donorId != null) {
            com.pgfinder.backendmain.entity.User donor = userRepository.findById(donorId)
                    .orElse(null);
            if (donor != null && donor.getSponsorshipPercentage() != null && donor.getSponsorshipPercentage() > 0) {
                booking.setDonor(donor);
                double contribution = pg.getPrice() * (donor.getSponsorshipPercentage() / 100.0);
                booking.setDonorContribution(contribution);
            }
        }

        return bookingRepository.save(booking);
    }
    
    @Override
    public List<Booking> getBookingsByStatus(String status) {
        return bookingRepository.findByStatus(status);
    }

    @Override
    public List<Booking> getBookingsByDonor(String donorUsername) {
        System.out.println("DEBUG: Fetching bookings for donor: " + donorUsername);
        List<Booking> list = bookingRepository.findByDonorUsername(donorUsername);
        System.out.println("DEBUG: Found " + list.size() + " bookings for donor " + donorUsername);
        return list;
    }

    @Override
    @Transactional
    public Booking approveSponsorship(Long bookingId, String donorUsername, Double percentage) {
        System.out.println("DEBUG: Approving sponsorship. BookingID=" + bookingId + ", Donor=" + donorUsername);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        com.pgfinder.backendmain.entity.User donor = userRepository.findByUsername(donorUsername)
                .orElseThrow(() -> new RuntimeException("Donor not found"));
        
        booking.setDonor(donor);
        double contribution = booking.getPg().getPrice() * (percentage / 100.0);
        booking.setDonorContribution(contribution);
        booking.setStatus("APPROVED_AID"); // Requires user to pay remainder
        
        Booking saved = bookingRepository.save(booking);
        System.out.println("DEBUG: Sponsorship saved. Donor set to: " + saved.getDonor().getUsername());
        return saved;
    }

    @Override
    public Booking updateBookingStatus(Long bookingId, String status) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setStatus(status);
        Booking savedBooking = bookingRepository.save(booking);

        // Send Email if Confirmed
        if ("CONFIRMED".equalsIgnoreCase(status)) {
            try {
                com.pgfinder.backendmain.entity.User user = userRepository.findByUsername(booking.getUsername())
                        .orElseThrow(() -> new RuntimeException("User not found"));
                
                String contributionText = "";
                if (booking.getDonor() != null) {
                    contributionText = "\nSponsorship Applied: " + booking.getDonor().getUsername() + 
                                     " contributed " + booking.getDonorContribution() + "\n" +
                                     "Net Amount Paid: " + (booking.getPg().getPrice() - booking.getDonorContribution());
                }

                String subject = "Booking Confirmed - " + booking.getPg().getName();
                String message = "Dear " + user.getUsername() + ",\n\n" +
                        "Your booking for '" + booking.getPg().getName() + "' has been successfully confirmed.\n" +
                        "Total Rent: " + booking.getPg().getPrice() + 
                        contributionText + "\n" +
                        "Address: " + booking.getPg().getAddress() + "\n\n" +
                        "Thank you for using Area Stay Point!";
                
                emailService.sendSimpleMessage(user.getEmail(), subject, message);
            } catch (Exception e) {
                System.err.println("Error sending confirmation email: " + e.getMessage());
            }
        }

        return savedBooking;
    }

    @Override
    public List<Booking> getBookingsByUser(String username) {
        return bookingRepository.findByUsername(username);
    }

    @Override
    public List<Booking> getBookingsByOwner(String ownerUsername) {
        // Find all PGs by owner
        List<PG> ownerPGs = pgRepository.findByOwnerUsername(ownerUsername);
        
        // Find bookings for these PGs
        List<Booking> allBookings = new ArrayList<>();
        for (PG pg : ownerPGs) {
            allBookings.addAll(bookingRepository.findByPgId(pg.getId()));
        }
        return allBookings;
    }

    @Override
    public void deleteBooking(Long bookingId) {
        bookingRepository.deleteById(bookingId);
    }
}

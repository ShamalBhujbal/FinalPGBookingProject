package com.pgfinder.backendmain.controller;

import com.pgfinder.backendmain.entity.PG;
import com.pgfinder.backendmain.entity.User;
import com.pgfinder.backendmain.repository.PGRepository;
import com.pgfinder.backendmain.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final PGRepository pgRepository;
    private final com.pgfinder.backendmain.repository.BookingRepository bookingRepository;

    public AdminController(UserRepository userRepository, PGRepository pgRepository, com.pgfinder.backendmain.repository.BookingRepository bookingRepository) {
        this.userRepository = userRepository;
        this.pgRepository = pgRepository;
        this.bookingRepository = bookingRepository;
    }

    // --- Dashboard Statistics ---

    @GetMapping("/stats")
    public ResponseEntity<java.util.Map<String, Object>> getDashboardStats() {
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        
        List<User> allUsers = userRepository.findAll();
        long totalUsers = allUsers.size();
        long totalDonors = allUsers.stream().filter(u -> u.getRoles().contains("ROLE_DONOR")).count();
        long totalOwners = allUsers.stream().filter(u -> u.getRoles().contains("ROLE_OWNER")).count();
        
        long totalPGs = pgRepository.count();
        long totalBookings = bookingRepository.count();
        long usersWithBookings = bookingRepository.findAll().stream()
                .map(com.pgfinder.backendmain.entity.Booking::getUsername)
                .distinct()
                .count();
        
        stats.put("totalUsers", totalUsers);
        stats.put("totalDonors", totalDonors);
        stats.put("totalOwners", totalOwners);
        stats.put("totalPGs", totalPGs);
        stats.put("totalBookings", totalBookings);
        stats.put("usersWithBookings", usersWithBookings);

        return ResponseEntity.ok(stats);
    }

    // --- User CRUD ---

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        return userRepository.findById(id).map(user -> {
            user.setUsername(userDetails.getUsername());
            user.setEmail(userDetails.getEmail());
            user.setPhoneNumber(userDetails.getPhoneNumber());
            user.setRoles(userDetails.getRoles());
            return ResponseEntity.ok(userRepository.save(user));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok("User deleted successfully");
    }

    // --- Donor CRUD ---

    @GetMapping("/donors")
    public List<User> getAllDonors() {
        return userRepository.findAll().stream()
                .filter(user -> user.getRoles().contains("ROLE_DONOR"))
                .collect(java.util.stream.Collectors.toList());
    }
    
    // Donors are Users, so normal User CRUD applies, but we can have specific endpoint if needed.
    // For now, listing separately is good.

    // --- PG CRUD ---

    @GetMapping("/pgs")
    public List<PG> getAllPGs() {
        return pgRepository.findAll();
    }

    @PostMapping("/pgs")
    public PG createPG(@RequestBody PG pg) {
        return pgRepository.save(pg);
    }

    @PutMapping("/pgs/{id}")
    public ResponseEntity<PG> updatePG(@PathVariable Long id, @RequestBody PG pgDetails) {
        return pgRepository.findById(id).map(pg -> {
            pg.setName(pgDetails.getName());
            pg.setAddress(pgDetails.getAddress());
            pg.setPrice(pgDetails.getPrice());
            pg.setDescription(pgDetails.getDescription());
            // Update other fields as necessary
            return ResponseEntity.ok(pgRepository.save(pg));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/pgs/{id}")
    public ResponseEntity<String> deletePG(@PathVariable Long id) {
        if (!pgRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        pgRepository.deleteById(id);
        return ResponseEntity.ok("PG listing deleted successfully");
    }
}

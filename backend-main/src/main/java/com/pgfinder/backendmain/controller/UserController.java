package com.pgfinder.backendmain.controller;

import com.pgfinder.backendmain.entity.User;
import com.pgfinder.backendmain.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/donors")
    public List<User> getDonors() {
        // Simple filter: return all users who have ROLE_DONOR
        return userRepository.findAll().stream()
                .filter(u -> u.getRoles() != null && u.getRoles().contains("ROLE_DONOR"))
                .collect(Collectors.toList());
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return userRepository.findByUsername(username)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    @PutMapping("/me")
    public ResponseEntity<User> updateCurrentUser(@RequestBody User userDetails) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        return userRepository.findByUsername(username)
                .map(user -> {
                    if (userDetails.getUsername() != null && !userDetails.getUsername().isEmpty()) {
                        user.setUsername(userDetails.getUsername());
                    }
                    if (userDetails.getEmail() != null) {
                        user.setEmail(userDetails.getEmail());
                    }
                    if (userDetails.getPhoneNumber() != null) {
                        user.setPhoneNumber(userDetails.getPhoneNumber());
                    }
                    // Password update should be handled separately for security
                    return ResponseEntity.ok(userRepository.save(user));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/sponsorship")
    public ResponseEntity<User> updateSponsorship(@RequestBody Map<String, Double> payload) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        return userRepository.findByUsername(username)
                .map(user -> {
                    if (payload.containsKey("percentage")) {
                        user.setSponsorshipPercentage(payload.get("percentage"));
                        return ResponseEntity.ok(userRepository.save(user));
                    }
                    return ResponseEntity.badRequest().<User>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
    @PostMapping("/become-donor")
    public ResponseEntity<User> becomeDonor() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        return userRepository.findByUsername(username)
                .map(user -> {
                    if (user.getRoles() == null) {
                        user.setRoles(new java.util.HashSet<>());
                    }
                    if (!user.getRoles().contains("ROLE_DONOR")) {
                        user.getRoles().add("ROLE_DONOR");
                        // Set default percentage if not present (optional)
                        if (user.getSponsorshipPercentage() == null) {
                            user.setSponsorshipPercentage(10.0); // Default 10%
                        }
                        return ResponseEntity.ok(userRepository.save(user));
                    }
                    return ResponseEntity.ok(user); // Already a donor
                })
                .orElse(ResponseEntity.notFound().build());
    }
}

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

    public AdminController(UserRepository userRepository, PGRepository pgRepository) {
        this.userRepository = userRepository;
        this.pgRepository = pgRepository;
    }

    // --- User CRUD ---

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok("User deleted successfully");
    }

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

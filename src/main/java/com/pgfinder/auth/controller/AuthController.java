package com.pgfinder.auth.controller;

import com.pgfinder.auth.dto.AuthResponseDTO;
import com.pgfinder.auth.dto.LoginDTO;
import com.pgfinder.auth.dto.RegisterDTO;
import com.pgfinder.auth.entity.Role;
import com.pgfinder.auth.entity.User;
import com.pgfinder.auth.repository.RoleRepository;
import com.pgfinder.auth.repository.UserRepository;
import com.pgfinder.auth.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // Allow requests from frontend
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterDTO dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", "Email already exists"));
        }

        // Default to User role if not specified, similar to .NET logic
        String roleName = (dto.getRole() == null || dto.getRole().isEmpty()) ? "User" : dto.getRole();
        Role role = roleRepository.findByRoleName(roleName)
                .orElseGet(() -> {
                    // Create User role if it doesn't exist
                    Role newRole = new Role();
                    newRole.setRoleName("User"); // Defaulting to User if requested role not found logic or just
                                                 // creating the requested one?
                    // .NET code: if role == null -> create "User" role.
                    // Wait, .NET code says: var roleName = ...; var role = ...; if (role == null) {
                    // role = new Role { RoleName = "User" }; ... }
                    // This implies if usage sends "Admin" and "Admin" doesn't exist, it creates
                    // "User" and assigns "User"?
                    // Actually looking at .NET code:
                    // var roleName = string.IsNullOrEmpty(dto.Role) ? "User" : dto.Role;
                    // var role = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName ==
                    // roleName);
                    // if (role == null) { role = new Role { RoleName = "User" }; ... }
                    // Yes, if the requested role (e.g. "Admin") is not found, it falls back to
                    // creating/using "User".
                    // I will replicate this exact logic.
                    // But wait, if "User" role also doesn't exist, it creates it.

                    // Let's check if "User" role exists first to avoid duplicate "User" entries if
                    // we are falling back.
                    return roleRepository.findByRoleName("User")
                            .orElseGet(() -> roleRepository.save(new Role(null, "User")));
                });

        User user = new User();
        user.setFullName(dto.getFullName());
        user.setEmail(dto.getEmail());
        user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        user.setPhone(dto.getPhone());
        user.setRole(role);

        userRepository.save(user);

        String token = jwtUtil.generateToken(user);

        AuthResponseDTO.UserDetailsDTO userDetails = new AuthResponseDTO.UserDetailsDTO(
                user.getUserId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole().getRoleName());

        return ResponseEntity.ok(new AuthResponseDTO(token, userDetails));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDTO dto) {
        User user = userRepository.findByEmail(dto.getEmail()).orElse(null);

        if (user == null || !passwordEncoder.matches(dto.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(401).body(Collections.singletonMap("message", "Invalid credentials"));
        }

        String token = jwtUtil.generateToken(user);

        AuthResponseDTO.UserDetailsDTO userDetails = new AuthResponseDTO.UserDetailsDTO(
                user.getUserId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole().getRoleName());

        return ResponseEntity.ok(new AuthResponseDTO(token, userDetails));
    }

    @GetMapping("/test")
    public ResponseEntity<?> test() {
        return ResponseEntity.ok(Collections.singletonMap("message", "API is working!"));
    }
}

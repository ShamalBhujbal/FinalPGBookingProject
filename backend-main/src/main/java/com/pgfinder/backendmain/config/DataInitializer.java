package com.pgfinder.backendmain.config;

import com.pgfinder.backendmain.entity.User;
import com.pgfinder.backendmain.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initAdmin(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            System.out.println("DEBUG: Starting Admin Initialization...");
            User admin = userRepository.findByUsername("admin")
                    .orElseGet(() -> {
                        User newUser = new User();
                        newUser.setUsername("admin");
                        return newUser;
                    });
            
            admin.setEmail("admin@pgfinder.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            
            Set<String> roles = new HashSet<>();
            roles.add("ROLE_ADMIN");
            admin.setRoles(roles);
            
            userRepository.save(admin);
            System.out.println("Admin user updated/verified: admin / admin123");
        };
    }
}

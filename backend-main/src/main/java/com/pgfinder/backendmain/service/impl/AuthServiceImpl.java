package com.pgfinder.backendmain.service.impl;

import com.pgfinder.backendmain.dto.LoginDto;
import com.pgfinder.backendmain.dto.RegisterDto;
import com.pgfinder.backendmain.entity.User;
import com.pgfinder.backendmain.repository.UserRepository;
import com.pgfinder.backendmain.service.AuthService;
import com.pgfinder.backendmain.util.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
public class AuthServiceImpl implements AuthService {

    private AuthenticationManager authenticationManager;
    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;
    private JwtUtil jwtUtil;

    public AuthServiceImpl(AuthenticationManager authenticationManager,
                           UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           JwtUtil jwtUtil) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public String login(LoginDto loginDto) {
        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                loginDto.getUsernameOrEmail(), loginDto.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = jwtUtil.generateToken(authentication);

        return token;
    }

    @Override
    public String register(RegisterDto registerDto) {
        // add check for username exists in database
        if(userRepository.existsByUsername(registerDto.getUsername())){
            throw new RuntimeException("Username is already exists!.");
        }

        // add check for email exists in database
        if(userRepository.existsByEmail(registerDto.getEmail())){
            throw new RuntimeException("Email is already exists!.");
        }

        User user = new User();
        user.setUsername(registerDto.getUsername());
        user.setEmail(registerDto.getEmail());
        user.setPassword(passwordEncoder.encode(registerDto.getPassword()));

        Set<String> roles = new HashSet<>();
        
        if(registerDto.getRole() != null && registerDto.getRole().equalsIgnoreCase("owner")) {
            roles.add("ROLE_OWNER");
        } else if(registerDto.getRole() != null && registerDto.getRole().equalsIgnoreCase("donor")) {
            roles.add("ROLE_DONOR");
        } else {
            roles.add("ROLE_USER");
        }
        
        user.setRoles(roles);

        userRepository.save(user);

        return "User registered successfully!.";
    }
}

package com.pgfinder.backendmain.service;

import com.pgfinder.backendmain.dto.LoginDto;
import com.pgfinder.backendmain.dto.RegisterDto;

public interface AuthService {
    String login(LoginDto loginDto);
    String register(RegisterDto registerDto);
}

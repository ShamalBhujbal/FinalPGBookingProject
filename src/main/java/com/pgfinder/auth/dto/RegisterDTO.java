package com.pgfinder.auth.dto;

import lombok.Data;

@Data
public class RegisterDTO {
    private String fullName;
    private String email;
    private String password;
    private String phone;
    private String role; // Optional, defaults to User if null/empty
}

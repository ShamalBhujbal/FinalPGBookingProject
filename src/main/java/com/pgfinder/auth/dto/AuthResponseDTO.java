package com.pgfinder.auth.dto;

import lombok.Data;
import lombok.AllArgsConstructor;

@Data
@AllArgsConstructor
public class AuthResponseDTO {
    private String token;
    private UserDetailsDTO user;

    @Data
    @AllArgsConstructor
    public static class UserDetailsDTO {
        private Integer userId;
        private String fullName;
        private String email;
        private String phone;
        private String role;
    }
}

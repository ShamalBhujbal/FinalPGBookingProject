package com.pgfinder.auth.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "Users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer userId;

    private String fullName;
    private String email;
    private String passwordHash;
    private String phone;

    // In .NET: public int RoleId { get; set; }
    // We can map this directly or via relationship. Let's do relationship for
    // easier access to RoleName.

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "RoleId", nullable = false)
    private Role role;

    // Helper to set roleId logic if needed, but usually we just set the Role
    // object.
}

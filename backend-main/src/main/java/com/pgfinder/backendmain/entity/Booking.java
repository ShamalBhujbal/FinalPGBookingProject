package com.pgfinder.backendmain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "pg_id", nullable = false)
    private PG pg;

    @Column(nullable = false)
    private String username; // User who booked

    @Column(nullable = false)
    private LocalDateTime bookingDate;

    @Column(nullable = false)
    private String status; // PENDING, CONFIRMED, CANCELLED

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "donor_id")
    private User donor;

    @Column(name = "donor_contribution")
    private Double donorContribution; // Amount paid by donor

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public PG getPg() {
        return pg;
    }
    public void setPg(PG pg) {
        this.pg = pg;
    }
    public String getUsername() {
        return username;
    }
    public void setUsername(String username) {
        this.username = username;
    }
    public LocalDateTime getBookingDate() {
        return bookingDate;
    }
    public void setBookingDate(LocalDateTime bookingDate) {
        this.bookingDate = bookingDate;
    }
    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }
    public User getDonor() {
        return donor;
    }
    public void setDonor(User donor) {
        this.donor = donor;
    }
    public Double getDonorContribution() {
        return donorContribution;
    }
    public void setDonorContribution(Double donorContribution) {
        this.donorContribution = donorContribution;
    }
}

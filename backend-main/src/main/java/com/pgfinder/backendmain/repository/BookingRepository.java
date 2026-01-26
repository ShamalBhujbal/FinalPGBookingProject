package com.pgfinder.backendmain.repository;

import com.pgfinder.backendmain.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUsername(String username);
    List<Booking> findByPgId(Long pgId);
    List<Booking> findByStatus(String status);
    List<Booking> findByDonorUsername(String donorUsername);
}

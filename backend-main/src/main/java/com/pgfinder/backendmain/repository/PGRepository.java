package com.pgfinder.backendmain.repository;

import com.pgfinder.backendmain.entity.PG;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PGRepository extends JpaRepository<PG, Long> {
    List<PG> findByOwnerUsername(String ownerUsername);
}

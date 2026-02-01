package com.pgfinder.backendmain.repository;

import com.pgfinder.backendmain.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByPgId(Long pgId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM Review r WHERE r.pg.id = :pgId")
    void deleteByPgId(Long pgId);
}

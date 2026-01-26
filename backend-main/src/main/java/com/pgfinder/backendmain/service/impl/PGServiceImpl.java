package com.pgfinder.backendmain.service.impl;

import com.pgfinder.backendmain.entity.PG;
import com.pgfinder.backendmain.repository.PGRepository;
import com.pgfinder.backendmain.service.PGService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PGServiceImpl implements PGService {

    private PGRepository pgRepository;
    private com.pgfinder.backendmain.repository.BookingRepository bookingRepository;
    private com.pgfinder.backendmain.repository.ReviewRepository reviewRepository;

    public PGServiceImpl(PGRepository pgRepository, com.pgfinder.backendmain.repository.BookingRepository bookingRepository, com.pgfinder.backendmain.repository.ReviewRepository reviewRepository) {
        this.pgRepository = pgRepository;
        this.bookingRepository = bookingRepository;
        this.reviewRepository = reviewRepository;
    }

    @Override
    public PG createPG(PG pg) {
        return pgRepository.save(pg);
    }

    @Override
    public List<PG> getAllPGs() {
        return pgRepository.findAll();
    }

    @Override
    public List<PG> getPGsByOwner(String ownerUsername) {
        return pgRepository.findByOwnerUsername(ownerUsername);
    }

    @Override
    public PG getPGById(Long id) {
        return pgRepository.findById(id).orElseThrow(() -> new RuntimeException("PG not found with id: " + id));
    }

    @Override
    public PG updatePG(Long id, PG pgDetails) {
        PG pg = pgRepository.findById(id).orElseThrow(() -> new RuntimeException("PG not found with id: " + id));
        
        pg.setName(pgDetails.getName());
        pg.setAddress(pgDetails.getAddress());
        pg.setPrice(pgDetails.getPrice());
        pg.setDescription(pgDetails.getDescription());
        
        if (pgDetails.getImageUrls() != null && !pgDetails.getImageUrls().isEmpty()) {
            pg.setImageUrls(pgDetails.getImageUrls());
        }
        if (pgDetails.getVideoUrl() != null) {
            pg.setVideoUrl(pgDetails.getVideoUrl());
        }
        
        return pgRepository.save(pg);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void deletePG(Long id) {
        // Delete associated bookings
        List<com.pgfinder.backendmain.entity.Booking> bookings = bookingRepository.findByPgId(id);
        bookingRepository.deleteAll(bookings);

        // Delete associated reviews
        List<com.pgfinder.backendmain.entity.Review> reviews = reviewRepository.findByPgId(id);
        reviewRepository.deleteAll(reviews);

        pgRepository.deleteById(id);
    }
}

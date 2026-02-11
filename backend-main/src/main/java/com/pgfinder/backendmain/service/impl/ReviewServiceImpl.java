package com.pgfinder.backendmain.service.impl;

import com.pgfinder.backendmain.entity.PG;
import com.pgfinder.backendmain.entity.Review;
import com.pgfinder.backendmain.repository.PGRepository;
import com.pgfinder.backendmain.repository.ReviewRepository;
import com.pgfinder.backendmain.service.ReviewService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final PGRepository pgRepository;

    public ReviewServiceImpl(ReviewRepository reviewRepository, PGRepository pgRepository) {
        this.reviewRepository = reviewRepository;
        this.pgRepository = pgRepository;
    }

    @Override
    public Review addReview(Long pgId, String username, int rating, String comment) {
        PG pg = pgRepository.findById(pgId)
                .orElseThrow(() -> new RuntimeException("PG not found"));

        Review review = new Review();
        review.setPg(pg);
        review.setUsername(username);
        review.setRating(rating);
        review.setComment(comment);
        review.setCreatedAt(LocalDateTime.now());

        return reviewRepository.save(review);
    }

    @Override
    public List<Review> getReviewsByPg(Long pgId) {
        return reviewRepository.findByPgId(pgId);
    }
}

package com.pgfinder.backendmain.controller;

import com.pgfinder.backendmain.entity.Review;
import com.pgfinder.backendmain.service.ReviewService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping("/{pgId}")
    public ResponseEntity<List<Review>> getReviews(@PathVariable Long pgId) {
        return ResponseEntity.ok(reviewService.getReviewsByPg(pgId));
    }

    @PostMapping("/{pgId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Review> addReview(@PathVariable Long pgId, @RequestBody Map<String, Object> payload) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        int rating = Integer.parseInt(payload.get("rating").toString());
        String comment = (String) payload.get("comment");

        return new ResponseEntity<>(reviewService.addReview(pgId, username, rating, comment), HttpStatus.CREATED);
    }
}

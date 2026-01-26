package com.pgfinder.backendmain.service;

import com.pgfinder.backendmain.entity.Review;
import java.util.List;

public interface ReviewService {
    Review addReview(Long pgId, String username, int rating, String comment);
    List<Review> getReviewsByPg(Long pgId);
}

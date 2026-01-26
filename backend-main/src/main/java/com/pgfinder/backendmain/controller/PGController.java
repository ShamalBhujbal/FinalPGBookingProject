package com.pgfinder.backendmain.controller;

import com.pgfinder.backendmain.entity.PG;
import com.pgfinder.backendmain.service.PGService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pgs")
public class PGController {

    private PGService pgService;
    private com.pgfinder.backendmain.service.FileService fileService;

    @org.springframework.beans.factory.annotation.Autowired
    private org.springframework.web.client.RestTemplate restTemplate;

    public PGController(PGService pgService, com.pgfinder.backendmain.service.FileService fileService) {
        this.pgService = pgService;
        this.fileService = fileService;
    }

    // Public: Payment Proxy
    @PostMapping("/payment/create-order")
    public ResponseEntity<String> createPaymentOrder(@RequestParam int amount) {
        String paymentServiceUrl = "http://localhost:8081/api/payment/create-order?amount=" + amount;
        try {
            String orderId = restTemplate.postForObject(paymentServiceUrl, null, String.class);
            return ResponseEntity.ok(orderId);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error creating payment order: " + e.getMessage());
        }
    }

    // Public: anyone can search
    @GetMapping
    public List<PG> getAllPGs() {
        return pgService.getAllPGs();
    }

    // Public: get details
    @GetMapping("/{id}")
    public ResponseEntity<PG> getPGById(@PathVariable Long id) {
        return ResponseEntity.ok(pgService.getPGById(id));
    }

    // Owner only: Create
    @PreAuthorize("hasRole('OWNER')")
    @PostMapping(consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PG> createPG(
            @RequestParam("name") String name,
            @RequestParam("address") String address,
            @RequestParam("price") Double price,
            @RequestParam("description") String description,
            @RequestParam(value = "gender", required = false, defaultValue = "Co-ed") String gender,
            @RequestParam(value = "images", required = false) java.util.List<org.springframework.web.multipart.MultipartFile> images,
            @RequestParam(value = "video", required = false) org.springframework.web.multipart.MultipartFile video
            ) {
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        PG pg = new PG();
        pg.setName(name);
        pg.setAddress(address);
        pg.setPrice(price);
        pg.setDescription(description);
        pg.setGender(gender);
        pg.setOwnerUsername(username);

        //// Handle Images
        if (images != null && !images.isEmpty()) {
            java.util.List<String> imageUrls = new java.util.ArrayList<>();
            for (org.springframework.web.multipart.MultipartFile img : images) {
                if (!img.isEmpty()) {
                    String fileName = fileService.save(img);
                    imageUrls.add("http://localhost:8080/uploads/" + fileName);
                }
            }
            pg.setImageUrls(imageUrls);
        }

        // Handle Video
        if (video != null && !video.isEmpty()) {
             String videoFileName = fileService.save(video);
             pg.setVideoUrl("http://localhost:8080/uploads/" + videoFileName);
        }
        
        return new ResponseEntity<>(pgService.createPG(pg), HttpStatus.CREATED);
    }
    
    // Owner only: Get My PGs
    @PreAuthorize("hasRole('OWNER')")
    @GetMapping("/my-pgs")
    public List<PG> getMyPGs() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return pgService.getPGsByOwner(username);
    }

    // Owner only: Update
    // Owner only: Update
    @PreAuthorize("hasRole('OWNER')")
    @PutMapping(value = "/{id}", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PG> updatePG(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam("address") String address,
            @RequestParam("price") Double price,
            @RequestParam("description") String description,
            @RequestParam(value = "gender", required = false) String gender,
            @RequestParam(value = "images", required = false) java.util.List<org.springframework.web.multipart.MultipartFile> images,
            @RequestParam(value = "video", required = false) org.springframework.web.multipart.MultipartFile video
    ) {
        // Construct PG object with updated fields
        PG pg = new PG();
        pg.setName(name);
        pg.setAddress(address);
        pg.setPrice(price);
        pg.setDescription(description);
        if(gender != null) pg.setGender(gender);

        // Handle Images
        if (images != null && !images.isEmpty()) {
            java.util.List<String> imageUrls = new java.util.ArrayList<>();
            for (org.springframework.web.multipart.MultipartFile img : images) {
                if (!img.isEmpty()) {
                    String fileName = fileService.save(img);
                    imageUrls.add("http://localhost:8080/uploads/" + fileName);
                }
            }
            pg.setImageUrls(imageUrls);
        }

        // Handle Video
        if (video != null && !video.isEmpty()) {
            String videoFileName = fileService.save(video);
            pg.setVideoUrl("http://localhost:8080/uploads/" + videoFileName);
        }

        return ResponseEntity.ok(pgService.updatePG(id, pg));
    }

    // Owner only: Delete
    @PreAuthorize("hasRole('OWNER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePG(@PathVariable Long id) {
         // In real app, check if current user owns this PG
        pgService.deletePG(id);
        return ResponseEntity.ok("PG deleted successfully");
    }
}

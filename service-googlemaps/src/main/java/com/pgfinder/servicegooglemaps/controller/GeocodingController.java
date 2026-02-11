package com.pgfinder.servicegooglemaps.controller;

import com.google.maps.model.GeocodingResult;
import com.pgfinder.servicegooglemaps.service.GeocodingService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/maps")
public class GeocodingController {

    private GeocodingService geocodingService;

    public GeocodingController(GeocodingService geocodingService) {
        this.geocodingService = geocodingService;
    }

    @GetMapping("/test")
    public String test() {
        return "Service is running! Version: 2.0";
    }

    @GetMapping("/geocode")
    public org.springframework.http.ResponseEntity<?> geocode(@RequestParam String address) {
        System.out.println("DEBUG: Controller received request for address: " + address);
        try {
            GeocodingResult[] results = geocodingService.getCoordinates(address);
            return org.springframework.http.ResponseEntity.ok(results);
        } catch (Exception e) {
            e.printStackTrace();
            return org.springframework.http.ResponseEntity
                .status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error resolving address: " + e.getMessage());
        }
    }
    @GetMapping("/distance")
    public org.springframework.http.ResponseEntity<?> getDistance(
            @RequestParam String origin,
            @RequestParam String destination) {
        System.out.println("DEBUG: Controller received distance request: " + origin + " -> " + destination);
        try {
            com.google.maps.model.DistanceMatrix result = geocodingService.getDistance(origin, destination);
            return org.springframework.http.ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return org.springframework.http.ResponseEntity
                .status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error calculating distance: " + e.getMessage());
        }
    }
}

package com.pgfinder.servicegooglemaps.service;

import com.google.maps.GeoApiContext;
import com.google.maps.GeocodingApi;
import com.google.maps.model.GeocodingResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class GeocodingService {

    @Value("${google.maps.api.key}")
    private String apiKey;

    public GeocodingResult[] getCoordinates(String address) throws Exception {
        System.out.println("DEBUG: Geocoding address: " + address);
        if (apiKey == null || apiKey.isEmpty()) {
             System.err.println("ERROR: API Key is null or empty");
             throw new IllegalStateException("Google Maps API Key not configured");
        }
        System.out.println("DEBUG: Using API Key: " + apiKey.substring(0, 5) + "...");
        
        try {
            GeoApiContext context = new GeoApiContext.Builder()
                    .apiKey(apiKey)
                    .build();
            return GeocodingApi.geocode(context, address).await();
        } catch (Exception e) {
            System.err.println("ERROR: Geocoding failed");
            e.printStackTrace();
            throw e;
        }
    }
    public com.google.maps.model.DistanceMatrix getDistance(String origin, String destination) throws Exception {
        System.out.println("DEBUG: Calculating distance from " + origin + " to " + destination);
         if (apiKey == null || apiKey.isEmpty()) {
             throw new IllegalStateException("Google Maps API Key not configured");
        }
        
        try {
            GeoApiContext context = new GeoApiContext.Builder()
                    .apiKey(apiKey)
                    .build();
            return com.google.maps.DistanceMatrixApi.newRequest(context)
                    .origins(origin)
                    .destinations(destination)
                    .await();
        } catch (Exception e) {
            System.err.println("ERROR: Distance Matrix failed");
            e.printStackTrace();
            throw e;
        }
    }
}

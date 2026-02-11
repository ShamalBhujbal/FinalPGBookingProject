package com.pgfinder.backendmain.config;

import com.pgfinder.backendmain.entity.PG;
import com.pgfinder.backendmain.repository.PGRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final PGRepository pgRepository;

    public DataSeeder(PGRepository pgRepository) {
        this.pgRepository = pgRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (pgRepository.count() == 0) {
            System.out.println("Seeding database with initial PGs...");

            PG pg1 = new PG();
            pg1.setName("Luxury Stay - Hinjewadi");
            pg1.setAddress("Hinjewadi Phase 1, Pune, Maharashtra");
            pg1.setPrice(12000.0);
            pg1.setDescription("Premium PG with all amenities including WiFi, cleaning, and meal services. Close to IT parks.");
            pg1.setOwnerUsername("seed_owner");
            pg1.setGender("Co-ed");
            pg1.setImageUrls(Arrays.asList("https://images.unsplash.com/photo-1522771753033-6a50363d769e?q=80&w=2070&auto=format&fit=crop", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=2080&auto=format&fit=crop"));
            
            PG pg2 = new PG();
            pg2.setName("Cozy Corner - Kothrud");
            pg2.setAddress("Kothrud Depot, Pune, Maharashtra");
            pg2.setPrice(8500.0);
            pg2.setDescription("Affordable and homely PG for students and working professionals. Walking distance from MIT college.");
            pg2.setOwnerUsername("seed_owner");
            pg2.setGender("Girls");
            pg2.setImageUrls(Arrays.asList("https://images.unsplash.com/photo-1596276020587-8044fe049813?q=80&w=2039&auto=format&fit=crop"));

            PG pg3 = new PG();
            pg3.setName("Skyline Towers - Viman Nagar");
            pg3.setAddress("Viman Nagar, Pune, Maharashtra");
            pg3.setPrice(15000.0);
            pg3.setDescription("High-rise apartment share with gym, pool, and 24/7 security. Near Phoenix Mall.");
            pg3.setOwnerUsername("seed_owner");
            pg3.setGender("Boys");
            pg3.setImageUrls(Arrays.asList("https://images.unsplash.com/photo-1505691938895-1758d7bab58d?q=80&w=2070&auto=format&fit=crop"));

            PG pg4 = new PG();
            pg4.setName("Green Valley - Baner");
            pg4.setAddress("Baner Road, Pune, Maharashtra");
            pg4.setPrice(10500.0);
            pg4.setDescription("Spacious PG surrounded by greenery. Includes breakfast and dinner. Easy access to highway.");
            pg4.setOwnerUsername("seed_owner");
            pg4.setGender("Co-ed");
            pg4.setImageUrls(Arrays.asList("https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=2070&auto=format&fit=crop"));

            pgRepository.saveAll(Arrays.asList(pg1, pg2, pg3, pg4));
            System.out.println("Database seeded with 4 PGs.");
        }
    }
}

package com.pgfinder.backendmain.service;

import com.pgfinder.backendmain.entity.PG;
import java.util.List;

public interface PGService {
    PG createPG(PG pg);
    List<PG> getAllPGs();
    List<PG> getPGsByOwner(String ownerUsername);
    PG getPGById(Long id);
    PG updatePG(Long id, PG pgDetails);
    void deletePG(Long id);
}

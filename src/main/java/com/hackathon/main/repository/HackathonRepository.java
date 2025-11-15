package com.hackathon.main.repository;

import com.hackathon.main.model.Hackathon;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HackathonRepository extends MongoRepository<Hackathon, String> {
}

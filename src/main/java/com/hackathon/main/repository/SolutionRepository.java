package com.hackathon.main.repository;

import com.hackathon.main.model.Solution;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SolutionRepository extends MongoRepository<Solution, String> {
}

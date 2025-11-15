package com.hackathon.main.repository;

import com.hackathon.main.model.Solution;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SolutionRepository extends MongoRepository<Solution, String> {
    List<Solution> findByUserId(String user_id);
    List<Solution> findByTaskId(String task_id);
}

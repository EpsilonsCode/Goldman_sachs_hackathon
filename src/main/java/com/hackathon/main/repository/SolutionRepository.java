package com.hackathon.main.repository;

import com.hackathon.main.model.Solution;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SolutionRepository extends MongoRepository<Solution, String> {
    List<Solution> findByUserId(String userId);
    List<Solution> findByTaskId(String taskId);
    List<Solution> findByTaskId(String taskId, Sort sort);
    Optional<Solution> findByUserIdAndTaskId(String userId, String taskId);
}

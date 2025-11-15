package com.hackathon.main.repository;

import com.hackathon.main.model.Solution;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SolutionRepository extends MongoRepository<Solution, String> {
    List<Solution> findByUserId(String user_id);
    List<Solution> findByTaskId(String task_id);
    @Query("{ 'task_id': ?0 }")
    List<Solution> findByTaskId(String task_id, Sort sort);
    @Query("{ 'user_id': ?0, 'task_id': ?1 }")
    Optional<Solution> findByUser_idAndTask_id(String user_id, String task_id);
}

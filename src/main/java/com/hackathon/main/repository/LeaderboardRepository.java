package com.hackathon.main.repository;

import com.hackathon.main.model.LeaderboardEntry;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LeaderboardRepository extends MongoRepository<LeaderboardEntry, String> {
    Optional<LeaderboardEntry> findByUserIdAndTaskId(String userId, String taskId);
    List<LeaderboardEntry> findByTaskId(String taskId, Sort sort);
}

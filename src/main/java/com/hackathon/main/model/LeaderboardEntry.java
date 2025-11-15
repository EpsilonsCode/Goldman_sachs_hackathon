package com.hackathon.main.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "leaderboard")
@Data
@NoArgsConstructor
@CompoundIndex(def = "{'userId': 1, 'taskId': 1}", unique = true)
public class LeaderboardEntry {
    @Id
    private String id;
    private String userId;
    private String taskId;

    private int bestScore;
    private Instant bestScoreTimestamp;

    public LeaderboardEntry(String userId, String taskId, int bestScore, Instant bestScoreTimestamp) {
        this.userId = userId;
        this.taskId = taskId;
        this.bestScore = bestScore;
        this.bestScoreTimestamp = bestScoreTimestamp;
    }
}
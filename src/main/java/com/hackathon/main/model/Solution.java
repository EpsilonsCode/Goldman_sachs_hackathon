package com.hackathon.main.model;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "solutions")
@Getter
@Setter
public class Solution {
    @Id
    private String id;
    @NotNull
    private String userId;
    @NotNull
    private String taskId;
    private int score;
    private Instant submissionTimestamp;

    private TaskFile file;
}

package com.hackathon.main.model;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
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
    private String user_id;
    @NotNull
    private String task_id;
    private int score;
    private Instant submissionTimestamp;
    //TODO: task files
}

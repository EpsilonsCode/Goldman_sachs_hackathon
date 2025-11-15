package com.hackathon.main.dto;

import lombok.Data;

@Data
public class ManualScoreDTO {
    private String userId;
    private String taskId;
    private int newScore;
}
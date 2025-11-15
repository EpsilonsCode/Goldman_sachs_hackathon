package com.hackathon.main.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ManualScoreDTO {
    private String userId;
    private String taskId;
    private int newScore;
}
package com.hackathon.main.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;

@Service
@RequiredArgsConstructor
public class ScoringService {
    private final TaskService taskService;
    public int calculateScore(String taskId, MultipartFile file) {
        // TODO: Zaimplementować logikę walidacji i oceniania
        return (int) (Math.random() * 100);
    }
}
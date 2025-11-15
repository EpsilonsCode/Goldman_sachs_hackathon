package com.hackathon.main.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ScoringService {
    public int calculateScore(String taskId, MultipartFile file) {
        // TODO: Zaimplementować logikę walidacji i oceniania
        return (int) (Math.random() * 100);
    }
}
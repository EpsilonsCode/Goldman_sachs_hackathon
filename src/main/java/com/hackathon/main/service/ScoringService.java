package com.hackathon.main.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;

import java.io.IOException;
import java.util.Base64;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ScoringService {
    private final TaskService taskService;
    public int calculateScore(String taskId, MultipartFile file) throws IOException {
        // TODO: Zaimplementować logikę walidacji i oceniania

        byte[] bytes = Base64.getDecoder().decode(taskService.getTaskById(taskId).getSolutionFile().getDataBase64());

        String taskRightSolution = new String(bytes);;
        String taskSolution = new String(file.getBytes());
        ObjectMapper mapper = new ObjectMapper();

        List<Integer> correct = mapper.readValue(taskRightSolution, List.class);
        List<Integer> submitted = mapper.readValue(taskSolution, List.class);
        double output = rmse(correct, submitted);

        int score = (int) Math.max(0, 100 - output * 10);
        return score;
    }

    private double rmse(List<Integer> a, List<Integer> b) {
        if (a.size() != b.size()) {
            throw new IllegalArgumentException("Arrays must have the same length");
        }

        double sum = 0.0;
        for (int i = 0; i < a.size(); i++) {
            double diff = a.get(i) - b.get(i);
            sum += diff * diff;
        }

        return Math.sqrt(sum / a.size());
    }
}
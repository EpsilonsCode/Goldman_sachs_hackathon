package com.hackathon.main.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hackathon.main.model.Task;
import com.hackathon.main.model.TaskFile;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
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

        TaskFile taskFile = taskService.getTaskById(taskId).getSolutionFile();
        byte[] bytes = Base64.getDecoder().decode(taskFile.getDataBase64());

        String taskRightSolution = new String(bytes);;
        String taskSolution = new String(file.getBytes());
        ObjectMapper mapper = new ObjectMapper();

        List<Integer> correct = fileToList(taskRightSolution, taskFile.getContentType());
        List<Integer> submitted = fileToList(taskSolution, file.getContentType());
        double output = rmse(correct, submitted);

        int score = (int) Math.max(0, 100 - output * 10);
        return score;
    }

    private List<Integer> fileToList(String content, String type) throws JsonProcessingException {

        ObjectMapper mapper = new ObjectMapper();

        // 1. JSON ARRAY → must start with "[" and end with "]"
        if (type != null && type.equals("application/json")) {
            if (!content.startsWith("[") || !content.endsWith("]")) {
                throw new IllegalArgumentException("Invalid JSON array format");
            }

            try {
                return mapper.readValue(content, new TypeReference<List<Integer>>() {});
            } catch (Exception e) {
                throw new IllegalArgumentException("Failed to parse JSON array", e);
            }
        }

        // 2. CSV ARRAY → no brackets, contains commas
        if (type != null && (type.equals("text/csv") || type.equals("text/plain"))) {

            if (!content.contains(",")) {
                throw new IllegalArgumentException("Invalid CSV array format");
            }

            try {
                return Arrays.stream(content.split(","))
                        .map(String::trim)
                        .map(Integer::parseInt)
                        .toList();
            } catch (Exception e) {
                throw new IllegalArgumentException("Failed to parse CSV array", e);
            }
        }

        // 3. ANYTHING ELSE → reject
        throw new IllegalArgumentException("Unsupported file type: " + type);
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
package com.hackathon.main.service;

import com.hackathon.main.model.TaskFile;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

import java.util.Base64;

@Service
@RequiredArgsConstructor
public class ScoringService {
    private final TaskService taskService;

    public int calculateScore(String taskId, MultipartFile file) throws Exception {
        TaskFile taskFile = taskService.getTaskById(taskId).getSolutionFile();
        byte[] bytes = Base64.getDecoder().decode(taskFile.getDataBase64());

        String correctSolution = new String(bytes);
        String submittedSolution = new String(file.getBytes());


        List<Double> correct = fileToList(correctSolution, taskFile.getContentType());
        List<Double> submitted = fileToList(submittedSolution, file.getContentType());
        if(correct.size() != submitted.size())
            throw new Exception();
        double output = rmse(correct, submitted);
        int score = (int) Math.max(0, 100 - output * 3);
        return score;
    }

    private static List<Double> fileToList(String content, String type) throws Exception {



        // 1. JSON ARRAY → must start with "[" and end with "]"
        if (type != null && type.equals("application/json")) {
            if (!content.startsWith("[") || !content.endsWith("]")) {
                throw new IllegalArgumentException("Invalid JSON array format");
            }

            try {
                String inner = content.substring(1, content.length() - 1).trim();

                if (inner.isEmpty()) return List.of();

                String[] parts = inner.split(",");

                List<Double> result = new ArrayList<>();
                for (String part : parts) {
                    result.add(Double.parseDouble(part.trim()));
                }
                return result;
            } catch (Exception e) {
                throw new IllegalArgumentException("Failed to parse JSON array", e);
            }
        }

        // 2. CSV ARRAY → no brackets, contains commas
        if (type != null && (type.equals("text/csv"))) {

            if (!content.contains(",")) {
                throw new IllegalArgumentException("Invalid CSV array format");
            }

            try {
                return Arrays.stream(content.split(","))
                        .map(String::trim)
                        .map(Double::parseDouble)
                        .toList();
            } catch (Exception e) {
                throw new IllegalArgumentException("Failed to parse CSV array", e);
            }
        }

        // 3. ANYTHING ELSE → reject
        throw new IllegalArgumentException("Unsupported file type: " + type);
    }

    private static double rmse(List<Double> a, List<Double> b) {
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
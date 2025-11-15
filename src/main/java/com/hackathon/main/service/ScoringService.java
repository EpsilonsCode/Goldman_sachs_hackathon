package com.hackathon.main.service;

import com.hackathon.main.model.TaskFile;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class ScoringService {
    private final TaskService taskService;

    /**
     * Calculates a score for a submitted solution file for a given task.
     * <p>
     * The method:
     * <ol>
     *     <li>Fetches the correct solution file for the given task ID.</li>
     *     <li>Decodes the correct solution from Base64 to plain text.</li>
     *     <li>Reads the submitted file content as plain text.</li>
     *     <li>Parses both contents into lists of {@link Double} values
     *         (either from JSON array or CSV, depending on content type).</li>
     *     <li>Computes the RMSE (Root Mean Square Error) between both lists.</li>
     *     <li>Transforms the RMSE into a score from 0 to 100, where lower RMSE means higher score.</li>
     * </ol>
     *
     * @param taskId the ID of the task whose solution is being evaluated
     * @param file   the submitted solution file uploaded by the user
     * @return an integer score in the range 0–100
     * @throws Exception if:
     *                   <ul>
     *                       <li>the stored or submitted content cannot be parsed,</li>
     *                       <li>the lists have different sizes,</li>
     *                       <li>or the file types are unsupported.</li>
     *                   </ul>
     */
    public int calculateScore(String taskId, MultipartFile file) throws IOException, IllegalArgumentException {
        TaskFile taskFile = taskService.getTaskById(taskId).getSolutionFile();
        byte[] bytes = Base64.getDecoder().decode(taskFile.getDataBase64());

        String correctSolution = new String(bytes);
        String submittedSolution = new String(file.getBytes());
        System.out.println("Correct src: " + correctSolution);
        System.out.println("Submitted src: " + file.getContentType());
        System.out.println("Correct type: " + taskFile.getContentType());
        System.out.println("Submitted type: " + submittedSolution);
        List<Double> correct = fileToList(correctSolution, taskFile.getContentType());
        List<Double> submitted = fileToList(submittedSolution, file.getContentType());

        if (correct.size() != submitted.size()) {
            throw new IllegalArgumentException("Correct and submitted solution arrays must have the same length");
        }

        double output = rmse(correct, submitted);
        int score = (int) Math.max(0, 100 - output * 3);
        return score;
    }

    /**
     * Parses the textual content of a solution into a list of {@link Double} values,
     * based on the provided content type.
     * <p>
     * Supported formats:
     * <ul>
     *     <li>{@code application/json} → JSON array of numbers, e.g. {@code [1.0, 2.5, 3]}</li>
     *     <li>{@code text/csv} → CSV list of numbers, e.g. {@code 1.0,2.5,3}</li>
     * </ul>
     * For JSON input, the method expects the content to start with {@code '['} and end with {@code ']'}.
     * For CSV input, the method expects at least one comma in the content.
     *
     * @param content the textual content of the solution file
     * @param type    the MIME content type of the file (e.g. {@code application/json}, {@code text/csv})
     * @return a list of {@link Double} values parsed from the content
     * @throws IllegalArgumentException if the format is invalid or the type is unsupported
     */
    private static List<Double> fileToList(String content, String type) throws IllegalArgumentException {

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

    /**
     * Calculates the Root Mean Square Error (RMSE) between two numeric sequences.
     * <p>
     * RMSE is defined as:
     * <pre>
     *   RMSE = sqrt( (1/n) * Σ (a_i - b_i)^2 )
     * </pre>
     * where {@code a_i} and {@code b_i} are corresponding elements of the input lists.
     *
     * @param a the first list of numeric values (e.g. correct solution)
     * @param b the second list of numeric values (e.g. submitted solution)
     * @return the RMSE value as a {@code double}
     * @throws IllegalArgumentException if the lists have different lengths
     */
    private static double rmse(List<Double> a, List<Double> b) throws IllegalArgumentException {
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

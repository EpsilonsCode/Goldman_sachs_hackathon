package com.hackathon.main.service;

import com.hackathon.main.dto.ManualScoreDTO; // <-- IMPORT ADDED
import com.hackathon.main.model.LeaderboardEntry;
import com.hackathon.main.model.Solution;
import com.hackathon.main.model.TaskFile;
import com.hackathon.main.repository.LeaderboardRepository;
import com.hackathon.main.repository.SolutionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SolutionService {

    private final SolutionRepository solutionRepository;
    private final LeaderboardRepository leaderboardRepository;
    private final ScoringService scoringService;

    @Transactional
    public Solution submitSolution(String userId, String taskId, MultipartFile file) throws IOException {

        TaskFile taskFile = processFile(file);

        int newScore = scoringService.calculateScore(taskId, file);
        Instant newTimestamp = Instant.now();

        Solution newLogEntry = new Solution();
        newLogEntry.setUserId(userId);
        newLogEntry.setTaskId(taskId);
        newLogEntry.setScore(newScore);
        newLogEntry.setSubmissionTimestamp(newTimestamp);
        newLogEntry.setFile(taskFile);
        solutionRepository.save(newLogEntry);

        updateLeaderboard(userId, taskId, newScore, newTimestamp);

        return newLogEntry;
    }

    private void updateLeaderboard(String userId, String taskId, int newScore, Instant newTimestamp) {

        Optional<LeaderboardEntry> entryOpt = leaderboardRepository.findByUserIdAndTaskId(userId, taskId);

        if (entryOpt.isEmpty()) {
            LeaderboardEntry newBest = new LeaderboardEntry(userId, taskId, newScore, newTimestamp);
            leaderboardRepository.save(newBest);
        } else {
            LeaderboardEntry existingBest = entryOpt.get();

            boolean isNewScoreBetter = newScore > existingBest.getBestScore();
            boolean isTieAndFaster = (newScore == existingBest.getBestScore()) &&
                    (newTimestamp.isBefore(existingBest.getBestScoreTimestamp()));

            if (isNewScoreBetter || isTieAndFaster) {
                existingBest.setBestScore(newScore);
                existingBest.setBestScoreTimestamp(newTimestamp);
                leaderboardRepository.save(existingBest);
            }
        }
    }

    @Transactional
    // --- MODIFIED METHOD ---
    public LeaderboardEntry manualUpdateScore(ManualScoreDTO scoreDTO) {

        // 1. Find and update the specific Solution object
        Solution solution = solutionRepository.findById(scoreDTO.getSolutionId())
                .orElseThrow(() -> new RuntimeException("Solution not found with id: " + scoreDTO.getSolutionId()));

        solution.setScore(scoreDTO.getNewScore());
        solutionRepository.save(solution);

        // 2. Call the existing leaderboard logic to update the best score if needed
        //    We use the solution's original timestamp for fair tie-breaking
        updateLeaderboard(
                scoreDTO.getUserId(),
                scoreDTO.getTaskId(),
                scoreDTO.getNewScore(),
                solution.getSubmissionTimestamp()
        );

        // 3. Return the updated leaderboard entry
        return leaderboardRepository.findByUserIdAndTaskId(scoreDTO.getUserId(), scoreDTO.getTaskId())
                .orElseThrow(() -> new RuntimeException("Leaderboard entry not found after update."));
    }
    // --- END MODIFICATION ---

    public List<LeaderboardEntry> getLeaderboardForTask(String taskId) {
        Sort sort = Sort.by(
                Sort.Order.desc("bestScore"),
                Sort.Order.asc("bestScoreTimestamp")
        );

        return leaderboardRepository.findByTaskId(taskId, sort);
    }

    private TaskFile processFile(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Error: No file submitted!");
        }
        TaskFile tf = new TaskFile();
        tf.setFileName(file.getOriginalFilename());
        tf.setContentType(file.getContentType());
        String base64 = Base64.getEncoder().encodeToString(file.getBytes());
        tf.setDataBase64(base64);
        return tf;
    }

    public void deleteSolution(String id) {
        if (!solutionRepository.existsById(id)) {
            throw new RuntimeException("Error: Solution not found with id: " + id);
        }
        solutionRepository.deleteById(id);
    }

    public List<Solution> getAllSolutions() {
        return solutionRepository.findAll();
    }

    public List<Solution> getSolutionsForUser(String userId) {
        return solutionRepository.findByUserId(userId);
    }

    public List<Solution> getSolutionsForTask(String taskId) {
        return solutionRepository.findByTaskId(taskId);
    }
    public Map<String, List<Solution>> getGroupedSolutionsForUser(String userId) {
        List<Solution> allUserSolutions = solutionRepository.findByUserId(userId);
        allUserSolutions.sort(Comparator.comparing(Solution::getSubmissionTimestamp).reversed());
        return allUserSolutions.stream()
                .collect(Collectors.groupingBy(Solution::getTaskId));
    }
}
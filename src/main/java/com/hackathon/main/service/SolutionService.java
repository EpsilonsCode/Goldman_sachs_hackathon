package com.hackathon.main.service;

import com.hackathon.main.dto.ManualScoreDTO;
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

    /**
     * Submits a new solution for a given user and task, computes its score,
     * persists the solution and updates the leaderboard accordingly.
     * <p>
     * Workflow:
     * <ol>
     *     <li>Validates and processes the uploaded file into a {@link TaskFile}.</li>
     *     <li>Calculates a score using {@link ScoringService#calculateScore(String, MultipartFile)}.</li>
     *     <li>Creates and saves a new {@link Solution} containing user, task, score, timestamp and file.</li>
     *     <li>Updates the corresponding {@link LeaderboardEntry} using {@link #updateLeaderboard(String, String, int, Instant)}.</li>
     * </ol>
     *
     * @param userId the ID of the user submitting the solution
     * @param taskId the ID of the task the solution belongs to
     * @param file   the uploaded solution file
     * @return the persisted {@link Solution} entity
     * @throws IOException if reading the file bytes fails
     * @throws RuntimeException if the file is null/empty or scoring fails internally
     */
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

    /**
     * Updates or creates a leaderboard entry for a given user and task based on a new score.
     * <p>
     * Rules:
     * <ul>
     *     <li>If no entry exists for (userId, taskId), a new one is created with the given score and timestamp.</li>
     *     <li>If an entry exists, the stored score is updated only if:
     *         <ul>
     *             <li>the new score is strictly higher, or</li>
     *             <li>the new score is equal but the new timestamp is earlier (tie-breaker by time).</li>
     *         </ul>
     *     </li>
     * </ul>
     *
     * @param userId      the ID of the user whose leaderboard entry is affected
     * @param taskId      the ID of the task for which the leaderboard is maintained
     * @param newScore    the newly obtained score
     * @param newTimestamp the timestamp of the solution that produced the new score
     */
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

    /**
     * Manually overrides the score of a specific solution and updates the leaderboard accordingly.
     * <p>
     * This method is intended for admin or jury tools where manual correction or override
     * of an automatically calculated score is needed.
     * <p>
     * Workflow:
     * <ol>
     *     <li>Fetches the {@link Solution} by ID from {@link ManualScoreDTO}.</li>
     *     <li>Updates its score to the new value.</li>
     *     <li>Persists the modified solution.</li>
     *     <li>Calls {@link #updateLeaderboard(String, String, int, Instant)} with the solution's
     *         user, task and original submission timestamp.</li>
     *     <li>Returns the updated {@link LeaderboardEntry} for that user and task.</li>
     * </ol>
     *
     * @param scoreDTO data transfer object containing solution ID, user ID, task ID and new score
     * @return the updated {@link LeaderboardEntry} reflecting the new best score if applicable
     * @throws RuntimeException if the solution or leaderboard entry cannot be found
     */
    @Transactional
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

    /**
     * Returns the leaderboard entries for a given task, ordered by:
     * <ol>
     *     <li>bestScore in descending order (higher scores first)</li>
     *     <li>bestScoreTimestamp in ascending order (earlier submissions first in case of ties)</li>
     * </ol>
     *
     * @param taskId the ID of the task for which the leaderboard is requested
     * @return a sorted list of {@link LeaderboardEntry} for the given task
     */
    public List<LeaderboardEntry> getLeaderboardForTask(String taskId) {
        Sort sort = Sort.by(
                Sort.Order.desc("bestScore"),
                Sort.Order.asc("bestScoreTimestamp")
        );

        return leaderboardRepository.findByTaskId(taskId, sort);
    }

    /**
     * Converts and validates an uploaded solution file into a {@link TaskFile} entity,
     * encoding its content as Base64.
     * <p>
     * The method ensures that the file is neither {@code null} nor empty, then extracts:
     * <ul>
     *     <li>original filename</li>
     *     <li>content type</li>
     *     <li>raw bytes (encoded to Base64)</li>
     * </ul>
     *
     * @param file the uploaded {@link MultipartFile} to be processed
     * @return a populated {@link TaskFile} instance ready to be attached to a {@link Solution}
     * @throws IOException      if reading file bytes fails
     * @throws RuntimeException if the file is {@code null} or empty
     */
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

    /**
     * Deletes a solution by its identifier.
     *
     * @param id the ID of the solution to delete
     * @throws RuntimeException if the solution does not exist
     */
    public void deleteSolution(String id) {
        if (!solutionRepository.existsById(id)) {
            throw new RuntimeException("Error: Solution not found with id: " + id);
        }
        solutionRepository.deleteById(id);
    }

    /**
     * Retrieves all solutions stored in the repository.
     *
     * @return a list of all {@link Solution} entities
     */
    public List<Solution> getAllSolutions() {
        return solutionRepository.findAll();
    }

    /**
     * Retrieves all solutions submitted by a specific user.
     *
     * @param userId the ID of the user whose solutions are requested
     * @return a list of {@link Solution} entities submitted by the given user
     */
    public List<Solution> getSolutionsForUser(String userId) {
        return solutionRepository.findByUserId(userId);
    }

    /**
     * Retrieves all solutions submitted for a specific task.
     *
     * @param taskId the ID of the task whose solutions are requested
     * @return a list of {@link Solution} entities associated with the given task
     */
    public List<Solution> getSolutionsForTask(String taskId) {
        return solutionRepository.findByTaskId(taskId);
    }

    /**
     * Retrieves all solutions for a given user and groups them by task ID.
     * <p>
     * The resulting map has:
     * <ul>
     *     <li>key: taskId</li>
     *     <li>value: list of {@link Solution} objects for that task, sorted by submission time descending
     *     (newest submissions first).</li>
     * </ul>
     *
     * @param userId the ID of the user whose grouped solutions are requested
     * @return a map from task ID to list of solutions for that task
     */
    public Map<String, List<Solution>> getGroupedSolutionsForUser(String userId) {
        List<Solution> allUserSolutions = solutionRepository.findByUserId(userId);
        allUserSolutions.sort(Comparator.comparing(Solution::getSubmissionTimestamp).reversed());
        return allUserSolutions.stream()
                .collect(Collectors.groupingBy(Solution::getTaskId));
    }
}

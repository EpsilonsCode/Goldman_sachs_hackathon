package com.hackathon.main.controller;

import com.hackathon.main.model.LeaderboardEntry; // ZMIANA
import com.hackathon.main.model.Solution;
import com.hackathon.main.service.SolutionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SolutionController {

    private final SolutionService solutionService;

    /**
     * Endpoint: POST /api/solutions/submit
     * Zgodnie z nową logiką, ta metoda przyjmuje plik,
     * zapisuje log 'Solution' ORAZ aktualizuje 'LeaderboardEntry'.
     */
    @PostMapping(value = "/solutions/submit", consumes = {"multipart/form-data"})
    public ResponseEntity<Solution> submitSolution(
            @RequestParam("userId") String userId,
            @RequestParam("taskId") String taskId,
            @RequestPart("file") MultipartFile file) {

        try {
            // Serwis oceni plik, zapisze log i zaktualizuje leaderboard
            Solution newSolutionLog = solutionService.submitSolution(userId, taskId, file);
            return ResponseEntity.status(HttpStatus.CREATED).body(newSolutionLog);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (RuntimeException e) {
            // Dodana obsługa błędu, np. "No file submitted!"
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    /**
     * Endpoint: GET /api/leaderboard/{taskId}
     * ZMIANA: Zwraca teraz List<LeaderboardEntry>
     * Jest teraz błyskawiczny (czyta z kolekcji 'leaderboard').
     */
    @GetMapping("/leaderboard/{taskId}")
    public ResponseEntity<List<LeaderboardEntry>> getLeaderboard(@PathVariable String taskId) {
        List<LeaderboardEntry> leaderboard = solutionService.getLeaderboardForTask(taskId);
        return ResponseEntity.ok(leaderboard);
    }

    /**
     * Endpoint: GET /api/solutions/task/{taskId}
     * Zwraca *całą historię* (log) dla danego zadania (dla admina).
     */
    @GetMapping("/solutions/task/{taskId}")
    public ResponseEntity<List<Solution>> getSolutionsForTask(@PathVariable String taskId) {
        List<Solution> solutions = solutionService.getSolutionsForTask(taskId);
        return ResponseEntity.ok(solutions);
    }

    /**
     * Endpoint: GET /api/solutions/user/{userId}
     * Zwraca *całą historię* (log) dla danego użytkownika.
     */
    @GetMapping("/solutions/user/{userId}")
    public ResponseEntity<List<Solution>> getSolutionsForUser(@PathVariable String userId) {
        List<Solution> solutions = solutionService.getSolutionsForUser(userId);
        return ResponseEntity.ok(solutions);
    }

    /**
     * Endpoint: GET /api/solutions
     * Pobiera *całą historię* (log) (dla admina).
     */
    @GetMapping("/solutions")
    public List<Solution> getAllSolutions() {
        return solutionService.getAllSolutions();
    }

    /**
     * Endpoint: DELETE /api/solutions/{id}
     * Usuwa konkretny wpis z logu.
     */
    @DeleteMapping("/solutions/{id}")
    public ResponseEntity<Void> deleteSolution(@PathVariable String id) {
        try {
            solutionService.deleteSolution(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
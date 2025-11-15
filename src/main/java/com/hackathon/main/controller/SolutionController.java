package com.hackathon.main.controller;

import com.hackathon.main.dto.CreateUserDto;
import com.hackathon.main.model.Solution;
import com.hackathon.main.model.User;
import com.hackathon.main.service.SolutionService;
import com.hackathon.main.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/solutions")
public class SolutionController {
    private final SolutionService solutionService;

    public SolutionController(SolutionService solutionService) {
        this.solutionService = solutionService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Solution> submitSolution(
            @RequestParam("userId") String userId,
            @RequestParam("taskId") String taskId,
            @RequestPart("files") List<MultipartFile> files) {

        try {
            Solution savedSolution = solutionService.submitSolution(userId, taskId, files);
            return ResponseEntity.ok(savedSolution);
        } catch (IOException e) {
            // Błąd podczas przetwarzania plików
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (RuntimeException e) {
            // Np. "No file submitted!" z serwisu
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @GetMapping()
    public List<Solution> getAllSolutions() {
        return solutionService.getAllSolutions();
    }

    @GetMapping("/leaderboard/{taskId}")
    public ResponseEntity<List<Solution>> getLeaderboard(@PathVariable String taskId) {
        List<Solution> leaderboard = solutionService.getLeaderboardForTask(taskId);
        return ResponseEntity.ok(leaderboard);
    }

    @DeleteMapping("/solutions/{id}")
    public ResponseEntity<Void> deleteSolution(@PathVariable String id) {
        try {
            solutionService.deleteSolution(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/solutions/task/{taskId}")
    public ResponseEntity<List<Solution>> getSolutionsForTask(@PathVariable String taskId) {
        List<Solution> solutions = solutionService.getSolutionsForTask(taskId);
        return ResponseEntity.ok(solutions);
    }

    @GetMapping("/solutions/user/{userId}")
    public ResponseEntity<List<Solution>> getSolutionsForUser(@PathVariable String userId) {
        List<Solution> solutions = solutionService.getSolutionsForUser(userId);
        return ResponseEntity.ok(solutions);
    }


}

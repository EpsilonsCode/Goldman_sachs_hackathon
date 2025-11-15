package com.hackathon.main.controller;

import com.hackathon.main.model.Solution;
import com.hackathon.main.model.User;
import com.hackathon.main.service.SolutionService;
import com.hackathon.main.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/solutions")
public class SolutionController {
    private final SolutionService solutionService;

    public SolutionController(SolutionService solutionService) {
        this.solutionService = solutionService;
    }
    //TODO: post solution

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

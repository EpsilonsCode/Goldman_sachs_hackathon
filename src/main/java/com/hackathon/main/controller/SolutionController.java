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

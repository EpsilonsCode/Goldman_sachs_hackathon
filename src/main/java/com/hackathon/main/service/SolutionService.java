package com.hackathon.main.service;

import com.hackathon.main.model.Solution;
import com.hackathon.main.repository.SolutionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SolutionService {
    private final SolutionRepository solutionRepository;
    //TODO: submitSolution()

    public List<Solution> getLeaderboardForTask(String taskId) {
        Sort sort = Sort.by(
                Sort.Order.desc("score"),
                Sort.Order.asc("submissionTimestamp")
        );
        return solutionRepository.findByTaskId(taskId, sort);
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


}

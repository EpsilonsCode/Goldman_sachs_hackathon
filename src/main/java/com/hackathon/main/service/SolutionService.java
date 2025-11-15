package com.hackathon.main.service;

import com.hackathon.main.model.Solution;
import com.hackathon.main.model.TaskFile;
import com.hackathon.main.repository.SolutionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
public class SolutionService {
    private final SolutionRepository solutionRepository;

    public Solution submitSolution(String userId, String taskId, List<MultipartFile> files) throws IOException {
        if (files == null || files.isEmpty() || files.get(0).isEmpty()) {
            throw new RuntimeException("Error: No file submitted!");
        }

        List<TaskFile> solutionFiles = new ArrayList<>();
        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;

            TaskFile tf = new TaskFile();
            tf.setFileName(file.getOriginalFilename());
            tf.setContentType(file.getContentType());

            String base64 = Base64.getEncoder()
                    .encodeToString(file.getBytes());
            tf.setDataBase64(base64);

            solutionFiles.add(tf);
        }
        //TODO: scoring system
        int newScore = (int) (Math.random() * 100);
        Instant newTimestamp = Instant.now();

        Optional<Solution> existingSolutionOpt = solutionRepository.findByUserIdAndTaskId(userId, taskId);

        if (existingSolutionOpt.isEmpty()) {
            Solution solutionToSave = new Solution();
            solutionToSave.setUser_id(userId);
            solutionToSave.setTask_id(taskId);
            solutionToSave.setScore(newScore);
            solutionToSave.setSubmissionTimestamp(newTimestamp);
            solutionToSave.setFiles(solutionFiles);

            return solutionRepository.save(solutionToSave);
        } else {
            Solution existingSolution = existingSolutionOpt.get();

            if (newScore > existingSolution.getScore()) {
                existingSolution.setScore(newScore);
                existingSolution.setSubmissionTimestamp(newTimestamp);
                existingSolution.setFiles(solutionFiles);

                return solutionRepository.save(existingSolution);
            }
            return existingSolution;
        }
    }

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

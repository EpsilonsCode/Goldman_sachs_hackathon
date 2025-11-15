package com.hackathon.main.service;

import com.hackathon.main.model.Task;
import com.hackathon.main.model.TaskFile;
import com.hackathon.main.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {
    private final TaskRepository taskRepository;

    /**
     * Persists a new {@link Task} entity in the repository.
     *
     * @param task the task to add
     * @return the saved {@link Task} entity
     */
    public Task addTask(Task task) {
        return taskRepository.save(task);
    }

    /**
     * Adds a new task along with associated files.
     *
     * @param task  the task entity to save
     * @param files the list of uploaded files to attach
     * @return the saved {@link Task} with files
     * @throws IOException if reading file bytes fails
     */
    public Task addTaskWithFiles(Task task, List<MultipartFile> files) throws IOException {
        List<TaskFile> taskFiles = new ArrayList<>();

        if (files != null) {
            for (MultipartFile file : files) {
                if (file.isEmpty()) continue;

                TaskFile tf = new TaskFile();
                tf.setFileName(file.getOriginalFilename());
                tf.setContentType(file.getContentType());

                String base64 = Base64.getEncoder().encodeToString(file.getBytes());
                tf.setDataBase64(base64);

                taskFiles.add(tf);
            }
        }

        task.setFiles(taskFiles);

        return taskRepository.save(task);
    }

    /**
     * Retrieves a task by its ID.
     *
     * @param taskId the ID of the task to retrieve
     * @return the {@link Task} entity
     * @throws RuntimeException if the task does not exist
     */
    public Task getTaskById(String taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
    }

    /**
     * Adds multiple files to an existing task.
     *
     * @param taskId the ID of the task
     * @param files  the list of files to add
     * @return the updated {@link Task} entity
     * @throws IOException if reading file bytes fails
     */
    public Task addFilesToTask(String taskId, List<MultipartFile> files) throws IOException {
        Task task = getTaskById(taskId);

        if (files != null) {
            for (MultipartFile file : files) {
                if (file.isEmpty()) continue;

                TaskFile tf = new TaskFile();
                tf.setFileName(file.getOriginalFilename());
                tf.setContentType(file.getContentType());
                String base64 = Base64.getEncoder().encodeToString(file.getBytes());
                tf.setDataBase64(base64);

                task.getFiles().add(tf);
            }
        }

        return taskRepository.save(task);
    }

    /**
     * Processes a single {@link MultipartFile} and converts it into a {@link TaskFile} with Base64 content.
     *
     * @param file the file to process
     * @return the resulting {@link TaskFile}
     * @throws IOException      if reading file bytes fails
     * @throws RuntimeException if the file is null or empty
     */
    private TaskFile processSingleFile(MultipartFile file) throws IOException {
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
     * Sets the solution file for a specific task.
     *
     * @param taskId the ID of the task
     * @param file   the solution file to attach
     * @return the updated {@link Task} entity
     * @throws IOException if reading file bytes fails
     */
    public Task addSolutionFileToTask(String taskId, MultipartFile file) throws IOException {
        Task task = getTaskById(taskId);
        TaskFile solutionFile = processSingleFile(file);
        task.setSolutionFile(solutionFile);
        return taskRepository.save(task);
    }

    /**
     * Updates basic details of a task, such as name and description.
     *
     * @param taskId      the ID of the task to update
     * @param taskDetails the updated task data
     * @return the updated {@link Task} entity
     */
    public Task updateTaskDetails(String taskId, Task taskDetails) {
        Task existingTask = getTaskById(taskId);
        existingTask.setName(taskDetails.getName());
        existingTask.setDescription(taskDetails.getDescription());
        return taskRepository.save(existingTask);
    }

    /**
     * Removes a file from a task by its index.
     *
     * @param taskId the ID of the task
     * @param index  the index of the file to remove
     * @return the updated {@link Task} entity
     * @throws IllegalArgumentException if the index is invalid
     */
    public Task removeFileFromTask(String taskId, int index) {
        Task task = getTaskById(taskId);

        if (index < 0 || index >= task.getFiles().size()) {
            throw new IllegalArgumentException("Invalid file index");
        }

        task.getFiles().remove(index);
        return taskRepository.save(task);
    }

    /**
     * Deletes a task by its ID.
     *
     * @param taskId the ID of the task to delete
     * @throws RuntimeException if the task does not exist
     */
    public void deleteTask(String taskId) {
        if (!taskRepository.existsById(taskId)) {
            throw new RuntimeException("Task not found");
        }
        taskRepository.deleteById(taskId);
    }

    /**
     * Retrieves all tasks from the repository.
     *
     * @return a list of all {@link Task} entities
     */
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }
}

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

    public Task addTask(Task task) {return taskRepository.save(task);}

    public Task addTaskWithFiles(Task task, List<MultipartFile> files) throws IOException {
        List<TaskFile> taskFiles = new ArrayList<>();

        if (files != null) {
            for (MultipartFile file : files) {
                if (file.isEmpty()) continue;

                TaskFile tf = new TaskFile();
                tf.setFileName(file.getOriginalFilename());
                tf.setContentType(file.getContentType());

                String base64 = Base64.getEncoder()
                        .encodeToString(file.getBytes());
                tf.setDataBase64(base64);

                taskFiles.add(tf);
            }
        }

        task.setFiles(taskFiles);

        return taskRepository.save(task);
    }

    public Task getTaskById(String taskId){
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
    }


    public Task addFilesToTask(String taskId, List<MultipartFile> files) throws IOException {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        if (files != null) {
            for (MultipartFile file : files) {
                if (file.isEmpty()) continue;

                TaskFile tf = new TaskFile();
                tf.setFileName(file.getOriginalFilename());
                tf.setContentType(file.getContentType());

                String base64 = Base64.getEncoder()
                        .encodeToString(file.getBytes());
                tf.setDataBase64(base64);

                // dopisujemy do istniejącej listy
                task.getFiles().add(tf);
            }
        }

        return taskRepository.save(task);
    }

    public Task removeFileFromTask(String taskId, int index) {
        Task task = getTaskById(taskId);

        if (index < 0 || index >= task.getFiles().size()) {
            throw new IllegalArgumentException("Invalid file index");
        }

        task.getFiles().remove(index);
        return taskRepository.save(task);
    }

    public void deleteTask(String taskId) {
        if (!taskRepository.existsById(taskId)) {
            throw new RuntimeException("Task not found");
        }
        taskRepository.deleteById(taskId);
    }

    public List<Task> getAllTasks() {return taskRepository.findAll();}

}

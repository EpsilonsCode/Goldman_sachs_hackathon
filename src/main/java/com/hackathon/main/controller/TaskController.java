package com.hackathon.main.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hackathon.main.model.Task;
import com.hackathon.main.model.TaskFile;
import com.hackathon.main.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {
    private final TaskService taskService;

    public TaskController(TaskService taskService){this.taskService = taskService;}

    // JSON; add task without files -> in json "files": []
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Task> createTask(@RequestBody Task task){
        Task savedTask = taskService.addTask(task);
        return ResponseEntity.ok(savedTask);
    }
/*
    // multipart/form-data
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Task> createTaskWithFiles(
            @RequestPart("task") Task task,
            @RequestPart(value = "files", required = false) List<MultipartFile> files
    ) throws IOException {
        Task savedTask = taskService.addTaskWithFiles(task, files);
        return ResponseEntity.ok(savedTask);
    }*/

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Task> createTaskWithFiles(
            @RequestPart("task") String taskJson,
            @RequestPart(value = "files", required = false) List<MultipartFile> files
    ) throws IOException {

        ObjectMapper objectMapper = new ObjectMapper();
        Task task = objectMapper.readValue(taskJson, Task.class);

        Task savedTask = taskService.addTaskWithFiles(task, files);
        return ResponseEntity.ok(savedTask);
    }



    @GetMapping()
    public ResponseEntity<List<Task>> getAllTasks() {
        return ResponseEntity.ok(taskService.getAllTasks());
    }

    @GetMapping("/{taskId}")
    public ResponseEntity<Task> getTaskById(@PathVariable String taskId){
        Task task = taskService.getTaskById(taskId);
        return ResponseEntity.ok(task);
    }
    @GetMapping("/{taskId}/files/{index}")
    public ResponseEntity<byte[]> downloadFile(
            @PathVariable String taskId,
            @PathVariable int index
    ){
        Task task = taskService.getTaskById(taskId);

        if (index < 0 || index >= task.getFiles().size()) {
            return ResponseEntity.notFound().build();
        }

        TaskFile file = task.getFiles().get(index);

        byte[] fileBytes = java.util.Base64.getDecoder().decode(file.getDataBase64());

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=\"" + file.getFileName() + "\"")
                .header("Content-Type", file.getContentType())
                .body(fileBytes);
    }

    //adding file to task
    @PutMapping(
            value = "/{taskId}/files",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<Task> addFilesToTask(
            @PathVariable String taskId,
            @RequestPart("files") List<MultipartFile> files
    ) throws IOException {

        Task updated = taskService.addFilesToTask(taskId, files);
        return ResponseEntity.ok(updated);
    }

    //removing file from task
    @PutMapping("/{taskId}/files/{index}/remove")
    public ResponseEntity<Task> removeFileFromTask(
            @PathVariable String taskId,
            @PathVariable int index
    ) {
        Task updated = taskService.removeFileFromTask(taskId, index);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable String taskId) {
        taskService.deleteTask(taskId);
        return ResponseEntity.noContent().build();
    }

}

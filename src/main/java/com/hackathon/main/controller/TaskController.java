package com.hackathon.main.controller;

import com.hackathon.main.model.Task;
import com.hackathon.main.model.TaskFile;
import com.hackathon.main.model.User;
import com.hackathon.main.service.TaskService;
import com.hackathon.main.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {
    private final TaskService taskService;

    public TaskController(TaskService taskService){this.taskService = taskService;}

    @PostMapping()
    public ResponseEntity<Task> createTask(@RequestBody Task task){
        Task savedTask = taskService.addTask(task);
        return ResponseEntity.ok(savedTask);
    }
}

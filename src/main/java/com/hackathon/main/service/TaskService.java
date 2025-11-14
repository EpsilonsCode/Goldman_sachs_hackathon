package com.hackathon.main.service;

import com.hackathon.main.model.Task;
import com.hackathon.main.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {
    private final TaskRepository taskRepository;

    public Task addTask(Task task) {return taskRepository.save(task);}

    public List<Task> getAllTasks() {return taskRepository.findAll();}
}

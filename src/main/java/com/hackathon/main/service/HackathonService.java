package com.hackathon.main.service;

import com.hackathon.main.model.Hackathon;
import com.hackathon.main.model.Task;
import com.hackathon.main.model.User;
import com.hackathon.main.repository.HackathonRepository;
import com.hackathon.main.repository.TaskRepository;
import com.hackathon.main.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HackathonService {
    private final HackathonRepository hackathonRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;


    public Hackathon addHackathon(Hackathon hackathon) {
        return hackathonRepository.save(hackathon);
    }
    public List<Hackathon> getAllHackathons() {
        return hackathonRepository.findAll();
    }
    public Hackathon getHackathonById(String hackId) {
        return hackathonRepository.findById(hackId)
                .orElseThrow(() -> new RuntimeException("Hackathon not found with id: " + hackId));
    }
    public void deleteHackathon(String hackId) {
        if (!hackathonRepository.existsById(hackId)) {
            throw new RuntimeException("Hackathon not found with id: " + hackId);
        }
        hackathonRepository.deleteById(hackId);
    }

    // --- FIX IS HERE ---
    public Hackathon addTaskToHackathon(String hackId, String taskId) {
        Hackathon hackathon = hackathonRepository.findById(hackId)
                .orElseThrow(() -> new RuntimeException("Hackathon not found"));
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        if (hackathon.getTasks() == null) { // <-- FIXED: Renamed to getTasks()
            hackathon.setTasks(new ArrayList<>());
        }

        if (!hackathon.getTasks().contains(taskId)) { // <-- FIXED: Renamed to getTasks()
            hackathon.getTasks().add(taskId); // <-- FIXED: Renamed to getTasks()
            return hackathonRepository.save(hackathon); // <-- This save is ESSENTIAL
        }
        return hackathon;
    }

    // --- AND FIX IS HERE ---
    public Hackathon addUserToHackathon(String hackId, String userId) {
        Hackathon hackathon = hackathonRepository.findById(hackId)
                .orElseThrow(() -> new RuntimeException("Hackathon not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (hackathon.getUsers() == null) { // <-- FIXED: Renamed to getUsers()
            hackathon.setUsers(new ArrayList<>());
        }

        if (!hackathon.getUsers().contains(userId)) { // <-- FIXED: Renamed to getUsers()
            hackathon.getUsers().add(userId); // <-- FIXED: Renamed to getUsers()
            return hackathonRepository.save(hackathon); // <-- This save is ESSENTIAL
        }
        return hackathon;
    }

    public Hackathon removeTaskFromHackathon(String hackId, String taskId) {
        Hackathon hackathon = hackathonRepository.findById(hackId)
                .orElseThrow(() -> new RuntimeException("Hackathon not found"));

        if (hackathon.getTasks() != null) { // <-- FIXED: Renamed to getTasks()
            hackathon.getTasks().remove(taskId); // <-- FIXED: Renamed to getTasks()
            return hackathonRepository.save(hackathon);
        }
        return hackathon;
    }

    public Hackathon removeUserFromHackathon(String hackId, String userId) {
        Hackathon hackathon = hackathonRepository.findById(hackId)
                .orElseThrow(() -> new RuntimeException("Hackathon not found"));

        if (hackathon.getUsers() != null) { // <-- FIXED: Renamed to getUsers()
            hackathon.getUsers().remove(userId); // <-- FIXED: Renamed to getUsers()
            return hackathonRepository.save(hackathon);
        }
        return hackathon;
    }

    public Hackathon updateHackathon(String hackId, Hackathon updatedHackathon) {
        Hackathon existingHackathon = hackathonRepository.findById(hackId)
                .orElseThrow(() -> new RuntimeException("Hackathon not found"));

        existingHackathon.setName(updatedHackathon.getName());
        existingHackathon.setDescription(updatedHackathon.getDescription());
        // Do not update tasks or users here, that's handled by other endpoints

        return hackathonRepository.save(existingHackathon);
    }
}
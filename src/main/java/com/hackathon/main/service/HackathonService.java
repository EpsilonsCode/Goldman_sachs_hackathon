package com.hackathon.main.service;

import com.hackathon.main.model.Hackathon;
import com.hackathon.main.repository.HackathonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HackathonService {
    private final HackathonRepository hackathonRepository;

    public Hackathon getHackathonById(String hackId) {
        return hackathonRepository.findById(hackId)
                .orElseThrow(() -> new RuntimeException("Hackathon not found"));
    }

    public Hackathon addHackathon(Hackathon hackathon){return hackathonRepository.save(hackathon);}

    public void deleteHackathon(String hackId){
        if (!hackathonRepository.existsById(hackId)) {
            throw new RuntimeException("Task not found");
        }
        hackathonRepository.deleteById(hackId);
    }

    public Hackathon addTaskToHackathon(String hackId, String taskId) {
        Hackathon hackathon = hackathonRepository.findById(hackId)
                .orElseThrow(() -> new RuntimeException("Hackathon not found"));

        if (!hackathon.getTasks().contains(taskId)) {
            hackathon.getTasks().add(taskId);
        }

        return hackathonRepository.save(hackathon);
    }

    public Hackathon addUserToHackathon(String hackId, String userId) {
        Hackathon hackathon = hackathonRepository.findById(hackId)
                .orElseThrow(() -> new RuntimeException("Hackathon not found"));

        if (!hackathon.getUsers().contains(userId)) {
            hackathon.getUsers().add(userId);
        }

        return hackathonRepository.save(hackathon);
    }

    public Hackathon removeTaskFromHackathon(String hackId, String taskId) {
        Hackathon hackathon = hackathonRepository.findById(hackId)
                .orElseThrow(() -> new RuntimeException("Hackathon not found"));

        boolean removed = hackathon.getTasks().removeIf(id -> id.equals(taskId));
        if (!removed) {
            throw new RuntimeException("Task not assigned to this hackathon");
        }

        return hackathonRepository.save(hackathon);
    }

    public Hackathon removeUserFromHackathon(String hackId, String userId) {
        Hackathon hackathon = hackathonRepository.findById(hackId)
                .orElseThrow(() -> new RuntimeException("Hackathon not found"));

        boolean removed = hackathon.getUsers().removeIf(id -> id.equals(userId));
        if (!removed) {
            throw new RuntimeException("User not assigned to this hackathon");
        }

        return hackathonRepository.save(hackathon);
    }

    public Hackathon updateHackathon(String hackId, Hackathon updatedData) {
        Hackathon existing = hackathonRepository.findById(hackId)
                .orElseThrow(() -> new RuntimeException("Hackathon not found"));

        if (updatedData.getName() != null) {
            existing.setName(updatedData.getName());
        }

        if (updatedData.getDescription() != null) {
            existing.setDescription(updatedData.getDescription());
        }

        if (updatedData.getDate() != null) {
            existing.setDate(updatedData.getDate());
        }

        return hackathonRepository.save(existing);
    }

    public List<Hackathon> getAllHackathons() { return hackathonRepository.findAll();}
}

package com.hackathon.main.controller;

import com.hackathon.main.model.Hackathon;
import com.hackathon.main.service.HackathonService;
import jakarta.ws.rs.Path;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hackathons")
public class HackathonController {
    private final HackathonService hackathonService;

    public HackathonController(HackathonService hackathonService) {
        this.hackathonService = hackathonService;
    }

    @GetMapping()
    public List<Hackathon> getAllHackathons() {
        return hackathonService.getAllHackathons();
    }
    @GetMapping("/{hackId}")
    public ResponseEntity<Hackathon> getHackathonById(@PathVariable String hackId) {
        Hackathon hackathon = hackathonService.getHackathonById(hackId);
        return ResponseEntity.ok(hackathon);
    }

    @DeleteMapping("/{hackId}")
    public ResponseEntity<Void> deleteHackathon(@PathVariable String hackId){
        hackathonService.deleteHackathon(hackId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping()
    public ResponseEntity<Hackathon> createHackathon(@RequestBody Hackathon hackathon){
        Hackathon savedHackathon = hackathonService.addHackathon(hackathon);
        return ResponseEntity.ok(savedHackathon);
    }

    //add tasks
    @PutMapping("/{hackId}/tasks/{taskId}")
    public ResponseEntity<Hackathon> addTaskToHackathon(
            @PathVariable String hackId,
            @PathVariable String taskId
    ) {
        Hackathon updated = hackathonService.addTaskToHackathon(hackId, taskId);
        return ResponseEntity.ok(updated);
    }

    //add users
    @PutMapping("/{hackId}/users/{userId}")
    public ResponseEntity<Hackathon> addUserToHackathon(
            @PathVariable String hackId,
            @PathVariable String userId
    ) {
        Hackathon updated = hackathonService.addUserToHackathon(hackId, userId);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{hackId}/tasks/{taskId}")
    public ResponseEntity<Hackathon> removeTaskFromHackathon(
            @PathVariable String hackId,
            @PathVariable String taskId
    ) {
        Hackathon updated = hackathonService.removeTaskFromHackathon(hackId, taskId);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{hackId}/users/{userId}")
    public ResponseEntity<Hackathon> removeUserFromHackathon(
            @PathVariable String hackId,
            @PathVariable String userId
    ) {
        Hackathon updated = hackathonService.removeUserFromHackathon(hackId, userId);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{hackId}")
    public ResponseEntity<Hackathon> updateHackathon(
            @PathVariable String hackId,
            @RequestBody Hackathon updatedHackathon
    ) {
        Hackathon saved = hackathonService.updateHackathon(hackId, updatedHackathon);
        return ResponseEntity.ok(saved);
    }



}



package com.hackathon.main.controller;

import com.hackathon.main.model.User;
import com.hackathon.main.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping()
    public ResponseEntity<User> createUser(@RequestBody User user) {
        User savedUser = userService.addUser(user);
        return ResponseEntity.ok(savedUser);
    }

    @GetMapping()
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }
}

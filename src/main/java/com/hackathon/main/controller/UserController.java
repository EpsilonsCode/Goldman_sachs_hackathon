package com.hackathon.main.controller;

import com.hackathon.main.dto.CreateUserDto;
import com.hackathon.main.model.User;
import com.hackathon.main.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping()
    public ResponseEntity<User> createUser(@RequestBody CreateUserDto user) {
        User savedUser = userService.addUser(user);
        return ResponseEntity.ok(savedUser);
    }

    @GetMapping()
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/current")
    public User getCurrentUser(@AuthenticationPrincipal Jwt jwt) {
        System.out.println(jwt.getClaims());
        return userService.getCurrentLoggedInUser(jwt)
;    }
}

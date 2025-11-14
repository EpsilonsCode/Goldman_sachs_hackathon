package com.hackathon.main.dto;

import com.hackathon.main.model.Role;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateUserDto {
    private String username;
    private String email;
    private Role role;
    private String team_name;
    private String password;
}

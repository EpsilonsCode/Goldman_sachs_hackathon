package com.hackathon.main.dto;

import com.hackathon.main.model.Role;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateUserDto {
    private Role role;
    private String team_name;
}

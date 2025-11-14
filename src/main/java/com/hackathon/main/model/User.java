package com.hackathon.main.model;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
@Getter
@Setter
public class User {
    @Id
    private String id;
    @NotEmpty
    @Indexed(unique = true)
    private String keycloakId;
    @NotEmpty
    @Indexed(unique = true)
    private String username;
    @NotEmpty
    @Email
    @Indexed(unique = true)
    private String email;
    //judge, admin, participant
    @NotEmpty
    private Role role;
    private String team_name;
    //TODO: list of tasks

}

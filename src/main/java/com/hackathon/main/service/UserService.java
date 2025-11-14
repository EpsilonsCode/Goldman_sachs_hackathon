package com.hackathon.main.service;

import com.hackathon.main.dto.CreateUserDto;
import com.hackathon.main.model.User;
import com.hackathon.main.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    private final Keycloak keycloakAdmin;

    public User addUser(CreateUserDto userDto) {
        UserRepresentation kcUser = new UserRepresentation();
        kcUser.setUsername(userDto.getUsername());
        kcUser.setEmail(userDto.getEmail());
        kcUser.setEnabled(true);
        kcUser.setRealmRoles(Collections.singletonList(userDto.getRole().name().toLowerCase()));

        CredentialRepresentation password = new CredentialRepresentation();
        password.setTemporary(false);
        password.setType(CredentialRepresentation.PASSWORD);
        password.setValue(userDto.getPassword() );

        kcUser.setCredentials(Collections.singletonList(password));

        var response = keycloakAdmin.realm("hackathon").users().create(kcUser);

        if (response.getStatus() != 201) {
            throw new RuntimeException("Failed to create Keycloak user: " + response.getStatusInfo());
        }

        String keycloakId = response.getLocation()
                .getPath()
                .replaceAll(".*/([^/]+)$", "$1");

        User dbUser = new User();
        dbUser.setUsername(userDto.getUsername());
        dbUser.setEmail(userDto.getEmail());
            dbUser.setRole(userDto.getRole());
        dbUser.setTeam_name(userDto.getTeam_name());
        dbUser.setKeycloakId(keycloakId);

        return userRepository.save(dbUser);
    }


    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getCurrentLoggedInUser(Jwt jwt) {
        String keycloakId = jwt.getClaimAsString("preferred_username");
        return userRepository.findByUsername(keycloakId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}

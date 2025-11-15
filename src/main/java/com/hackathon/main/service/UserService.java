package com.hackathon.main.service;

import com.hackathon.main.dto.CreateUserDto;
import com.hackathon.main.dto.UpdateUserDto; // <-- IMPORT
import com.hackathon.main.model.Role;
import com.hackathon.main.model.User;
import com.hackathon.main.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.RoleRepresentation; // <-- IMPORT
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
        // Use the helper method for consistency
        kcUser.setRealmRoles(Collections.singletonList(userDto.getRole().getKeycloakRoleName()));

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

    public User updateUser(String id, UpdateUserDto userDto) {
        User dbUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        dbUser.setRole(userDto.getRole());
        dbUser.setTeam_name(userDto.getTeam_name());
        userRepository.save(dbUser);

        var userResource = keycloakAdmin.realm("hackathon").users().get(dbUser.getKeycloakId());
        if (userResource == null) {
            throw new RuntimeException("Keycloak user not found for ID: " + dbUser.getKeycloakId());
        }

        List<RoleRepresentation> allRealmRoles = keycloakAdmin.realm("hackathon").roles().list();

        String newRoleName = userDto.getRole().getKeycloakRoleName();
        RoleRepresentation newKeycloakRole = allRealmRoles.stream()
                .filter(r -> r.getName().equals(newRoleName))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Role not found in Keycloak: " + newRoleName));

        List<RoleRepresentation> rolesToAdd = Collections.singletonList(newKeycloakRole);

        List<String> managedRoleNames = List.of(
                Role.ADMIN.getKeycloakRoleName(),
                Role.JUDGE.getKeycloakRoleName(),
                Role.PARTICIPANT.getKeycloakRoleName()
        );

        List<RoleRepresentation> currentRoles = userResource.roles().realmLevel().listAll();

        List<RoleRepresentation> rolesToRemove = currentRoles.stream()
                .filter(r -> managedRoleNames.contains(r.getName())) // It's one of our roles
                .filter(r -> !r.getName().equals(newRoleName))     // And it's not the new role
                .toList();

        if (!rolesToRemove.isEmpty()) {
            userResource.roles().realmLevel().remove(rolesToRemove);
        }
        userResource.roles().realmLevel().add(rolesToAdd);

        return dbUser;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getCurrentLoggedInUser(Jwt jwt) {
        String keycloakId = jwt.getClaimAsString("preferred_username");
        return userRepository.findByUsername(keycloakId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User getUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: User not found with id: " + id));
    }
    public void deleteUser(String id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("Error: User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Error: User not found with username: " + username));
    }
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Error: User not found with email: " + email));
    }

    public List<User> getUsersByRole(Role role) {
        return userRepository.findByRole(role);
    }

}
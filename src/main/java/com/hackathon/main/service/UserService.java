package com.hackathon.main.service;

import com.hackathon.main.dto.CreateUserDto;
import com.hackathon.main.dto.UpdateUserDto;
import com.hackathon.main.model.Role;
import com.hackathon.main.model.User;
import com.hackathon.main.repository.UserRepository;
import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;

    private final Keycloak keycloakAdmin;

    @Value("${hackathon.admin.username}")
    private String adminUsername;
    @Value("${hackathon.admin.password}")
    private String adminPassword;
    @Value("${hackathon.admin.email}")
    private String adminEmail;


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
        password.setValue(userDto.getPassword());

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

    /**
     * Updates an existing user's role and team name, both in Keycloak and database.
     *
     * @param id      ID of the user to update
     * @param userDto DTO containing updated role and team name
     * @return the updated {@link User} entity
     * @throws RuntimeException if user or Keycloak roles are not found
     */
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
                .filter(r -> managedRoleNames.contains(r.getName()))
                .filter(r -> !r.getName().equals(newRoleName))
                .toList();

        if (!rolesToRemove.isEmpty()) {
            userResource.roles().realmLevel().remove(rolesToRemove);
        }
        userResource.roles().realmLevel().add(rolesToAdd);

        return dbUser;
    }

    /**
     * Retrieves all users in the system.
     *
     * @return a list of all {@link User} entities
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Retrieves the currently logged-in user based on the JWT token.
     *
     * @param jwt JWT token of the authenticated user
     * @return the {@link User} entity
     * @throws RuntimeException if user is not found
     */
    public User getCurrentLoggedInUser(Jwt jwt) {
        String keycloakId = jwt.getClaimAsString("preferred_username");
        return userRepository.findByUsername(keycloakId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    /**
     * Retrieves a user by database ID.
     *
     * @param id the ID of the user
     * @return the {@link User} entity
     * @throws RuntimeException if user is not found
     */
    public User getUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: User not found with id: " + id));
    }

    /**
     * Deletes a user by ID.
     *
     * @param id the ID of the user
     * @throws RuntimeException if user does not exist
     */
    public void deleteUser(String id) {
        // This only deletes the local user, not the Keycloak user.
        // To delete from Keycloak, you would add:
        // User dbUser = userRepository.findById(id).orElse(null);
        // if (dbUser != null && dbUser.getKeycloakId() != null) {
        //     keycloakAdmin.realm("hackathon").users().delete(dbUser.getKeycloakId());
        // }

        if (!userRepository.existsById(id)) {
            throw new RuntimeException("Error: User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    /**
     * Retrieves a user by username.
     *
     * @param username the username to look up
     * @return the {@link User} entity
     * @throws RuntimeException if user is not found
     */
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Error: User not found with username: " + username));
    }

    /**
     * Retrieves a user by email.
     *
     * @param email the email to look up
     * @return the {@link User} entity
     * @throws RuntimeException if user is not found
     */
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Error: User not found with email: " + email));
    }

    /**
     * Retrieves all users with a specific role.
     *
     * @param role the {@link Role} to filter users
     * @return a list of users with the given role
     */
    public List<User> getUsersByRole(Role role) {
        return userRepository.findByRole(role);
    }

    // --- NEW METHOD TO CREATE ADMIN ON STARTUP ---
    @Transactional
    public void createAdminUserIfNotExist() {
        RealmResource realm = keycloakAdmin.realm("hackathon");
        UsersResource usersResource = realm.users();

        // 1. Check if admin user already exists in Keycloak
        List<UserRepresentation> existingUsers = usersResource.searchByUsername(adminUsername, true);

        if (existingUsers.isEmpty()) {
            log.info("Default admin user '{}' not found in Keycloak. Creating...", adminUsername);

            // 2. Create user representation, mirroring your addUser logic
            UserRepresentation adminRep = new UserRepresentation();
            adminRep.setUsername(adminUsername);
            adminRep.setEmail(adminEmail);
            adminRep.setFirstName("Admin");
            adminRep.setLastName("User");
            adminRep.setEnabled(true);

            // 3. Set password
            CredentialRepresentation password = new CredentialRepresentation();
            password.setTemporary(false);
            password.setType(CredentialRepresentation.PASSWORD);
            password.setValue(adminPassword);
            adminRep.setCredentials(Collections.singletonList(password));

            // 4. Set realm role
            adminRep.setRealmRoles(Collections.singletonList(Role.ADMIN.getKeycloakRoleName()));

            // 5. Create user in Keycloak
            Response response = usersResource.create(adminRep);

            if (response.getStatus() != 201) {
                log.error("Failed to create admin user in Keycloak. Status: {}", response.getStatusInfo().getReasonPhrase());
                throw new RuntimeException("Failed to create Keycloak admin user: " + response.getStatusInfo());
            }

            // 6. Get Keycloak ID
            String keycloakId = response.getLocation()
                    .getPath()
                    .replaceAll(".*/([^/]+)$", "$1");

            // 7. Save to local MongoDB
            User dbAdmin = new User();
            dbAdmin.setKeycloakId(keycloakId);
            dbAdmin.setUsername(adminUsername);
            dbAdmin.setEmail(adminEmail);
            dbAdmin.setRole(Role.ADMIN);
            dbAdmin.setTeam_name("Administration");
            userRepository.save(dbAdmin);

            log.info("Default admin user '{}' created successfully.", adminUsername);
        } else {
            log.info("Default admin user '{}' already exists. Skipping creation.", adminUsername);
        }
    }
    // --- END NEW METHOD ---
}
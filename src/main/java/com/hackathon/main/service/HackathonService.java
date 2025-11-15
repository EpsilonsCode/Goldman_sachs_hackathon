package com.hackathon.main.service;

import com.hackathon.main.model.Hackathon;
import com.hackathon.main.model.Task;
import com.hackathon.main.model.User;
import com.hackathon.main.repository.HackathonRepository;
import com.hackathon.main.repository.TaskRepository;
import com.hackathon.main.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HackathonService {
    private final HackathonRepository hackathonRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    /**
     * Creates and persists a new {@link Hackathon}.
     *
     * @param hackathon the hackathon entity to be created and saved
     * @return the saved {@link Hackathon} entity, including any generated fields (e.g. ID)
     */
    public Hackathon addHackathon(Hackathon hackathon) {
        return hackathonRepository.save(hackathon);
    }

    /**
     * Retrieves all hackathons from the data store.
     *
     * @return a list of all {@link Hackathon} entities
     */
    public List<Hackathon> getAllHackathons() {
        return hackathonRepository.findAll();
    }

    /**
     * Retrieves a single hackathon by its identifier.
     *
     * @param hackId the unique identifier of the hackathon
     * @return the {@link Hackathon} entity associated with the given ID
     * @throws RuntimeException if no hackathon is found for the provided ID
     */
    public Hackathon getHackathonById(String hackId) {
        return hackathonRepository.findById(hackId)
                .orElseThrow(() -> new RuntimeException("Hackathon not found with id: " + hackId));
    }

    /**
     * Deletes a hackathon with the given identifier.
     *
     * @param hackId the unique identifier of the hackathon to be deleted
     * @throws RuntimeException if no hackathon exists for the provided ID
     */
    public void deleteHackathon(String hackId) {
        if (!hackathonRepository.existsById(hackId)) {
            throw new RuntimeException("Hackathon not found with id: " + hackId);
        }
        hackathonRepository.deleteById(hackId);
    }

    /**
     * Adds a task to the hackathon's list of associated tasks.
     * <p>
     * This method:
     * <ul>
     *     <li>Validates that both hackathon and task exist.</li>
     *     <li>Initializes the tasks list if it is {@code null}.</li>
     *     <li>Adds the task ID to the hackathon only if it is not already present.</li>
     * </ul>
     *
     * @param hackId the ID of the hackathon to which the task will be added
     * @param taskId the ID of the task to be associated with the hackathon
     * @return the updated {@link Hackathon} entity after the task has been added
     * @throws RuntimeException if the hackathon or task cannot be found
     */
    public Hackathon addTaskToHackathon(String hackId, String taskId) {
        Hackathon hackathon = hackathonRepository.findById(hackId)
                .orElseThrow(() -> new RuntimeException("Hackathon not found"));
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        if (hackathon.getTasks() == null) {
            hackathon.setTasks(new ArrayList<>());
        }

        if (!hackathon.getTasks().contains(taskId)) {
            hackathon.getTasks().add(taskId);
            return hackathonRepository.save(hackathon);
        }
        return hackathon;
    }

    /**
     * Adds a user to the hackathon's list of participants.
     * <p>
     * This method:
     * <ul>
     *     <li>Validates that both hackathon and user exist.</li>
     *     <li>Initializes the users list if it is {@code null}.</li>
     *     <li>Adds the user ID to the hackathon only if it is not already present.</li>
     * </ul>
     *
     * @param hackId the ID of the hackathon to which the user will be added
     * @param userId the ID of the user to be associated with the hackathon
     * @return the updated {@link Hackathon} entity after the user has been added
     * @throws RuntimeException if the hackathon or user cannot be found
     */
    public Hackathon addUserToHackathon(String hackId, String userId) {
        Hackathon hackathon = hackathonRepository.findById(hackId)
                .orElseThrow(() -> new RuntimeException("Hackathon not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (hackathon.getUsers() == null) {
            hackathon.setUsers(new ArrayList<>());
        }

        if (!hackathon.getUsers().contains(userId)) {
            hackathon.getUsers().add(userId);
            return hackathonRepository.save(hackathon);
        }
        return hackathon;
    }

    /**
     * Removes a task from the hackathon's list of associated tasks.
     * <p>
     * If the hackathon has no tasks list initialized, the method simply returns the entity
     * without making any changes.
     *
     * @param hackId the ID of the hackathon from which the task will be removed
     * @param taskId the ID of the task to be removed from the hackathon
     * @return the updated {@link Hackathon} entity after the task has been removed
     * @throws RuntimeException if the hackathon cannot be found
     */
    public Hackathon removeTaskFromHackathon(String hackId, String taskId) {
        Hackathon hackathon = hackathonRepository.findById(hackId)
                .orElseThrow(() -> new RuntimeException("Hackathon not found"));

        if (hackathon.getTasks() != null) {
            hackathon.getTasks().remove(taskId);
            return hackathonRepository.save(hackathon);
        }
        return hackathon;
    }

    /**
     * Removes a user from the hackathon's list of participants.
     * <p>
     * If the hackathon has no users list initialized, the method simply returns the entity
     * without making any changes.
     *
     * @param hackId the ID of the hackathon from which the user will be removed
     * @param userId the ID of the user to be removed from the hackathon
     * @return the updated {@link Hackathon} entity after the user has been removed
     * @throws RuntimeException if the hackathon cannot be found
     */
    public Hackathon removeUserFromHackathon(String hackId, String userId) {
        Hackathon hackathon = hackathonRepository.findById(hackId)
                .orElseThrow(() -> new RuntimeException("Hackathon not found"));

        if (hackathon.getUsers() != null) {
            hackathon.getUsers().remove(userId);
            return hackathonRepository.save(hackathon);
        }
        return hackathon;
    }

    /**
     * Updates basic information of an existing hackathon, such as its name and description.
     * <p>
     * This method does <strong>not</strong> modify associated tasks or users; those relationships
     * are managed via dedicated methods:
     * {@link #addTaskToHackathon(String, String)},
     * {@link #removeTaskFromHackathon(String, String)},
     * {@link #addUserToHackathon(String, String)},
     * and {@link #removeUserFromHackathon(String, String)}.
     *
     * @param hackId           the ID of the hackathon to be updated
     * @param updatedHackathon an object containing the new values for updatable fields
     * @return the updated {@link Hackathon} entity after changes are persisted
     * @throws RuntimeException if the hackathon cannot be found
     */
    public Hackathon updateHackathon(String hackId, Hackathon updatedHackathon) {
        Hackathon existingHackathon = hackathonRepository.findById(hackId)
                .orElseThrow(() -> new RuntimeException("Hackathon not found"));

        existingHackathon.setName(updatedHackathon.getName());
        existingHackathon.setDescription(updatedHackathon.getDescription());
        // Do not update tasks or users here, that's handled by other endpoints

        return hackathonRepository.save(existingHackathon);
    }
}

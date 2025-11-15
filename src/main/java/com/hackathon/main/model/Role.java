package com.hackathon.main.model;

import java.util.List;

public enum Role {
    PARTICIPANT,
    ADMIN,
    JUDGE;

    /**
     * Gets the matching role name for Keycloak (all lowercase).
     * @return The string name of the role in Keycloak.
     */
    public String getKeycloakRoleName() {
        // Assumes Keycloak roles are "participant", "admin", "judge"
        return this.name().toLowerCase();
    }
}
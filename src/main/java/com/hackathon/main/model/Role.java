package com.hackathon.main.model;

import java.util.List;

public enum Role {
    PARTICIPANT,
    ADMIN,
    JUDGE;

    public String getKeycloakRoleName() {
        return this.name().toLowerCase();
    }
}
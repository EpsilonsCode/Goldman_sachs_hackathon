// src/keycloak.js
import Keycloak from "keycloak-js";

// Use environment variable for URL, default to localhost:8180
const keycloakUrl = process.env.REACT_APP_KEYCLOAK_URL || "http://localhost:8180";

const keycloak = new Keycloak({
    url: keycloakUrl,
    realm: "hackathon",
    clientId: "hackathon-app"
});

let initialized = false;

export function initKeycloak(onAuthenticated) {
    if (!initialized) {
        initialized = true;
        keycloak.init({ onLoad: "login-required" }).then(auth => {
            console.log("TOKEN:", keycloak.token);
            console.log("REFRESH TOKEN:", keycloak.refreshToken);
            onAuthenticated(auth);
        });
    }
}

export default keycloak;
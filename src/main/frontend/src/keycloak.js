// src/keycloak.js
import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
    url: "http://localhost:8180",
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

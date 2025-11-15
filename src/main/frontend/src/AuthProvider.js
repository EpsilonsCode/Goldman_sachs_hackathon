// src/AuthProvider.js
import React, { createContext, useContext, useState, useEffect } from "react";
import keycloak, { initKeycloak } from "./keycloak";
import { apiFactory } from "./api"; // Import the factory

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [api, setApi] = useState(null); // State to hold the api instance
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        initKeycloak(async (authenticated) => {
            if (!authenticated) {
                console.error("User not authenticated via Keycloak");
                setError(true);
                setLoading(false);
                return;
            }

            const currentToken = keycloak.token;
            setToken(currentToken);

            // Create the API instance with the token
            const apiClient = apiFactory(currentToken, keycloak.login);
            setApi(apiClient); // Save the instance in state

            try {
                // Fetch current user from backend using the new api client
                const userData = await apiClient.getCurrentUser();
                setUser(userData);
            } catch (err) {
                console.error("Failed to fetch user:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        });
    }, []);

    const logout = () => {
        keycloak.logout({ redirectUri: window.location.origin });
    };

    const login = () => {
        keycloak.login();
    };

    // This function is now less critical as the API client is token-scoped
    // but can be used for optimistic UI updates.
    const refreshUser = async () => {
        if (!api) return;
        setLoading(true);
        try {
            const userData = await api.getCurrentUser();
            setUser(userData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider
            // Provide the api instance to all children
            value={{ user, token, api, loading, error, logout, login, refreshUser }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context)
        throw new Error("useAuth must be used within an AuthProvider");
    return context;
};
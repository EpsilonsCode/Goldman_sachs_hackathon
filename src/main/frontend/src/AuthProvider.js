// src/AuthProvider.js
import React, { createContext, useContext, useState, useEffect } from "react";
import keycloak, { initKeycloak } from "./keycloak";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        // Initialize Keycloak once
        initKeycloak(async (authenticated) => {
            if (!authenticated) {
                console.error("User not authenticated via Keycloak");
                setError(true);
                setLoading(false);
                return;
            }

            setToken(keycloak.token);

            try {
                // Fetch current user from backend
                const response = await fetch("/api/users/current", {
                    headers: {
                        Authorization: `Bearer ${keycloak.token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);
                } else {
                    console.log("User not authenticated, status:", response.status);
                    setError(true);
                }
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

    const refreshUser = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/users/current", {
                headers: {
                    Authorization: `Bearer ${keycloak.token}`,
                    "Content-Type": "application/json",
                },
            });
            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{ user, token, loading, error, logout, login, refreshUser }}
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

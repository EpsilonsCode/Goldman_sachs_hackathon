// src/AuthProvider.js
import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import keycloak, { initKeycloak } from "./keycloak";
import { apiFactory } from "./api";

// --- Auth Context (unchanged) ---
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [api, setApi] = useState(null);
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

            const apiClient = apiFactory(currentToken, keycloak.login);
            setApi(apiClient);

            try {
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

// --- Hackathon Context ---

const HackathonContext = createContext();

/**
 * This provider manages the currently selected hackathon for a participant.
 */
export const HackathonProvider = ({ children }) => {
    const [selectedHackathon, setSelectedHackathon] = useState(null);
    const [allHackathons, setAllHackathons] = useState([]);
    const [loading, setLoading] = useState(true);
    const { api, user } = useAuth();

    // Load all hackathons once the user is logged in
    useEffect(() => {
        if (api && user) {
            setLoading(true);
            api.getHackathons()
                .then(data => {
                    setAllHackathons(data);
                })
                .catch(err => {
                    console.error("Failed to load hackathons:", err);
                    alert("Failed to load hackathon data.");
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [api, user]);

    // Get only the hackathons the current participant is part of
    const myHackathons = useMemo(() => { // <--- THIS IS THE LINE THAT WAS CRASHING
        if (!user || user.role !== 'PARTICIPANT') {
            return [];
        }
        return allHackathons.filter(hack =>
            hack.userIds && hack.userIds.includes(user.id)
        );
    }, [allHackathons, user]);

    const selectHackathon = (hackathon) => {
        setSelectedHackathon(hackathon);
    };

    // "Switches" hackathon by clearing the selection, which shows the selector screen
    const clearHackathon = () => {
        setSelectedHackathon(null);
    };

    return (
        <HackathonContext.Provider
            value={{
                selectedHackathon,
                selectHackathon,
                clearHackathon,
                myHackathons,
                loadingHackathons: loading
            }}
        >
            {children}
        </HackathonContext.Provider>
    );
};

export const useHackathon = () => {
    const context = useContext(HackathonContext);
    if (!context)
        throw new Error("useHackathon must be used within a HackathonProvider");
    return context;
};
// src/hooks/useDataCache.js
import { useEffect, useState } from "react";

// Reusable hook to fetch users/tasks for mapping IDs to names
export const useDataCache = (api) => {
    const [users, setUsers] = useState(new Map());
    const [tasks, setTasks] = useState(new Map());
    const [hackathons, setHackathons] = useState(new Map());

    const loadData = async () => {
        if (!api) return;
        try {
            const usersData = await api.getUsers();
            setUsers(new Map(usersData.map(u => [u.id, u.username])));
        } catch (e) { console.error("Failed to fetch users", e); }
        try {
            const tasksData = await api.getTasks();
            // --- FIX: Store the *entire task object*, not just the name ---
            setTasks(new Map(tasksData.map(t => [t.id, t])));
        } catch (e) { console.error("Failed to fetch tasks", e); }
        try {
            const hackathonData = await api.getHackathons();
            setHackathons(new Map(hackathonData.map(h => [h.id, h.name])));
        } catch (e) { console.error("Failed to fetch hackathons", e); }
    };

    useEffect(() => {
        loadData();
    }, [api]);

    return {
        getUserName: (id) => users.get(id) || 'Unknown User',
        // --- FIX: Get the name *from* the cached task object ---
        getTaskName: (id) => (tasks.get(id) ? tasks.get(id).name : 'Unknown Task'),
        getHackathonName: (id) => hackathons.get(id) || 'Unknown Hackathon',

        getAllUsers: () => Array.from(users, ([id, username]) => ({ id, username })),
        // --- FIX: Return the full task objects from the map's values ---
        getAllTasks: () => Array.from(tasks.values()),

        refresh: loadData // Function to manually refresh cache
    };
};
// src/api.js
export const api = (token, login) => ({
    async fetchWithAuth(url, options = {}) {
        const response = await fetch(url, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                ...options.headers
            }
        });

        if (response.status === 401) {
            login(); // re-login
            return;
        }

        if (!response.ok) throw new Error(response.statusText);
        return response.status !== 204 ? response.json() : null;
    },

    getTasks: function() { return this.fetchWithAuth("/api/tasks"); },
    createTask: function(task) { return this.fetchWithAuth("/api/tasks", { method: "POST", body: JSON.stringify(task) }); },
    getUsers: function() { return this.fetchWithAuth("/api/users"); },
    createUser: function(user) { return this.fetchWithAuth("/api/users", { method: "POST", body: JSON.stringify(user) }); },
});

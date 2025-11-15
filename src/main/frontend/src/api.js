// src/api.js

/**
 * Creates an API client instance.
 * @param {string} token - The Keycloak auth token.
 * @param {function} login - The Keycloak login function (for re-authentication on 401).
 * @returns {object} The API client object.
 */
export const apiFactory = (token, login) => {

    // Helper for JSON requests
    const fetchWithAuth = async (url, options = {}) => {
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
            throw new Error("Unauthorized");
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || response.statusText);
        }
        return response.status !== 204 ? response.json() : null;
    };

    // Helper for FormData requests (file uploads)
    const fetchWithAuthFormData = async (url, options = {}) => {
        const response = await fetch(url, {
            ...options,
            headers: {
                // DO NOT set Content-Type here. Browser will set it
                // with the correct 'multipart/form-data' boundary.
                "Authorization": `Bearer ${token}`,
                ...options.headers
            }
        });

        if (response.status === 401) {
            login();
            throw new Error("Unauthorized");
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || response.statusText);
        }
        return response.status !== 204 ? response.json() : null;
    };

    return {
        // === User API (UserController.java) ===

        getCurrentUser: function() {
            return fetchWithAuth("/api/users/current");
        },
        getUsers: function() {
            return fetchWithAuth("/api/users");
        },
        createUser: function(userDto) {
            return fetchWithAuth("/api/users", {
                method: "POST",
                body: JSON.stringify(userDto)
            });
        },
        // --- NEW FUNCTION ---
        updateUser: function(userId, updateUserDto) {
            return fetchWithAuth(`/api/users/${userId}`, {
                method: "PUT",
                body: JSON.stringify(updateUserDto)
            });
        },
        // --------------------
        deleteUser: function(userId) {
            return fetchWithAuth(`/api/users/${userId}`, {
                method: "DELETE"
            });
        },
        getUserById: function(userId) {
            return fetchWithAuth(`/api/users/${userId}`);
        },
        getUsersByRole: function(role) {
            return fetchWithAuth(`/api/users/role/${role}`);
        },

        // === Task API (TaskController.java) ===

        getTasks: function() {
            return fetchWithAuth("/api/tasks");
        },
        getTaskById: function(taskId) {
            return fetchWithAuth(`/api/tasks/${taskId}`);
        },
        createTask: function(taskData, files) {
            const formData = new FormData();
            formData.append("task", new Blob([JSON.stringify(taskData)], {
                type: "application/json"
            }));

            if (files && files.length > 0) {
                Array.from(files).forEach(file => {
                    formData.append("files", file);
                });
            }

            return fetchWithAuthFormData("/api/tasks", {
                method: "POST",
                body: formData
            });
        },
        updateTaskDetails: function(task) {
            // Uses the POST /api/tasks (JSON) endpoint.
            // Spring Data's save() will update if an ID is present.
            return fetchWithAuth("/api/tasks", {
                method: "POST",
                body: JSON.stringify(task)
            });
        },
        addFilesToTask: function(taskId, files) {
            const formData = new FormData();
            Array.from(files).forEach(file => {
                formData.append("files", file);
            });

            return fetchWithAuthFormData(`/api/tasks/${taskId}/files`, {
                method: "PUT",
                body: formData
            });
        },
        removeFileFromTask: function(taskId, fileIndex) {
            return fetchWithAuth(`/api/tasks/${taskId}/files/${fileIndex}/remove`, {
                method: "PUT"
            });
        },
        deleteTask: function(taskId) {
            return fetchWithAuth(`/api/tasks/${taskId}`, {
                method: "DELETE"
            });
        },
        downloadTaskFile: async function(taskId, fileIndex) {
            const response = await fetch(`/api/tasks/${taskId}/files/${fileIndex}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!response.ok) throw new Error(response.statusText);
            return response.blob();
        },

        // === Solution API (SolutionController.java) ===

        submitSolution: function(userId, taskId, files) {
            const formData = new FormData();
            formData.append("userId", userId);
            formData.append("taskId", taskId);

            Array.from(files).forEach(file => {
                formData.append("files", file);
            });

            return fetchWithAuthFormData("/api/solutions", {
                method: "POST",
                body: formData
            });
        },
        getAllSolutions: function() {
            return fetchWithAuth("/api/solutions");
        },
        getLeaderboardForTask: function(taskId) {
            return fetchWithAuth(`/api/solutions/leaderboard/${taskId}`);
        },
        getSolutionsForUser: function(userId) {
            return fetchWithAuth(`/api/solutions/user/${userId}`);
        },
        getSolutionsForTask: function(taskId) {
            return fetchWithAuth(`/api/solutions/task/${taskId}`);
        },
        deleteSolution: function(solutionId) {
            return fetchWithAuth(`/api/solutions/${solutionId}`, {
                method: "DELETE"
            });
        }
    };
};
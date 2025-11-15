// src/pages/admin/AdminPage.js
import React, { useState } from "react";
import { AdminTasksView } from "./AdminTasksView";
import { AdminUsersView } from "./AdminUsersView";
import { AdminHackathonsView } from "./AdminHackathonsView";

export const AdminPage = ({ api, cache }) => {
    const [view, setView] = useState('tasks');

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Panel</h1>

            <div className="flex space-x-4 mb-6">
                <button
                    onClick={() => setView('tasks')}
                    className={`px-4 py-2 rounded-lg ${view === 'tasks' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-900'}`}
                >
                    Manage Tasks
                </button>
                <button
                    onClick={() => setView('users')}
                    className={`px-4 py-2 rounded-lg ${view === 'users' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-900'}`}
                >
                    Manage Users
                </button>
                {/* NEW HACKATHON BUTTON */}
                <button
                    onClick={() => setView('hackathons')}
                    className={`px-4 py-2 rounded-lg ${view === 'hackathons' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-900'}`}
                >
                    Manage Hackathons
                </button>
            </div>

            {view === 'tasks' && <AdminTasksView api={api} cache={cache} />}
            {view === 'users' && <AdminUsersView api={api} />}
            {view === 'hackathons' && <AdminHackathonsView api={api} cache={cache} />}
        </div>
    );
};
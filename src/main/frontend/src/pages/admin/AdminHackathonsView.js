// src/pages/admin/AdminHackathonsView.js
import React, { useEffect, useState } from "react";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import {
    Plus, Edit, Trash2, X, XCircle
} from 'lucide-react';

// --- CreateHackathonModal ---
const CreateHackathonModal = ({ api, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.createHackathon(formData);
            alert('Hackathon created successfully!');
            onSuccess();
            onClose();
        } catch (error) {
            alert('Failed to create hackathon: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-xl">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">Create New Hackathon</h2>
                        <button type="button" onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hackathon Name</label>
                        <input
                            type="text"
                            placeholder="Hackathon Name"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-600 text-gray-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            placeholder="Description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-600 text-gray-900"
                        />
                    </div>
                </div>
                <div className="flex space-x-3 p-6 bg-gray-50 rounded-b-xl">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:bg-gray-300"
                    >
                        {submitting ? "Creating..." : "Create Hackathon"}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 font-medium text-gray-900"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

// --- EditHackathonModal (FIXED) ---
const EditHackathonModal = ({ api, hackathon, cache, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({ id: hackathon.id, name: hackathon.name, description: hackathon.description });
    const [submitting, setSubmitting] = useState(false);

    // State for association management
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedTask, setSelectedTask] = useState('');
    const [selectedUser, setSelectedUser] = useState('');

    // --- FIX: Use 'tasks' and 'users' ---
    const [associatedTaskIds, setAssociatedTaskIds] = useState(hackathon.tasks || []);
    const [associatedUserIds, setAssociatedUserIds] = useState(hackathon.users || []);

    // Load all tasks and users for the dropdowns
    useEffect(() => {
        setTasks(cache.getAllTasks());
        setUsers(cache.getAllUsers());
    }, [cache]);

    const handleDetailsUpdate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.updateHackathon(hackathon.id, formData);
            alert('Hackathon details updated!');
            onSuccess(); // Refresh the main list
        } catch (error) {
            alert('Failed to update hackathon: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddTask = async () => {
        if (!selectedTask || associatedTaskIds.includes(selectedTask)) return;
        try {
            const updatedHackathon = await api.addTaskToHackathon(hackathon.id, selectedTask);
            // --- FIX: Use 'tasks' and default to [] ---
            setAssociatedTaskIds(updatedHackathon.tasks || []);
            setSelectedTask('');
            onSuccess();
        } catch (error) { alert('Failed to add task: ' + error.message); }
    };

    const handleRemoveTask = async (taskId) => {
        try {
            const updatedHackathon = await api.removeTaskFromHackathon(hackathon.id, taskId);
            // --- FIX: Use 'tasks' and default to [] ---
            setAssociatedTaskIds(updatedHackathon.tasks || []);
            onSuccess();
        } catch (error) { alert('Failed to remove task: ' + error.message); }
    };

    const handleAddUser = async () => {
        if (!selectedUser || associatedUserIds.includes(selectedUser)) return;
        try {
            const updatedHackathon = await api.addUserToHackathon(hackathon.id, selectedUser);
            // --- FIX: Use 'users' and default to [] ---
            setAssociatedUserIds(updatedHackathon.users || []);
            setSelectedUser('');
            onSuccess();
        } catch (error) { alert('Failed to add user: ' + error.message); }
    };

    const handleRemoveUser = async (userId) => {
        try {
            const updatedHackathon = await api.removeUserFromHackathon(hackathon.id, userId);
            // --- FIX: Use 'users' and default to [] ---
            setAssociatedUserIds(updatedHackathon.users || []);
            onSuccess();
        } catch (error) { alert('Failed to remove user: ' + error.message); }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-xl">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">Edit Hackathon: {formData.name}</h2>
                        <button type="button" onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto">
                    {/* Details Form */}
                    <form onSubmit={handleDetailsUpdate} className="p-6 space-y-4 border-b">
                        <h3 className="text-lg font-semibold text-gray-900">Hackathon Details</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hackathon Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-600 text-gray-900"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-600 text-gray-900"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:bg-gray-300"
                        >
                            {submitting ? "Saving..." : "Save Details"}
                        </button>
                    </form>

                    <div className="grid grid-cols-1 md:grid-cols-2">
                        {/* Manage Tasks */}
                        <div className="p-6 space-y-3 border-b md:border-b-0 md:border-r">
                            <h3 className="text-lg font-semibold text-gray-900">Manage Tasks</h3>
                            <div className="flex space-x-2">
                                <select
                                    value={selectedTask}
                                    onChange={e => setSelectedTask(e.target.value)}
                                    className="flex-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 text-gray-900"
                                >
                                    <option value="">Select a task to add...</option>
                                    {tasks
                                        // --- FIX: Use 'associatedTaskIds' state ---
                                        .filter(task => !associatedTaskIds.includes(task.id))
                                        .map(task => (
                                            <option key={task.id} value={task.id}>{task.name}</option>
                                        ))}
                                </select>
                                <button onClick={handleAddTask} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Add</button>
                            </div>
                            <div className="space-y-2 pt-2 max-h-48 overflow-y-auto">
                                {/* --- FIX: Use 'associatedTaskIds' state --- */}
                                {associatedTaskIds.map(taskId => (
                                    <div key={taskId} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                                        <span className="text-sm text-gray-800">{cache.getTaskName(taskId)}</span>
                                        <button onClick={() => handleRemoveTask(taskId)} className="text-red-500 hover:text-red-700"><XCircle className="w-5 h-5" /></button>
                                    </div>
                                ))}
                                {associatedTaskIds.length === 0 && <p className="text-sm text-gray-500">No tasks associated.</p>}
                            </div>
                        </div>

                        {/* Manage Users */}
                        <div className="p-6 space-y-3">
                            <h3 className="text-lg font-semibold text-gray-900">Manage Users</h3>
                            <div className="flex space-x-2">
                                <select
                                    value={selectedUser}
                                    onChange={e => setSelectedUser(e.target.value)}
                                    className="flex-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 text-gray-900"
                                >
                                    <option value="">Select a user to add...</option>
                                    {users
                                        // --- FIX: Use 'associatedUserIds' state ---
                                        .filter(user => !associatedUserIds.includes(user.id))
                                        .map(user => (
                                            <option key={user.id} value={user.id}>{user.username}</option>
                                        ))}
                                </select>
                                <button onClick={handleAddUser} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Add</button>
                            </div>
                            <div className="space-y-2 pt-2 max-h-48 overflow-y-auto">
                                {/* --- FIX: Use 'associatedUserIds' state --- */}
                                {associatedUserIds.map(userId => (
                                    <div key={userId} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                                        <span className="text-sm text-gray-800">{cache.getUserName(userId)}</span>
                                        <button onClick={() => handleRemoveUser(userId)} className="text-red-500 hover:text-red-700"><XCircle className="w-5 h-5" /></button>
                                    </div>
                                ))}
                                {associatedUserIds.length === 0 && <p className="text-sm text-gray-500">No users associated.</p>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Close Button */}
                <div className="flex space-x-3 p-6 bg-gray-50 rounded-b-xl sticky bottom-0 border-t">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 font-medium text-gray-900"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};


export const AdminHackathonsView = ({ api, cache }) => {
    const [hackathons, setHackathons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedHackathon, setSelectedHackathon] = useState(null); // For editing

    const loadHackathons = async () => {
        setLoading(true);
        try {
            const data = await api.getHackathons();
            setHackathons(data);
            cache.refresh();
        } catch (error) {
            console.error('Failed to load hackathons:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if(api) loadHackathons();
    }, [api]);

    const handleDelete = async (hackId) => {
        if (window.confirm("Are you sure you want to delete this hackathon?")) {
            try {
                await api.deleteHackathon(hackId);
                alert('Hackathon deleted successfully');
                loadHackathons();
            } catch (error) {
                alert('Failed to delete hackathon: ' + error.message);
            }
        }
    };

    return (
        <div>
            <button
                onClick={() => setShowCreateForm(true)}
                className="mb-6 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
            >
                <Plus className="w-5 h-5" />
                <span>Create New Hackathon</span>
            </button>

            {showCreateForm && (
                <CreateHackathonModal
                    api={api}
                    onClose={() => setShowCreateForm(false)}
                    onSuccess={loadHackathons}
                />
            )}

            {selectedHackathon && (
                <EditHackathonModal
                    api={api}
                    hackathon={selectedHackathon}
                    cache={cache}
                    onClose={() => setSelectedHackathon(null)}
                    onSuccess={loadHackathons}
                />
            )}

            <h3 className="text-2xl font-bold text-gray-900 mb-6">Existing Hackathons</h3>
            {loading ? <LoadingSpinner /> : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tasks</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Users</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {hackathons.map(hack => (
                            <tr key={hack.id}>
                                <td className="px-6 py-4 text-sm text-gray-900">{hack.name}</td>
                                {/* --- FIX: Use 'tasks' and 'users' --- */}
                                <td className="px-6 py-4 text-sm text-gray-600">{hack.tasks?.length || 0}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{hack.users?.length || 0}</td>
                                <td className="px-6 py-4 text-sm text-right space-x-2">
                                    <button
                                        onClick={() => setSelectedHackathon(hack)}
                                        className="text-indigo-600 hover:text-indigo-800"
                                        title="Edit Hackathon"
                                    >
                                        <Edit className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(hack.id)}
                                        className="text-red-600 hover:text-red-800"
                                        title="Delete Hackathon"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
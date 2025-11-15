// src/pages/admin/AdminUsersView.js
import React, { useEffect, useState } from "react";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import {
    Plus, Edit, Trash2, X
} from 'lucide-react';

const CreateUserModal = ({ api, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'PARTICIPANT',
        team_name: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.createUser(formData);
            alert('User created successfully!');
            onSuccess();
            onClose();
        } catch (error) {
            alert('Failed to create user: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-xl">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">Create New User</h2>
                        <button type="button" onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input
                            type="text"
                            required
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-gray-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-gray-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-gray-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-gray-900"
                        >
                            <option value="PARTICIPANT">Participant</option>
                            <option value="ADMIN">Admin</option>
                            <option value="JUDGE">Judge</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Team Name (Optional)</label>
                        <input
                            type="text"
                            value={formData.team_name}
                            onChange={(e) => setFormData({ ...formData, team_name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-gray-900"
                        />
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:bg-gray-300"
                        >
                            {submitting ? "Creating..." : "Create User"}
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
        </div>
    );
};

const EditUserModal = ({ api, user, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        role: user.role,
        team_name: user.team_name || ''
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.updateUser(user.id, formData);
            alert('User updated successfully!');
            onSuccess();
            onClose();
        } catch (error) {
            alert('Failed to update user: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-xl">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">Edit User: {user.username}</h2>
                        <button type="button" onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input
                            type="text"
                            disabled
                            value={user.username}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            disabled
                            value={user.email}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-gray-900"
                        >
                            <option value="PARTICIPANT">Participant</option>
                            <option value="ADMIN">Admin</option>
                            <option value="JUDGE">Judge</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Team Name (Optional)</label>
                        <input
                            type="text"
                            value={formData.team_name}
                            onChange={(e) => setFormData({ ...formData, team_name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-gray-900"
                        />
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:bg-gray-300"
                        >
                            {submitting ? "Saving..." : "Save Changes"}
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
        </div>
    );
};


export const AdminUsersView = ({ api }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await api.getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Failed to load users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if(api) loadUsers();
    }, [api]);

    const handleDelete = async (userId, username) => {
        if (window.confirm(`Are you sure you want to delete user ${username}?`)) {
            try {
                await api.deleteUser(userId);
                alert('User deleted successfully');
                loadUsers();
            } catch (error) {
                alert('Failed to delete user: ' + error.message);
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
                <span>Create New User</span>
            </button>

            {loading ? <LoadingSpinner /> : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {users.map(user => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 text-sm text-gray-900">{user.username}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                                <td className="px-6 py-4 text-sm">
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                        user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                                            user.role === 'JUDGE' ? 'bg-blue-100 text-blue-800' :
                                                'bg-green-100 text-green-800'
                                    }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">{user.team_name || '-'}</td>
                                <td className="px-6 py-4 text-sm text-right space-x-2">
                                    <button
                                        onClick={() => setSelectedUser(user)}
                                        className="text-indigo-600 hover:text-indigo-800"
                                        title="Edit User"
                                    >
                                        <Edit className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user.id, user.username)}
                                        className="text-red-600 hover:text-red-800"
                                        title="Delete User"
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

            {showCreateForm && <CreateUserModal api={api} onClose={() => setShowCreateForm(false)} onSuccess={loadUsers} />}
            {selectedUser && <EditUserModal api={api} user={selectedUser} onClose={() => setSelectedUser(null)} onSuccess={loadUsers} />}
        </div>
    );
};
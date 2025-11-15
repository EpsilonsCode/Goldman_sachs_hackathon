// src/pages/admin/AdminTasksView.js
import React, { useEffect, useState } from "react";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import {
    Plus, Edit, Trash2, X, XCircle
} from 'lucide-react';

const CreateTaskModal = ({ api, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [files, setFiles] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const taskData = { name: formData.name, description: formData.description };
            await api.createTask(taskData, files);
            alert('Task created successfully!');
            onSuccess();
            onClose();
        } catch (error) {
            alert('Failed to create task: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-xl">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">Create New Task</h2>
                        <button type="button" onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Task Name</label>
                        <input
                            type="text"
                            placeholder="Task Name"
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
                            required
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-600 text-gray-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Task Files (Optional)</label>
                        <input
                            type="file"
                            multiple
                            onChange={(e) => setFiles(e.target.files)}
                            className="w-full text-gray-900"
                        />
                    </div>
                </div>
                <div className="flex space-x-3 p-6 bg-gray-50 rounded-b-xl">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:bg-gray-300"
                    >
                        {submitting ? "Creating..." : "Create Task"}
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

const EditTaskModal = ({ api, task, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({ id: task.id, name: task.name, description: task.description, files: task.files || [] });
    const [newFiles, setNewFiles] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const handleDetailsUpdate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // 1. Update text details
            const taskDetails = { id: formData.id, name: formData.name, description: formData.description, files: formData.files };
            const updatedTask = await api.updateTaskDetails(taskDetails);

            // 2. Add new files if any
            if (newFiles && newFiles.length > 0) {
                const updatedTaskWithFiles = await api.addFilesToTask(task.id, newFiles);
                setFormData(updatedTaskWithFiles); // Update local state with new file list
            } else {
                setFormData(updatedTask);
            }

            setNewFiles(null); // Clear file input
            alert('Task updated successfully!');
            onSuccess(); // Refresh the main list
        } catch (error) {
            alert('Failed to update task: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleRemoveFile = async (fileIndex) => {
        if (window.confirm(`Are you sure you want to remove "${formData.files[fileIndex].fileName}"?`)) {
            try {
                const updatedTask = await api.removeFileFromTask(task.id, fileIndex);
                setFormData(updatedTask); // Update local state
                onSuccess(); // Refresh main list
            } catch (error) {
                alert('Failed to remove file: ' + error.message);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-xl">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">Edit Task</h2>
                        <button type="button" onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleDetailsUpdate} className="overflow-y-auto">
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Task Name</label>
                            <input
                                type="text"
                                placeholder="Task Name"
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
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-600 text-gray-900"
                            />
                        </div>

                        {/* --- File Management --- */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Manage Files</h3>
                            {/* Existing Files */}
                            <div className="space-y-2 mb-4">
                                {formData.files.length > 0 ? formData.files.map((file, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
                                        <span className="text-sm text-gray-800 truncate">{file.fileName}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveFile(idx)}
                                            className="text-red-500 hover:text-red-700"
                                            title="Remove File"
                                        >
                                            <XCircle className="w-5 h-5" />
                                        </button>
                                    </div>
                                )) : (
                                    <p className="text-sm text-gray-500">No files associated with this task.</p>
                                )}
                            </div>

                            {/* Add New Files */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Add New Files</label>
                                <input
                                    type="file"
                                    multiple
                                    onChange={(e) => setNewFiles(e.target.files)}
                                    className="w-full text-gray-900"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex space-x-3 p-6 bg-gray-50 rounded-b-xl sticky bottom-0">
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


export const AdminTasksView = ({ api, cache }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null); // For editing

    const loadTasks = async () => {
        setLoading(true);
        try {
            const data = await api.getTasks();
            setTasks(data);
            cache.refresh(); // Refresh cache after task changes
        } catch (error) {
            console.error('Failed to load tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if(api) loadTasks();
    }, [api]);

    const handleDelete = async (taskId) => {
        if (window.confirm("Are you sure you want to delete this task?")) {
            try {
                await api.deleteTask(taskId);
                alert('Task deleted successfully');
                loadTasks();
            } catch (error) {
                alert('Failed to delete task: ' + error.message);
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
                <span>Create New Task</span>
            </button>

            {/* --- CREATE MODAL --- */}
            {showCreateForm && (
                <CreateTaskModal
                    api={api}
                    onClose={() => setShowCreateForm(false)}
                    onSuccess={loadTasks}
                />
            )}

            {/* --- EDIT MODAL --- */}
            {selectedTask && (
                <EditTaskModal
                    api={api}
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                    onSuccess={loadTasks}
                />
            )}

            <h3 className="text-2xl font-bold text-gray-900 mb-6">Existing Tasks</h3>
            {loading ? <LoadingSpinner /> : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Files</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {tasks.map(task => (
                            <tr key={task.id}>
                                <td className="px-6 py-4 text-sm text-gray-900">{task.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{task.files?.length || 0}</td>
                                <td className="px-6 py-4 text-sm text-right space-x-2">
                                    <button
                                        onClick={() => setSelectedTask(task)}
                                        className="text-indigo-600 hover:text-indigo-800"
                                        title="Edit Task"
                                    >
                                        <Edit className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(task.id)}
                                        className="text-red-600 hover:text-red-800"
                                        title="Delete Task"
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
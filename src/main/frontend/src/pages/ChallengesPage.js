// src/pages/ChallengesPage.js
import React, { useEffect, useState } from "react";
import { useAuth, useHackathon } from "../AuthProvider";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { EmptyState } from "../components/EmptyState";
import {
    Database, FileText, Upload, X, Download, CheckCircle, Code
} from 'lucide-react';

// --- Task Card Component ---
const TaskCard = ({ task, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-indigo-500 p-6 flex flex-col justify-between"
        >
            <div>
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <Database className="w-6 h-6 text-indigo-600" />
                        <h3 className="font-bold text-lg text-gray-900">{task.name}</h3>
                    </div>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-3">{task.description}</p>
            </div>
            <div className="flex items-center justify-between text-sm mt-4">
                <span className="flex items-center text-gray-500">
                    <FileText className="w-4 h-4 mr-1" />
                    {task.files?.length || 0} files
                </span>
                <button className="text-indigo-600 hover:text-indigo-800 font-medium">
                    View Details →
                </button>
            </div>
        </div>
    );
};

// --- Task Detail Modal ---
const TaskDetailModal = ({ task, onClose, api }) => {
    const { user } = useAuth();
    const [submitting, setSubmitting] = useState(false);
    const [file, setFile] = useState(null); // <-- Stores a single file

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            setFile(e.target.files[0]); // <-- Store only the first file
        } else {
            setFile(null);
        }
    };

    const handleDownload = async (fileIndex, file) => {
        try {
            const blob = await api.downloadTaskFile(task.id, fileIndex);
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = file.fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Download failed:", error);
            alert("Failed to download file: " + error.message);
        }
    };

    const handleSubmit = async () => {
        if (!file) {
            alert('Please select a file');
            return;
        }

        setSubmitting(true);
        try {
            // Pass the single file, matching the new backend endpoint
            await api.submitSolution(user.id, task.id, file);
            alert('Solution submitted successfully!');
            onClose();
        } catch (error) {
            alert('Failed to submit solution: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-xl z-10">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">{task.name}</h2>
                            <p className="text-indigo-100">{task.description}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {/* Task Files */}
                    {task.files && task.files.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-3 flex items-center">
                                <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                                Dataset Files
                            </h3>
                            <div className="grid gap-3">
                                {task.files.map((file, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <FileText className="w-5 h-5 text-gray-500" />
                                            <div>
                                                <div className="font-medium text-gray-900">{file.fileName}</div>
                                                <div className="text-xs text-gray-500">{file.contentType}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDownload(idx, file)}
                                            className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm flex items-center space-x-1"
                                        >
                                            <Download className="w-4 h-4" />
                                            <span>Download</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Submit Solution (Only for PARTICIPANT) */}
                    {user.role === 'PARTICIPANT' && (
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold mb-3 flex items-center">
                                <Upload className="w-5 h-5 mr-2 text-indigo-600" />
                                Submit Your Solution
                            </h3>

                            <div className="space-y-4">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-500 transition-colors">
                                    <input
                                        type="file"
                                        // multiple // <-- Removed multiple
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="file-upload"
                                        accept=".csv,.json,.py,.ipynb,.zip"
                                    />
                                    <label htmlFor="file-upload" className="cursor-pointer">
                                        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                                        <p className="text-gray-600 mb-1">Click to upload a file</p>
                                        <p className="text-sm text-gray-500">CSV, JSON, Python, ZIP, etc.</p>
                                    </label>
                                </div>

                                {file && ( // <-- Show single file
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
                                            <span className="text-sm text-green-800">{file.name}</span>
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting || !file} // <-- Check single file
                                    className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-7V00 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors"
                                >
                                    {submitting ? 'Submitting...' : 'Submit Solution'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


export const ChallengesPage = ({ api, cache }) => {
    const { user } = useAuth(); // <-- Get user
    const { selectedHackathon } = useHackathon();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState(null);

    // This now loads tasks based on role
    useEffect(() => {
        setLoading(true);
        if (user.role === 'PARTICIPANT') {
            // --- PARTICIPANT LOGIC ---
            if (!selectedHackathon) {
                setTasks([]);
                setLoading(false);
                return; // Wait for selection
            }
            const allTasks = cache.getAllTasks();
            // --- FIX: Use 'tasks' instead of 'taskIds' ---
            const hackathonTaskIds = selectedHackathon.tasks || [];
            const filteredTasks = allTasks.filter(task => hackathonTaskIds.includes(task.id));
            setTasks(filteredTasks);
            setLoading(false);
        } else {
            // --- ADMIN/JUDGE LOGIC ---
            api.getTasks()
                .then(data => {
                    setTasks(data);
                })
                .catch(error => {
                    console.error('Failed to load tasks:', error);
                    alert('Failed to load tasks: ' + error.message);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [api, cache, selectedHackathon, user.role]);

    if (loading) return <LoadingSpinner />;

    // Conditional title
    const title = (user.role === 'PARTICIPANT' && selectedHackathon)
        ? `Challenges for ${selectedHackathon.name}`
        : "All Active Challenges";

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">{title}</h1>

            {tasks.length === 0 ? (
                <EmptyState icon={Code} message="No challenges available." />
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tasks.map(task => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onClick={() => setSelectedTask(task)}
                        />
                    ))}
                </div>
            )}

            {selectedTask && (
                <TaskDetailModal
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                    api={api}
                />
            )}
        </div>
    );
};
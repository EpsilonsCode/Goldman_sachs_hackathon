// src/App.js
import React, { useEffect, useState, useMemo } from "react";
import {
    ChevronDown, Upload, Trophy, Users, Calendar,
    CheckCircle, XCircle, AlertCircle, LogOut, Settings,
    Plus, FileText, Code, Database, BarChart3, Clock, Award,
    Menu, X, Download, Trash2, Edit
} from 'lucide-react';
import { AuthProvider, useAuth } from "./AuthProvider";

// Reusable hook to fetch users/tasks for mapping IDs to names
const useDataCache = (api) => {
    const [users, setUsers] = useState(new Map());
    const [tasks, setTasks] = useState(new Map());

    const loadData = async () => {
        if (!api) return;
        try {
            const usersData = await api.getUsers();
            setUsers(new Map(usersData.map(u => [u.id, u.username])));
        } catch (e) {
            console.error("Failed to fetch users", e);
        }
        try {
            const tasksData = await api.getTasks();
            setTasks(new Map(tasksData.map(t => [t.id, t.name])));
        } catch (e) {
            console.error("Failed to fetch tasks", e);
        }
    };

    useEffect(() => {
        loadData();
    }, [api]);

    return {
        getUserName: (id) => users.get(id) || 'Unknown User',
        getTaskName: (id) => tasks.get(id) || 'Unknown Task',
        refresh: loadData // Function to manually refresh cache
    };
};

// --- Navigation Component ---
const Navigation = ({ api }) => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('challenges');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const tabs = [
        { id: 'challenges', label: 'Challenges', icon: Code, roles: ['PARTICIPANT', 'ADMIN', 'JUDGE'] },
        { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, roles: ['PARTICIPANT', 'ADMIN', 'JUDGE'] },
        { id: 'submissions', label: 'My Submissions', icon: FileText, roles: ['PARTICIPANT'] },
        { id: 'admin', label: 'Admin Panel', icon: Settings, roles: ['ADMIN'] },
        { id: 'judge', label: 'Review', icon: CheckCircle, roles: ['JUDGE'] }
    ];

    const visibleTabs = tabs.filter(tab => tab.roles.includes(user?.role));

    return (
        <nav className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-2">
                        <Code className="w-8 h-8"/>
                        <span className="font-bold text-xl">HackPlatform</span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-1">
                        {visibleTabs.map(tab => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all ${
                                        activeTab === tab.id
                                            ? 'bg-white/20 backdrop-blur-sm'
                                            : 'hover:bg-white/10'
                                    }`}
                                >
                                    <Icon className="w-4 h-4"/>
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="hidden md:flex items-center space-x-4">
                        <div className="text-right">
                            <div className="text-sm font-medium">{user?.username}</div>
                            <div className="text-xs opacity-80">{user?.team_name || 'No team'}</div>
                        </div>
                        <button
                            onClick={logout}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5"/>
                        </button>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden pb-4">
                        {visibleTabs.map(tab => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveTab(tab.id);
                                        setMobileMenuOpen(false);
                                    }}
                                    className={`w-full px-4 py-3 flex items-center space-x-2 rounded-lg ${
                                        activeTab === tab.id ? 'bg-white/20' : 'hover:bg-white/10'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                        <div className="border-t border-white/20 mt-2 pt-2">
                            <div className="px-4 py-2 text-sm">{user?.username} ({user?.team_name})</div>
                            <button
                                onClick={logout}
                                className="w-full px-4 py-2 flex items-center space-x-2 hover:bg-white/10 rounded-lg"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Pass API client to the active tab content */}
            <TabContent activeTab={activeTab} api={api} />
        </nav>
    );
};

// --- Tab Content Router ---
const TabContent = ({ activeTab, api }) => {
    // Cache for mapping user/task IDs to names across pages
    const cache = useDataCache(api);

    return (
        <div className="min-h-screen bg-gray-50">
            {activeTab === 'challenges' && <ChallengesPage api={api} />}
            {activeTab === 'leaderboard' && <LeaderboardPage api={api} cache={cache} />}
            {activeTab === 'submissions' && <SubmissionsPage api={api} cache={cache} />}
            {activeTab === 'admin' && <AdminPage api={api} cache={cache} />}
            {activeTab === 'judge' && <JudgePage api={api} cache={cache} />}
        </div>
    );
};

// --- Reusable Loader ---
const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
);

// --- Reusable Empty State ---
const EmptyState = ({ icon: Icon, message }) => (
    <div className="text-center py-12 bg-white rounded-lg shadow">
        <Icon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">{message}</p>
    </div>
);

// --- Challenges Page ---
const ChallengesPage = ({ api }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState(null);

    const loadTasks = async () => {
        setLoading(true);
        try {
            const data = await api.getTasks();
            setTasks(data);
        } catch (error) {
            console.error('Failed to load tasks:', error);
            alert('Failed to load tasks: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if(api) loadTasks();
    }, [api]);

    if (loading) return <LoadingSpinner />;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Active Challenges</h1>

            {tasks.length === 0 ? (
                <EmptyState icon={Code} message="No challenges available yet" />
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
    const [files, setFiles] = useState(null); // Store FileList object

    const handleFileChange = (e) => {
        setFiles(e.target.files); // Store the FileList
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
        if (!files || files.length === 0) {
            alert('Please select at least one file');
            return;
        }

        setSubmitting(true);
        try {
            await api.submitSolution(user.id, task.id, files);
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

                    {/* Submit Solution */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold mb-3 flex items-center">
                            <Upload className="w-5 h-5 mr-2 text-indigo-600" />
                            Submit Your Solution
                        </h3>

                        <div className="space-y-4">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-500 transition-colors">
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="file-upload"
                                    accept=".csv,.json,.py,.ipynb,.zip"
                                />
                                <label htmlFor="file-upload" className="cursor-pointer">
                                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                                    <p className="text-gray-600 mb-1">Click to upload files</p>
                                    <p className="text-sm text-gray-500">CSV, JSON, Python, ZIP, etc.</p>
                                </label>
                            </div>

                            {files && files.length > 0 && (
                                <div className="space-y-2">
                                    {Array.from(files).map((file, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
                                            <span className="text-sm text-green-800">{file.name}</span>
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button
                                onClick={handleSubmit}
                                disabled={submitting || !files || files.length === 0}
                                className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors"
                            >
                                {submitting ? 'Submitting...' : 'Submit Solution'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Leaderboard Page ---
const LeaderboardPage = ({ api, cache }) => {
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState('');
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch all tasks for the dropdown
    useEffect(() => {
        if (!api) return;
        const loadTasks = async () => {
            try {
                const tasksData = await api.getTasks();
                setTasks(tasksData);
                if (tasksData.length > 0) {
                    setSelectedTask(tasksData[0].id); // Select first task by default
                } else {
                    setLoading(false);
                }
            } catch (error) {
                console.error('Failed to load tasks:', error);
                setLoading(false);
            }
        };
        loadTasks();
    }, [api]);

    // Fetch leaderboard when selectedTask changes
    useEffect(() => {
        if (!selectedTask || !api) return;

        const loadLeaderboard = async () => {
            setLoading(true);
            try {
                const data = await api.getLeaderboardForTask(selectedTask);
                setLeaderboard(data);
            } catch (error) {
                console.error('Failed to load leaderboard:', error);
                alert('Failed to load leaderboard: ' + error.message);
            } finally {
                setLoading(false);
            }
        };
        loadLeaderboard();
    }, [selectedTask, api]);

    const formatTimestamp = (isoString) => {
        if (!isoString) return 'N/A';
        return new Date(isoString).toLocaleString();
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <Trophy className="w-8 h-8 mr-3 text-yellow-500" />
                    Leaderboard
                </h1>
                <select
                    value={selectedTask}
                    onChange={(e) => setSelectedTask(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900" // <-- CSS FIX
                >
                    <option value="" disabled>Select a task</option>
                    {tasks.map(task => (
                        <option key={task.id} value={task.id}>{task.name}</option>
                    ))}
                </select>
            </div>

            {loading ? <LoadingSpinner /> : (
                leaderboard.length === 0 ? (
                    <EmptyState icon={BarChart3} message="No submissions for this task yet." />
                ) : (
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                            <tr>
                                <th className="px-6 py-4 text-left">Rank</th>
                                <th className="px-6 py-4 text-left">User</th>
                                <th className="px-6 py-4 text-right">Score</th>
                                <th className="px-6 py-4 text-right">Last Submission</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {leaderboard.map((entry, index) => (
                                <tr key={entry.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            {index + 1 <= 3 ? (
                                                <Award className={`w-6 h-6 mr-2 ${
                                                    index + 1 === 1 ? 'text-yellow-500' :
                                                        index + 1 === 2 ? 'text-gray-400' :
                                                            'text-orange-600'
                                                }`} />
                                            ) : (
                                                <span className="w-6 mr-2 text-center font-semibold text-gray-600">{index + 1}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{cache.getUserName(entry.user_id)}</td>
                                    <td className="px-6 py-4 text-right">
                                            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full font-semibold">
                                                {entry.score}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-gray-500 text-sm">{formatTimestamp(entry.submissionTimestamp)}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}
        </div>
    );
};

// --- Submissions Page ---
const SubmissionsPage = ({ api, cache }) => {
    const { user } = useAuth();
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !api) return;

        const loadSubmissions = async () => {
            setLoading(true);
            try {
                const data = await api.getSolutionsForUser(user.id);
                setSubmissions(data);
            } catch (error) {
                console.error('Failed to load submissions:', error);
                alert('Failed to load submissions: ' + error.message);
            } finally {
                setLoading(false);
            }
        };
        loadSubmissions();
    }, [api, user]);

    const formatTimestamp = (isoString) => {
        if (!isoString) return 'N/A';
        return new Date(isoString).toLocaleString();
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Submissions</h1>

            {submissions.length === 0 ? (
                <EmptyState icon={FileText} message="You have not made any submissions yet." />
            ) : (
                <div className="space-y-4">
                    {submissions.map(submission => (
                        <div key={submission.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg text-gray-900">{cache.getTaskName(submission.task_id)}</h3>
                                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                                        <span className="flex items-center">
                                            <Clock className="w-4 h-4 mr-1" />
                                            {formatTimestamp(submission.submissionTimestamp)}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-indigo-600">{submission.score}</div>
                                    <div className="flex items-center text-green-600 text-sm mt-1">
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        Evaluated
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- Admin Page ---
const AdminPage = ({ api, cache }) => {
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
            </div>

            {view === 'tasks' && <AdminTasksView api={api} cache={cache} />}
            {view === 'users' && <AdminUsersView api={api} />}
        </div>
    );
};

const AdminTasksView = ({ api, cache }) => {
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
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-600 text-gray-900" // <-- CSS FIX
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
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-600 text-gray-900" // <-- CSS FIX
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Task Files (Optional)</label>
                        <input
                            type="file"
                            multiple
                            onChange={(e) => setFiles(e.target.files)}
                            className="w-full text-gray-900" // <-- CSS FIX
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
                        className="flex-1 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 font-medium text-gray-900" // <-- CSS FIX
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
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-600 text-gray-900" // <-- CSS FIX
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
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-600 text-gray-900" // <-- CSS FIX
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
                                    className="w-full text-gray-900" // <-- CSS FIX
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
                            className="flex-1 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 font-medium text-gray-900" // <-- CSS FIX
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const AdminUsersView = ({ api }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null); // <-- NEW

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
                                    {/* --- NEW EDIT BUTTON --- */}
                                    <button
                                        onClick={() => setSelectedUser(user)}
                                        className="text-indigo-600 hover:text-indigo-800"
                                        title="Edit User"
                                    >
                                        <Edit className="w-5 h-5" />
                                    </button>
                                    {/* --------------------- */}
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
            {/* --- NEW EDIT MODAL RENDER --- */}
            {selectedUser && <EditUserModal api={api} user={selectedUser} onClose={() => setSelectedUser(null)} onSuccess={loadUsers} />}
        </div>
    );
};

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
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-gray-900" // <-- CSS FIX
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-gray-900" // <-- CSS FIX
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-gray-900" // <-- CSS FIX
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-gray-900" // <-- CSS FIX
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-gray-900" // <-- CSS FIX
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
                            className="flex-1 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 font-medium text-gray-900" // <-- CSS FIX
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- NEW COMPONENT ---
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500" // <-- CSS FIX (and disabled style)
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            disabled
                            value={user.email}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500" // <-- CSS FIX (and disabled style)
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-gray-900" // <-- CSS FIX
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-gray-900" // <-- CSS FIX
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
                            className="flex-1 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 font-medium text-gray-900" // <-- CSS FIX
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
// --------------------

// --- Judge Page ---
const JudgePage = ({ api, cache }) => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState(null);

    useEffect(() => {
        if (!api) return;
        const loadSubmissions = async () => {
            setLoading(true);
            try {
                const data = await api.getAllSolutions();
                setSubmissions(data);
            } catch (error) {
                console.error("Failed to load submissions:", error);
            } finally {
                setLoading(false);
            }
        };
        loadSubmissions();
    }, [api]);

    const formatTimestamp = (isoString) => new Date(isoString).toLocaleString();

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
                <CheckCircle className="w-8 h-8 mr-3 text-indigo-600" />
                Review Submissions
            </h1>

            {loading ? <LoadingSpinner /> : (
                submissions.length === 0 ? (
                    <EmptyState icon={CheckCircle} message="No submissions available for review." />
                ) : (
                    <div className="space-y-4">
                        {submissions.map(submission => (
                            <div key={submission.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold text-lg text-gray-900">
                                            {cache.getUserName(submission.user_id)}
                                        </h3>
                                        <p className="text-gray-600">{cache.getTaskName(submission.task_id)}</p>
                                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                            <span className="flex items-center">
                                                <Clock className="w-4 h-4 mr-1" />
                                                {formatTimestamp(submission.submissionTimestamp)}
                                            </span>
                                            <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full font-semibold">
                                                Score: {submission.score}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedSubmission(submission)}
                                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                    >
                                        Review
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}

            {selectedSubmission && (
                <ReviewModal
                    submission={selectedSubmission}
                    onClose={() => setSelectedSubmission(null)}
                    cache={cache}
                />
            )}
        </div>
    );
};

const ReviewModal = ({ submission, onClose, cache }) => {
    // Note: The backend does not currently support submitting a manual review.
    // This modal is read-only, fulfilling the "manual review capabilities"
    // by allowing a judge to see the submission details.

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-xl">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Review Submission</h2>
                            <p className="text-indigo-100">
                                {cache.getUserName(submission.user_id)} - {cache.getTaskName(submission.task_id)}
                            </p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <h3 className="font-semibold text-lg mb-2">Automated Score</h3>
                        <div className="text-3xl font-bold text-indigo-600">{submission.score}</div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-2">Submitted Files</h3>
                        <div className="space-y-2">
                            {submission.files.map((file, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-center space-x-3">
                                        <FileText className="w-5 h-5 text-gray-500" />
                                        <div>
                                            <div className="font-medium text-gray-900">{file.fileName}</div>
                                            <div className="text-xs text-gray-500">{file.contentType}</div>
                                        </div>
                                    </div>
                                    {/* Download is not directly supported here as it would require a new endpoint */}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex space-x-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 font-medium text-gray-900" // <-- CSS FIX
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- Main App Component ---
const App = () => {
    const { user, api, loading, error, login } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
                    <p className="text-white text-xl font-semibold">Loading HackPlatform...</p>
                </div>
            </div>
        );
    }

    if (!user || error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
                <div className="text-center bg-white rounded-xl p-8 shadow-2xl max-w-md">
                    <Code className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">HackPlatform</h1>
                    <p className="text-gray-600 mb-6">Welcome to the Hackathon Management Platform</p>
                    <button
                        onClick={login}
                        className="inline-block px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-lg transition-colors"
                    >
                        Login with Keycloak
                    </button>
                    <p className="text-sm text-gray-500 mt-4">Please authenticate to continue</p>
                </div>
            </div>
        );
    }

    // Pass the authenticated API client to the Navigation
    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation api={api} />
        </div>
    );
};

// --- Root Component with Provider ---
export default function HackathonPlatform() {
    return (
        <AuthProvider>
            <App />
        </AuthProvider>
    );
}
import React, { useEffect, useState } from "react";
import {
    ChevronDown, Upload, Trophy, Users, Calendar,
    CheckCircle, XCircle, AlertCircle, LogOut, Settings,
    Plus, FileText, Code, Database, BarChart3, Clock, Award,
    Menu, X
} from 'lucide-react';
import { AuthProvider, useAuth } from "./AuthProvider";

// Navigation Component
const Navigation = () => {
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
                            <div className="px-4 py-2 text-sm">{user?.username}</div>
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

            <TabContent activeTab={activeTab} />
        </nav>
    );
};

// Tab Content Router
const TabContent = ({ activeTab }) => {
    return (
        <div className="min-h-screen bg-gray-50">
            {activeTab === 'challenges' && <ChallengesPage />}
            {activeTab === 'leaderboard' && <LeaderboardPage />}
            {activeTab === 'submissions' && <SubmissionsPage />}
            {activeTab === 'admin' && <AdminPage />}
            {activeTab === 'judge' && <JudgePage />}
        </div>
    );
};

// Challenges Page
const ChallengesPage = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState(null);

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            const data = await api.getTasks();
            setTasks(data);
        } catch (error) {
            console.error('Failed to load tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Active Challenges</h1>

            {tasks.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <Code className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">No challenges available yet</p>
                </div>
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
                />
            )}
        </div>
    );
};

// Task Card Component
const TaskCard = ({ task, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-indigo-500 p-6"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Database className="w-6 h-6 text-indigo-600" />
                    <h3 className="font-bold text-lg text-gray-900">{task.name}</h3>
                </div>
            </div>

            <p className="text-gray-600 mb-4 line-clamp-3">{task.description}</p>

            <div className="flex items-center justify-between text-sm">
        <span className="flex items-center text-gray-500">
          <FileText className="w-4 h-4 mr-1" />
            {task.file?.length || 0} files
        </span>
                <button className="text-indigo-600 hover:text-indigo-800 font-medium">
                    View Details →
                </button>
            </div>
        </div>
    );
};

// Task Detail Modal
const TaskDetailModal = ({ task, onClose }) => {
    const [submitting, setSubmitting] = useState(false);
    const [files, setFiles] = useState([]);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        Promise.all(
            selectedFiles.map(file => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        resolve({
                            fileName: file.name,
                            contentType: file.type,
                            dataBase64: e.target.result.split(',')[1]
                        });
                    };
                    reader.readAsDataURL(file);
                });
            })
        ).then(setFiles);
    };

    const handleSubmit = async () => {
        if (files.length === 0) {
            alert('Please select at least one file');
            return;
        }

        setSubmitting(true);
        try {
            await api.submitSolution({
                task_id: task.id,
                file: files
            });
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
                <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-xl">
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
                    {task.file && task.file.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-3 flex items-center">
                                <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                                Dataset Files
                            </h3>
                            <div className="grid gap-3">
                                {task.file.map((file, idx) => (
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
                                            onClick={() => {
                                                const link = document.createElement('a');
                                                link.href = `data:${file.contentType};base64,${file.dataBase64}`;
                                                link.download = file.fileName;
                                                link.click();
                                            }}
                                            className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
                                        >
                                            Download
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
                                    accept=".csv,.json,.py,.ipynb"
                                />
                                <label htmlFor="file-upload" className="cursor-pointer">
                                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                                    <p className="text-gray-600 mb-1">Click to upload files</p>
                                    <p className="text-sm text-gray-500">CSV, JSON, Python, or Jupyter Notebooks</p>
                                </label>
                            </div>

                            {files.length > 0 && (
                                <div className="space-y-2">
                                    {files.map((file, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
                                            <span className="text-sm text-green-800">{file.fileName}</span>
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button
                                onClick={handleSubmit}
                                disabled={submitting || files.length === 0}
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

// Leaderboard Page
const LeaderboardPage = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock data - replace with actual API call
        setTimeout(() => {
            setLeaderboard([
                { rank: 1, team: 'Code Ninjas', score: 0.9876, submissions: 15, lastSubmission: '2 hours ago' },
                { rank: 2, team: 'Data Wizards', score: 0.9654, submissions: 12, lastSubmission: '3 hours ago' },
                { rank: 3, team: 'AI Warriors', score: 0.9432, submissions: 18, lastSubmission: '1 hour ago' },
            ]);
            setLoading(false);
        }, 500);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <Trophy className="w-8 h-8 mr-3 text-yellow-500" />
                    Leaderboard
                </h1>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                    <tr>
                        <th className="px-6 py-4 text-left">Rank</th>
                        <th className="px-6 py-4 text-left">Team</th>
                        <th className="px-6 py-4 text-right">Score</th>
                        <th className="px-6 py-4 text-right">Submissions</th>
                        <th className="px-6 py-4 text-right">Last Submission</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {leaderboard.map((entry) => (
                        <tr key={entry.rank} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                                <div className="flex items-center">
                                    {entry.rank <= 3 ? (
                                        <Award className={`w-6 h-6 mr-2 ${
                                            entry.rank === 1 ? 'text-yellow-500' :
                                                entry.rank === 2 ? 'text-gray-400' :
                                                    'text-orange-600'
                                        }`} />
                                    ) : (
                                        <span className="w-6 mr-2 text-center font-semibold text-gray-600">{entry.rank}</span>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900">{entry.team}</td>
                            <td className="px-6 py-4 text-right">
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full font-semibold">
                    {entry.score.toFixed(4)}
                  </span>
                            </td>
                            <td className="px-6 py-4 text-right text-gray-600">{entry.submissions}</td>
                            <td className="px-6 py-4 text-right text-gray-500 text-sm">{entry.lastSubmission}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Submissions Page
const SubmissionsPage = () => {
    const [submissions, setSubmissions] = useState([]);

    useEffect(() => {
        // Mock data
        setSubmissions([
            { id: '1', taskName: 'ML Challenge #1', score: 0.9234, status: 'evaluated', timestamp: '2024-01-15 10:30' },
            { id: '2', taskName: 'Data Analysis Task', score: 0.8765, status: 'evaluated', timestamp: '2024-01-14 15:20' },
            { id: '3', taskName: 'Prediction Challenge', score: null, status: 'pending', timestamp: '2024-01-15 11:45' },
        ]);
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Submissions</h1>

            <div className="space-y-4">
                {submissions.map(submission => (
                    <div key={submission.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <h3 className="font-semibold text-lg text-gray-900">{submission.taskName}</h3>
                                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                      {submission.timestamp}
                  </span>
                                </div>
                            </div>
                            <div className="text-right">
                                {submission.status === 'evaluated' ? (
                                    <div>
                                        <div className="text-2xl font-bold text-indigo-600">{submission.score.toFixed(4)}</div>
                                        <div className="flex items-center text-green-600 text-sm mt-1">
                                            <CheckCircle className="w-4 h-4 mr-1" />
                                            Evaluated
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center text-yellow-600">
                                        <AlertCircle className="w-5 h-5 mr-2" />
                                        Pending Evaluation
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Admin Page
const AdminPage = () => {
    const [view, setView] = useState('tasks');

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Panel</h1>

            <div className="flex space-x-4 mb-6">
                <button
                    onClick={() => setView('tasks')}
                    className={`px-4 py-2 rounded-lg ${view === 'tasks' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
                >
                    Manage Tasks
                </button>
                <button
                    onClick={() => setView('users')}
                    className={`px-4 py-2 rounded-lg ${view === 'users' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
                >
                    Manage Users
                </button>
            </div>

            {view === 'tasks' && <AdminTasksView />}
            {view === 'users' && <AdminUsersView />}
        </div>
    );
};

const AdminTasksView = () => {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '', file: [] });

    const handleFileUpload = (e) => {
        const selectedFiles = Array.from(e.target.files);
        Promise.all(
            selectedFiles.map(file => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        resolve({
                            fileName: file.name,
                            contentType: file.type,
                            dataBase64: e.target.result.split(',')[1]
                        });
                    };
                    reader.readAsDataURL(file);
                });
            })
        ).then(files => setFormData(prev => ({ ...prev, file: files })));
    };

    const handleSubmit = async () => {
        try {
            await api.createTask(formData);
            alert('Task created successfully!');
            setShowCreateForm(false);
            setFormData({ name: '', description: '', file: [] });
        } catch (error) {
            alert('Failed to create task: ' + error.message);
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

            {showCreateForm && (
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h3 className="text-xl font-bold mb-4">Create New Task</h3>
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Task Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-600"
                        />
                        <textarea
                            placeholder="Description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-600"
                        />
                        <input
                            type="file"
                            multiple
                            onChange={handleFileUpload}
                            className="w-full"
                        />
                        <div className="flex space-x-3">
                            <button
                                onClick={handleSubmit}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                                Create Task
                            </button>
                            <button
                                onClick={() => setShowCreateForm(false)}
                                className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const AdminUsersView = () => {
    const [users, setUsers] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await api.getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Failed to load users:', error);
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

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team</th>
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
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {showCreateForm && <CreateUserModal onClose={() => setShowCreateForm(false)} onSuccess={loadUsers} />}
        </div>
    );
};

const CreateUserModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'PARTICIPANT',
        team_name: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.createUser(formData);
            alert('User created successfully!');
            onSuccess();
            onClose();
        } catch (error) {
            alert('Failed to create user: ' + error.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-xl">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">Create New User</h2>
                        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg">
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                        />
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <button
                            type="submit"
                            className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                        >
                            Create User
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 font-medium"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Judge Page
const JudgePage = () => {
    const [submissions, setSubmissions] = useState([]);
    const [selectedSubmission, setSelectedSubmission] = useState(null);

    useEffect(() => {
        // Mock data - replace with actual API
        setSubmissions([
            {
                id: '1',
                team: 'Code Ninjas',
                taskName: 'ML Challenge #1',
                status: 'pending_review',
                submittedAt: '2024-01-15 10:30',
                score: 0.9234
            },
            {
                id: '2',
                team: 'Data Wizards',
                taskName: 'Data Analysis Task',
                status: 'pending_review',
                submittedAt: '2024-01-15 09:15',
                score: 0.8876
            },
        ]);
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
                <CheckCircle className="w-8 h-8 mr-3 text-indigo-600" />
                Review Submissions
            </h1>

            <div className="space-y-4">
                {submissions.map(submission => (
                    <div key={submission.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-lg text-gray-900">{submission.team}</h3>
                                <p className="text-gray-600">{submission.taskName}</p>
                                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                      {submission.submittedAt}
                  </span>
                                    <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full font-semibold">
                    Score: {submission.score.toFixed(4)}
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

                {submissions.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <CheckCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600">No submissions pending review</p>
                    </div>
                )}
            </div>

            {selectedSubmission && (
                <ReviewModal
                    submission={selectedSubmission}
                    onClose={() => setSelectedSubmission(null)}
                />
            )}
        </div>
    );
};

const ReviewModal = ({ submission, onClose }) => {
    const [feedback, setFeedback] = useState('');
    const [manualScore, setManualScore] = useState('');

    const handleApprove = () => {
        alert('Submission approved!');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-xl">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Review Submission</h2>
                            <p className="text-indigo-100">{submission.team} - {submission.taskName}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <h3 className="font-semibold text-lg mb-2">Automated Score</h3>
                        <div className="text-3xl font-bold text-indigo-600">{submission.score.toFixed(4)}</div>
                    </div>

                    <div>
                        <label className="block font-semibold text-gray-700 mb-2">Manual Score Adjustment (Optional)</label>
                        <input
                            type="number"
                            step="0.0001"
                            placeholder="Enter manual score"
                            value={manualScore}
                            onChange={(e) => setManualScore(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                        />
                    </div>

                    <div>
                        <label className="block font-semibold text-gray-700 mb-2">Feedback</label>
                        <textarea
                            rows={4}
                            placeholder="Provide feedback to the team..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                        />
                    </div>

                    <div className="flex space-x-3">
                        <button
                            onClick={handleApprove}
                            className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center justify-center"
                        >
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Approve
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 font-medium"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Main App Component
const App = () => {
    const { user, loading, error, login } = useAuth();

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

    // If we get here without a user, show login button
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

    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation />
        </div>
    );
};

// Root Component with Provider
export default function HackathonPlatform() {
    return (
        <AuthProvider>
            <App />
        </AuthProvider>
    );
}
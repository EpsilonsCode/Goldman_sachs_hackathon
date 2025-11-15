// src/pages/LeaderboardPage.js
import React, { useEffect, useState } from "react";
import { useAuth, useHackathon } from "../AuthProvider";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { EmptyState } from "../components/EmptyState";
import { Trophy, Award, BarChart3 } from 'lucide-react';

export const LeaderboardPage = ({ api, cache }) => {
    const { user } = useAuth(); // <-- Get user
    const { selectedHackathon } = useHackathon();
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState('');
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch and filter tasks for the dropdown based on role
    useEffect(() => {
        if (!api) return;

        let taskSource;
        if (user.role === 'PARTICIPANT') {
            if (!selectedHackathon) {
                setTasks([]);
                return; // Wait for selection
            }
            const allTasks = cache.getAllTasks();
            // --- FIX: Use 'tasks' instead of 'taskIds' ---
            const hackathonTaskIds = selectedHackathon.tasks || [];
            taskSource = allTasks.filter(task => hackathonTaskIds.includes(task.id));
        } else {
            // ADMIN/JUDGE
            taskSource = cache.getAllTasks();
        }

        setTasks(taskSource);

        if (taskSource.length > 0) {
            setSelectedTask(taskSource[0].id); // Select first task by default
        } else {
            setSelectedTask('');
            setLeaderboard([]);
        }
    }, [api, cache, selectedHackathon, user.role]);

    // Fetch leaderboard when selectedTask changes
    useEffect(() => {
        if (!selectedTask || !api) {
            setLoading(false);
            return;
        }

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
                    className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                >
                    <option value="">Select a challenge...</option>
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
                                <th className="px-6 py-4 text-right">Submission Time</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {leaderboard.map((entry, index) => (
                                <tr key={entry.id || entry.userId} className="hover:bg-gray-50">
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
                                    <td className="px-6 py-4 font-medium text-gray-900">{cache.getUserName(entry.userId)}</td>
                                    <td className="px-6 py-4 text-right">
                                            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full font-semibold">
                                                {entry.bestScore}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-gray-500 text-sm">{formatTimestamp(entry.bestScoreTimestamp)}</td>
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
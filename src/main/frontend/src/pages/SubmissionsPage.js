// src/pages/SubmissionsPage.js
import React, { useEffect, useState } from "react";
import { useAuth } from "../AuthProvider";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { EmptyState } from "../components/EmptyState";
import { FileText, Clock, CheckCircle } from 'lucide-react';

export const SubmissionsPage = ({ api, cache }) => {
    const { user } = useAuth();
    // Stores the Map<String, List<Solution>>
    const [history, setHistory] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !api) return;

        const loadHistory = async () => {
            setLoading(true);
            try {
                // Use the new history endpoint
                const data = await api.getSubmissionHistory(user.id);
                setHistory(data);
            } catch (error) {
                console.error('Failed to load submission history:', error);
                alert('Failed to load history: ' + error.message);
            } finally {
                setLoading(false);
            }
        };
        loadHistory();
    }, [api, user]);

    const formatTimestamp = (isoString) => {
        if (!isoString) return 'N/A';
        return new Date(isoString).toLocaleString();
    };

    if (loading) return <LoadingSpinner />;

    const taskIds = history ? Object.keys(history) : [];

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Submission History</h1>

            {(!history || taskIds.length === 0) ? (
                <EmptyState icon={FileText} message="You have not made any submissions yet." />
            ) : (
                <div className="space-y-8">
                    {taskIds.map(taskId => (
                        <div key={taskId} className="bg-white rounded-lg shadow-lg overflow-hidden">
                            <h2 className="text-xl font-bold text-gray-900 p-6 bg-gray-50 border-b">
                                {cache.getTaskName(taskId)}
                            </h2>
                            <div className="divide-y divide-gray-200">
                                {history[taskId].map(submission => (
                                    <div key={submission.id} className="p-6 flex items-center justify-between hover:bg-gray-50">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-4 text-sm text-gray-600">
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
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
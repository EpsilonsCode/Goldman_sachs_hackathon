// src/pages/JudgePage.js
import React, { useEffect, useState, useCallback } from "react";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { EmptyState } from "../components/EmptyState";
import { CheckCircle, Clock, FileText, X, Save } from 'lucide-react';

const ReviewModal = ({ submission, onClose, cache, api, onSuccess }) => {
    // State for the new score
    const [newScore, setNewScore] = useState(submission.score);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // --- MODIFIED DTO ---
            const scoreDto = {
                solutionId: submission.id, // <-- THIS IS THE FIX
                userId: submission.userId,
                taskId: submission.taskId,
                newScore: parseInt(newScore, 10)
            };
            // --- END MODIFICATION ---

            await api.manualUpdateScore(scoreDto);
            alert('Score updated successfully!');
            onSuccess(); // Refresh the submissions list
            onClose();   // Close the modal
        } catch (error) {
            alert('Failed to update score: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-xl">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Review Submission</h2>
                            <p className="text-indigo-100">
                                {cache.getUserName(submission.userId)} - {cache.getTaskName(submission.taskId)}
                            </p>
                        </div>
                        <button type="button" onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <label htmlFor="manual-score" className="font-semibold text-lg mb-2 block">Manual Score</label>
                        <input
                            id="manual-score"
                            type="number"
                            value={newScore}
                            onChange={(e) => setNewScore(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-gray-900 text-2xl font-bold"
                        />
                        <p className="text-sm text-gray-500 mt-1">Automated Score was: {submission.score}</p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-2">Submitted File</h3>
                        <div className="space-y-2">
                            {/* The Solution model only has one `file`, not `files` */}
                            {submission.file ? (
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-center space-x-3">
                                        <FileText className="w-5 h-5 text-gray-500" />
                                        <div>
                                            <div className="font-medium text-gray-900">{submission.file.fileName}</div>
                                            <div className="text-xs text-gray-500">{submission.file.contentType}</div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">No file data for this submission.</p>
                            )}
                        </div>
                    </div>

                    <div className="flex space-x-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 font-medium text-gray-900"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:bg-gray-400 flex items-center justify-center space-x-2"
                        >
                            <Save className="w-5 h-5" />
                            <span>{submitting ? "Saving..." : "Save New Score"}</span>
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};


export const JudgePage = ({ api, cache }) => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState(null);

    // --- Refactored loadSubmissions ---
    const loadSubmissions = useCallback(async () => {
        if (!api) return;
        setLoading(true);
        try {
            // Uses new API path
            const data = await api.getAllSolutions();
            // Sort by most recent first
            data.sort((a, b) => new Date(b.submissionTimestamp) - new Date(a.submissionTimestamp));
            setSubmissions(data);
        } catch (error) {
            console.error("Failed to load submissions:", error);
        } finally {
            setLoading(false);
        }
    }, [api]); // Dependency array includes api

    useEffect(() => {
        loadSubmissions();
    }, [loadSubmissions]); // useEffect now depends on the stable loadSubmissions function

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
                                            {cache.getUserName(submission.userId)}
                                        </h3>
                                        <p className="text-gray-600">{cache.getTaskName(submission.taskId)}</p>
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
                    api={api} // <-- Pass api
                    onSuccess={loadSubmissions} // <-- Pass refresh function
                />
            )}
        </div>
    );
};
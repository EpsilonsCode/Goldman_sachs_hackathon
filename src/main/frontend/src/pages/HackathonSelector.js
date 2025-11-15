// src/pages/HackathonSelector.js
import React from "react";
import { useAuth, useHackathon } from "../AuthProvider";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { EmptyState } from "../components/EmptyState";
import { Briefcase, Users, Database } from "lucide-react";

export const HackathonSelector = () => {
    const { myHackathons, selectHackathon, loadingHackathons } = useHackathon();
    const { user } = useAuth();

    if (loadingHackathons) {
        return <LoadingSpinner />;
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {user.username}!</h1>
            <p className="text-lg text-gray-600 mb-8">Please select a hackathon to continue.</p>

            {myHackathons.length === 0 ? (
                <EmptyState icon={Briefcase} message="You are not registered for any hackathons." />
            ) : (
                <div className="grid md:grid-cols-2 gap-6">
                    {myHackathons.map(hack => (
                        <div
                            key={hack.id}
                            onClick={() => selectHackathon(hack)}
                            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-indigo-500 p-6"
                        >
                            <div className="flex items-center space-x-3 mb-3">
                                <Briefcase className="w-8 h-8 text-indigo-600" />
                                <h2 className="text-2xl font-bold text-gray-900">{hack.name}</h2>
                            </div>
                            <p className="text-gray-600 mb-4 line-clamp-2">{hack.description || "No description."}</p>
                            <div className="flex justify-between items-center text-sm text-gray-500">
                                <span className="flex items-center">
                                    <Users className="w-4 h-4 mr-1" />
                                    {/* --- FIX: Use 'users' --- */}
                                    {hack.users?.length || 0} Participants
                                </span>
                                <span className="flex items-center">
                                    <Database className="w-4 h-4 mr-1" />
                                    {/* --- FIX: Use 'tasks' --- */}
                                    {hack.tasks?.length || 0} Challenges
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
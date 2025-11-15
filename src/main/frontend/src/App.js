// src/App.js
import React, { useState } from "react";
import {
    Code,
} from 'lucide-react';
import { AuthProvider, useAuth, HackathonProvider, useHackathon } from "./AuthProvider";
import { useDataCache } from "./hooks/useDataCache";
import { Navigation } from "./components/Navigation";
import { MinimalHeader } from "./components/MinimalHeader";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { HackathonSelector } from "./pages/HackathonSelector";
import { ChallengesPage } from "./pages/ChallengesPage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { SubmissionsPage } from "./pages/SubmissionsPage";
import { AdminPage } from "./pages/admin/AdminPage";
import { JudgePage } from "./pages/JudgePage";

// --- Tab Content Router (MOVED HERE) ---
const TabContent = ({ activeTab, api }) => {
    // Cache for mapping user/task IDs to names across pages
    const cache = useDataCache(api);

    return (
        <div className="min-h-screen bg-gray-50">
            {activeTab === 'challenges' && <ChallengesPage api={api} cache={cache} />}
            {activeTab === 'leaderboard' && <LeaderboardPage api={api} cache={cache} />}
            {activeTab === 'submissions' && <SubmissionsPage api={api} cache={cache} />}
            {activeTab === 'admin' && <AdminPage api={api} cache={cache} />}
            {activeTab === 'judge' && <JudgePage api={api} cache={cache} />}
        </div>
    );
};


// --- Main App Component (UPDATED) ---
const App = () => {
    const { user, api, loading, error, login } = useAuth();
    // Get hackathon context for routing
    const { selectedHackathon, loadingHackathons } = useHackathon();

    // --- STATE LIFTED UP ---
    const [activeTab, setActiveTab] = useState('challenges');

    if (loading || loadingHackathons) {
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

    // --- NEW PARTICIPANT ROUTING ---
    // If the user is a participant AND no hackathon is selected,
    // show the selector screen instead of the main app.
    if (user.role === 'PARTICIPANT' && !selectedHackathon) {
        return (
            <div className="min-h-screen bg-gray-50">
                {/* ADD THE MINIMAL HEADER WITH LOGOUT */}
                <MinimalHeader />
                <HackathonSelector />
            </div>
        );
    }

    // Otherwise, show the main app (for Admins, Judges, or Participants who have selected a hackathon)
    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation
                api={api}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />
            <TabContent
                activeTab={activeTab}
                api={api}
            />
        </div>
    );
};

// --- Root Component with Provider ---
export default function HackPlatform() {
    return (
        // Wrap the app in BOTH providers
        <AuthProvider>
            <HackathonProvider>
                <App />
            </HackathonProvider>
        </AuthProvider>
    );
}
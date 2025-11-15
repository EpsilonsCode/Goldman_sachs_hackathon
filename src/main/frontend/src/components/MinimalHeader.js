// src/components/MinimalHeader.js
import React from "react";
import { useAuth } from "../AuthProvider";
import { Code, LogOut } from "lucide-react";

export const MinimalHeader = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-2">
                        <Code className="w-8 h-8"/>
                        <span className="font-bold text-xl">HackPlatform</span>
                    </div>
                    <div className="flex items-center space-x-4">
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
                </div>
            </div>
        </nav>
    );
};
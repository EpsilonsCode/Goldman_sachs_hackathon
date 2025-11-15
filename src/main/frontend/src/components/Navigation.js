// src/components/Navigation.js
import React, { useState } from "react";
import {
    Code, Trophy, FileText, Settings, CheckCircle, LogOut,
    Menu, X, Briefcase, ArrowRightLeft
} from 'lucide-react';
import { useAuth, useHackathon } from "../AuthProvider";
// import { TabContent } from "../App"; // <-- REMOVED

export const Navigation = ({ api, activeTab, setActiveTab }) => { // <-- PROPS ADDED
    const { user, logout } = useAuth();
    // Get hackathon context
    const { selectedHackathon, clearHackathon } = useHackathon();
    // const [activeTab, setActiveTab] = useState('challenges'); // <-- STATE REMOVED
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
                        {/* NEW: Show selected hackathon and switch button */}
                        {user.role === 'PARTICIPANT' && selectedHackathon && (
                            <div className="flex items-center space-x-2 pl-2 border-l border-white/30 ml-2">
                                <Briefcase className="w-5 h-5 opacity-80" />
                                <span className="font-medium">{selectedHackathon.name}</span>
                                <button
                                    onClick={clearHackathon}
                                    className="p-1 rounded-lg hover:bg-white/10"
                                    title="Switch Hackathon"
                                >
                                    <ArrowRightLeft className="w-4 h-4" />
                                </button>
                            </div>
                        )}
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
                        {/* NEW: Mobile Switch Hackathon */}
                        {user.role === 'PARTICIPANT' && selectedHackathon && (
                            <div className="px-4 py-3 border-b border-white/20">
                                <div className="text-sm font-medium">{selectedHackathon.name}</div>
                                <button
                                    onClick={() => {
                                        clearHackathon();
                                        setMobileMenuOpen(false);
                                    }}
                                    className="text-sm opacity-80 flex items-center space-x-1"
                                >
                                    <ArrowRightLeft className="w-4 h-4" />
                                    <span>Switch Hackathon</span>
                                </button>
                            </div>
                        )}
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

            {/* TabContent render REMOVED from here */}
        </nav>
    );
};
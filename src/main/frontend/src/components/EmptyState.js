// src/components/EmptyState.js
import React from "react";

export const EmptyState = ({ icon: Icon, message }) => (
    <div className="text-center py-12 bg-white rounded-lg shadow">
        <Icon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">{message}</p>
    </div>
);
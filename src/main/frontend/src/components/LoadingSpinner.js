// src/components/LoadingSpinner.js
import React from "react";

export const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
);
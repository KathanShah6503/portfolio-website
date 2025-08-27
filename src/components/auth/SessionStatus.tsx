/**
 * Session status component
 * Displays current authentication status and session information
 */

import React from "react";
import { useAuth } from "../../contexts/AuthContext";

export interface SessionStatusProps {
    className?: string;
    showTimeRemaining?: boolean;
}

export const SessionStatus: React.FC<SessionStatusProps> = ({ 
    className = "", 
    showTimeRemaining = true 
}) => {
    const { isAuthenticated, sessionTimeRemaining, logout, extendSession } = useAuth();

    if (!isAuthenticated) {
        return null;
    }

    const formatTimeRemaining = (milliseconds: number): string => {
        const minutes = Math.floor(milliseconds / 60000);
        const seconds = Math.floor((milliseconds % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    const handleExtendSession = () => {
        const extended = extendSession();
        if (!extended) {
            console.warn("Failed to extend session");
        }
    };

    const isSessionExpiringSoon = sessionTimeRemaining < 5 * 60 * 1000; // Less than 5 minutes

    return (
        <div className={`flex items-center space-x-4 ${className}`}>
            <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Authenticated</span>
            </div>

            {showTimeRemaining && (
                <div className="flex items-center space-x-2">
                    <span className={`text-sm ${isSessionExpiringSoon ? "text-orange-600" : "text-gray-600"}`}>
                        Session: {formatTimeRemaining(sessionTimeRemaining)}
                    </span>
                    
                    {isSessionExpiringSoon && (
                        <button
                            onClick={handleExtendSession}
                            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Extend
                        </button>
                    )}
                </div>
            )}

            <button
                onClick={logout}
                className="text-sm px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
                Logout
            </button>
        </div>
    );
};
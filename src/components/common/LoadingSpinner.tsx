/**
 * Loading spinner component for async operations
 * Provides consistent loading UI across the application
 */

import React from "react";

export interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg";
    message?: string;
    className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
    size = "md", 
    message = "Loading...", 
    className = "" 
}) => {
    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-8 h-8",
        lg: "w-12 h-12"
    };

    const textSizeClasses = {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg"
    };

    return (
        <div className={`flex flex-col items-center justify-center p-4 ${className}`}>
            <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`}></div>
            {message && (
                <p className={`mt-2 text-gray-600 ${textSizeClasses[size]}`}>
                    {message}
                </p>
            )}
        </div>
    );
};
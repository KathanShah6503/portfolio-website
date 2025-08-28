/**
 * Main layout component that wraps the entire application
 * Provides consistent structure and responsive design
 */

import React from "react";
import type { ReactNode } from "react";
import { Navigation } from "./Navigation";
import { useApp } from "../../contexts/AppContext";

export interface LayoutProps {
    children: ReactNode;
    currentSection: string;
    onSectionChange: (section: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentSection, onSectionChange }) => {
    const { isEditMode, error } = useApp();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Edit Mode Indicator */}
            {isEditMode && (
                <div className="bg-green-500 text-white text-center py-2 px-4 text-sm font-medium">
                    🔧 Edit Mode Active - Changes will be saved automatically
                </div>
            )}

            {/* Error Banner */}
            {error && (
                <div className="bg-red-500 text-white text-center py-2 px-4 text-sm font-medium">
                    ⚠️ {error}
                </div>
            )}

            {/* Navigation */}
            <Navigation currentSection={currentSection} onSectionChange={onSectionChange} />

            {/* Main Content */}
            <main className="flex-1">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {children}
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center text-gray-600">
                        <p>&copy; {new Date().getFullYear()} Portfolio Website. Built with React & TypeScript.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};
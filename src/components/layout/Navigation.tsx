/**
 * Main navigation component with responsive design
 * Provides navigation between portfolio sections
 */

import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useApp } from "../../contexts/AppContext";

export interface NavigationProps {
    currentSection: string;
    onSectionChange: (section: string) => void;
}

const navigationItems = [
    { id: "profile", label: "About", icon: "👤" },
    { id: "projects", label: "Projects", icon: "💼" },
    { id: "resume", label: "Resume", icon: "📄" },
    { id: "certificates", label: "Certificates", icon: "🏆" },
    { id: "contact", label: "Contact", icon: "📧" }
];

export const Navigation: React.FC<NavigationProps> = ({ currentSection, onSectionChange }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { isAuthenticated } = useAuth();
    const { isEditMode, toggleEditMode } = useApp();

    const handleSectionClick = (sectionId: string) => {
        onSectionChange(sectionId);
        setIsMobileMenuOpen(false); // Close mobile menu on selection
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(prev => !prev);
    };

    return (
        <nav className="bg-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo/Brand */}
                    <div className="flex items-center">
                        <button
                            onClick={() => handleSectionClick("profile")}
                            className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors"
                        >
                            Portfolio
                        </button>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navigationItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => handleSectionClick(item.id)}
                                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    currentSection === item.id
                                        ? "bg-blue-100 text-blue-700"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                }`}
                            >
                                <span>{item.icon}</span>
                                <span>{item.label}</span>
                            </button>
                        ))}
                        
                        {/* Edit Mode Toggle (only show if authenticated) */}
                        {isAuthenticated && (
                            <button
                                onClick={toggleEditMode}
                                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    isEditMode
                                        ? "bg-green-100 text-green-700"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                                title={isEditMode ? "Exit Edit Mode" : "Enter Edit Mode"}
                            >
                                <span>{isEditMode ? "✏️" : "🔒"}</span>
                                <span>{isEditMode ? "Editing" : "Edit"}</span>
                            </button>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        {/* Edit Mode Toggle for Mobile (only show if authenticated) */}
                        {isAuthenticated && (
                            <button
                                onClick={toggleEditMode}
                                className={`mr-2 p-2 rounded-md text-sm font-medium transition-colors ${
                                    isEditMode
                                        ? "bg-green-100 text-green-700"
                                        : "bg-gray-100 text-gray-600"
                                }`}
                                title={isEditMode ? "Exit Edit Mode" : "Enter Edit Mode"}
                            >
                                <span>{isEditMode ? "✏️" : "🔒"}</span>
                            </button>
                        )}
                        
                        <button
                            onClick={toggleMobileMenu}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                            aria-expanded="false"
                        >
                            <span className="sr-only">Open main menu</span>
                            {/* Hamburger icon */}
                            <svg
                                className={`${isMobileMenuOpen ? "hidden" : "block"} h-6 w-6`}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                            {/* Close icon */}
                            <svg
                                className={`${isMobileMenuOpen ? "block" : "hidden"} h-6 w-6`}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            <div className={`md:hidden ${isMobileMenuOpen ? "block" : "hidden"}`}>
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
                    {navigationItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleSectionClick(item.id)}
                            className={`flex items-center space-x-3 w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                                currentSection === item.id
                                    ? "bg-blue-100 text-blue-700"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                            }`}
                        >
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </nav>
    );
};
/**
 * Example component demonstrating authentication system usage
 * This shows how to integrate the AuthProvider, LoginForm, and protected content
 */

import React, { useState } from "react";
import { AuthProvider, useAuth, withAuth } from "../contexts/AuthContext";
import { LoginForm, SessionStatus } from "../components/auth";

// Example protected component
const ProtectedContent: React.FC = () => {
    return (
        <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
            <h2 className="text-xl font-semibold text-green-800 mb-4">
                🔒 Protected Content
            </h2>
            <p className="text-green-700 mb-4">
                This content is only visible when authenticated. You can now edit portfolio content!
            </p>
            <div className="space-y-2 text-sm text-green-600">
                <p>• Edit profile information</p>
                <p>• Manage projects</p>
                <p>• Update certificates</p>
                <p>• Modify social links</p>
            </div>
        </div>
    );
};

// Wrap the protected content with authentication
const AuthenticatedContent = withAuth(ProtectedContent, {
    fallback: (
        <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
                🔐 Authentication Required
            </h2>
            <p className="text-gray-600 mb-4">
                Please log in to access the content management features.
            </p>
        </div>
    )
});

// Main example component
const AuthExampleContent: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const [showLogin, setShowLogin] = useState(false);

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Portfolio Authentication System
                </h1>
                <p className="text-gray-600">
                    Secure content management for your portfolio website
                </p>
            </div>

            {/* Authentication Status */}
            <div className="bg-white p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">
                            Authentication Status
                        </h3>
                        <p className="text-sm text-gray-600">
                            {isAuthenticated ? "You are logged in" : "You are not logged in"}
                        </p>
                    </div>
                    
                    {isAuthenticated ? (
                        <SessionStatus />
                    ) : (
                        <button
                            onClick={() => setShowLogin(!showLogin)}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {showLogin ? "Hide Login" : "Show Login"}
                        </button>
                    )}
                </div>
            </div>

            {/* Login Form */}
            {!isAuthenticated && showLogin && (
                <div className="bg-white p-6 border border-gray-200 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Login to Edit Mode
                    </h3>
                    <LoginForm 
                        onSuccess={() => setShowLogin(false)}
                        className="max-w-sm"
                    />
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-sm text-blue-700">
                            <strong>Demo Password:</strong> admin123
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                            (In production, change this in AuthService.ts)
                        </p>
                    </div>
                </div>
            )}

            {/* Protected Content */}
            <AuthenticatedContent />

            {/* Feature Overview */}
            <div className="bg-white p-6 border border-gray-200 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Authentication Features
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <h4 className="font-medium text-gray-800 mb-2">Security</h4>
                        <ul className="space-y-1 text-gray-600">
                            <li>• Password-based authentication</li>
                            <li>• Session management with timeout</li>
                            <li>• Failed attempt tracking</li>
                            <li>• Account lockout protection</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-medium text-gray-800 mb-2">User Experience</h4>
                        <ul className="space-y-1 text-gray-600">
                            <li>• Automatic session extension</li>
                            <li>• Session time remaining display</li>
                            <li>• Protected component wrapper</li>
                            <li>• React context integration</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Main example component with AuthProvider
export const AuthExample: React.FC = () => {
    return (
        <AuthProvider>
            <AuthExampleContent />
        </AuthProvider>
    );
};
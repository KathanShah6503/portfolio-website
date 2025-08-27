/**
 * Login form component for authentication
 * Provides a simple form for password-based authentication
 */

import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

export interface LoginFormProps {
    onSuccess?: () => void;
    className?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, className = "" }) => {
    const { login, lockoutInfo } = useAuth();
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (lockoutInfo.isLockedOut) {
            setError(`Account locked. Try again in ${lockoutInfo.remainingMinutes} minutes.`);
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const result = await login(password);

            if (result.success) {
                setPassword("");
                onSuccess?.();
            } else {
                setError(result.error || "Login failed");
            }
        } catch {
            setError("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                </label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading || lockoutInfo.isLockedOut}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Enter password"
                    required
                />
            </div>

            {error && (
                <div className="text-red-600 text-sm" role="alert">
                    {error}
                </div>
            )}

            {lockoutInfo.isLockedOut && (
                <div className="text-orange-600 text-sm" role="alert">
                    Account locked due to too many failed attempts.
                    Try again in {lockoutInfo.remainingMinutes} minutes.
                </div>
            )}

            <button
                type="submit"
                disabled={isLoading || lockoutInfo.isLockedOut || !password.trim()}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                {isLoading ? "Signing in..." : "Sign In"}
            </button>
        </form>
    );
};
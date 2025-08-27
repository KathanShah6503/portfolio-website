/**
 * Authentication context for React components
 * Provides authentication state and methods throughout the component tree
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { authService } from "../services/AuthService";

export interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    sessionTimeRemaining: number;
    lockoutInfo: { isLockedOut: boolean; remainingMinutes?: number };
    login: (password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    extendSession: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [sessionTimeRemaining, setSessionTimeRemaining] = useState<number>(0);
    const [lockoutInfo, setLockoutInfo] = useState<{ isLockedOut: boolean; remainingMinutes?: number }>({
        isLockedOut: false
    });

    // Update authentication state
    const updateAuthState = () => {
        const authenticated = authService.isAuthenticated();
        const timeRemaining = authService.getSessionTimeRemaining();
        const lockout = authService.getLockoutInfo();

        setIsAuthenticated(authenticated);
        setSessionTimeRemaining(timeRemaining);
        setLockoutInfo(lockout);
    };

    // Initialize authentication state
    useEffect(() => {
        updateAuthState();
        setIsLoading(false);
    }, []);

    // Set up periodic state updates
    useEffect(() => {
        const interval = setInterval(() => {
            updateAuthState();
        }, 1000); // Update every second for accurate countdown

        return () => clearInterval(interval);
    }, []);

    const handleLogin = async (password: string): Promise<{ success: boolean; error?: string }> => {
        const result = await authService.authenticate(password);
        
        if (result.success) {
            updateAuthState();
        } else {
            // Update lockout info after failed attempt
            setLockoutInfo(authService.getLockoutInfo());
        }
        
        return result;
    };

    const handleLogout = useCallback(() => {
        authService.logout();
        updateAuthState();
    }, []);

    // Auto-logout when session expires
    useEffect(() => {
        if (isAuthenticated && sessionTimeRemaining <= 0) {
            handleLogout();
        }
    }, [isAuthenticated, sessionTimeRemaining, handleLogout]);

    const handleExtendSession = (): boolean => {
        const extended = authService.extendSession();
        if (extended) {
            updateAuthState();
        }
        return extended;
    };

    const contextValue: AuthContextType = {
        isAuthenticated,
        isLoading,
        sessionTimeRemaining,
        lockoutInfo,
        login: handleLogin,
        logout: handleLogout,
        extendSession: handleExtendSession
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Custom hook to use authentication context
 * Throws error if used outside of AuthProvider
 */
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    
    return context;
};

/**
 * Higher-order component to protect routes/components that require authentication
 */
export interface WithAuthProps {
    fallback?: ReactNode;
}

export const withAuth = <P extends object>(
    Component: React.ComponentType<P>,
    options: WithAuthProps = {}
) => {
    const AuthenticatedComponent: React.FC<P> = (props) => {
        const { isAuthenticated, isLoading } = useAuth();
        
        if (isLoading) {
            return <div>Loading...</div>;
        }
        
        if (!isAuthenticated) {
            return options.fallback || <div>Access denied. Please log in.</div>;
        }
        
        return <Component {...props} />;
    };
    
    AuthenticatedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;
    
    return AuthenticatedComponent;
};
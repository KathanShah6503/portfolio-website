/**
 * Main application context for global state management
 * Manages edit mode state and portfolio data
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import type { PortfolioData } from "../types/portfolio";
import { contentManager } from "../services/ContentManager";

export interface AppContextType {
    portfolioData: PortfolioData | null;
    isEditMode: boolean;
    isLoading: boolean;
    error: string | null;
    toggleEditMode: () => void;
    setEditMode: (enabled: boolean) => void;
    reloadContent: () => Promise<void>;
    saveContent: (data: PortfolioData) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export interface AppProviderProps {
    children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
    const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Load initial content
    const loadContent = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await contentManager.loadContent();
            setPortfolioData(data);
        } catch (err) {
            console.error("Failed to load portfolio data:", err);
            setError("Failed to load portfolio data");
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initialize content on mount
    useEffect(() => {
        loadContent();
    }, [loadContent]);

    // Toggle edit mode
    const toggleEditMode = useCallback(() => {
        setIsEditMode(prev => !prev);
    }, []);

    // Set edit mode explicitly
    const setEditModeExplicit = useCallback((enabled: boolean) => {
        setIsEditMode(enabled);
    }, []);

    // Reload content from source
    const reloadContent = useCallback(async () => {
        await loadContent();
    }, [loadContent]);

    // Save content
    const saveContent = useCallback(async (data: PortfolioData) => {
        try {
            setError(null);
            await contentManager.saveContent(data);
            setPortfolioData(data);
        } catch (err) {
            console.error("Failed to save portfolio data:", err);
            setError("Failed to save portfolio data");
            throw err;
        }
    }, []);

    const contextValue: AppContextType = {
        portfolioData,
        isEditMode,
        isLoading,
        error,
        toggleEditMode,
        setEditMode: setEditModeExplicit,
        reloadContent,
        saveContent
    };

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};

/**
 * Custom hook to use app context
 * Throws error if used outside of AppProvider
 */
export const useApp = (): AppContextType => {
    const context = useContext(AppContext);
    
    if (context === undefined) {
        throw new Error("useApp must be used within an AppProvider");
    }
    
    return context;
};
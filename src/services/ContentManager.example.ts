/**
 * Example usage of ContentManager service
 * This file demonstrates how to use the ContentManager in your React components
 */

import { contentManager } from "./ContentManager";
import type { PortfolioData } from "../types/portfolio";
import { useState, useEffect } from "react";

// Example: Loading content in a React component
export async function loadPortfolioContent(): Promise<PortfolioData> {
    try {
        const content = await contentManager.loadContent();
        console.log("Portfolio content loaded:", content);
        return content;
    } catch (error) {
        console.error("Failed to load portfolio content:", error);
        throw error;
    }
}

// Example: Saving modified content
export async function savePortfolioContent(data: PortfolioData): Promise<void> {
    try {
        await contentManager.saveContent(data);
        console.log("Portfolio content saved successfully");
    } catch (error) {
        console.error("Failed to save portfolio content:", error);
        throw error;
    }
}

// Example: Exporting content for backup
export function exportPortfolioContent(): string {
    try {
        const jsonData = contentManager.exportContent();
        console.log("Portfolio content exported");
        return jsonData;
    } catch (error) {
        console.error("Failed to export portfolio content:", error);
        throw error;
    }
}

// Example: Importing content from backup
export function importPortfolioContent(jsonData: string): void {
    try {
        contentManager.importContent(jsonData);
        console.log("Portfolio content imported successfully");
    } catch (error) {
        console.error("Failed to import portfolio content:", error);
        throw error;
    }
}

// Example: Checking for local modifications
export function hasUnsavedChanges(): boolean {
    return contentManager.hasLocalModifications();
}

// Example: Resetting to default content
export async function resetToDefaults(): Promise<PortfolioData> {
    try {
        const defaultContent = await contentManager.resetToDefaults();
        console.log("Portfolio content reset to defaults");
        return defaultContent;
    } catch (error) {
        console.error("Failed to reset portfolio content:", error);
        throw error;
    }
}

// Example: React hook for using ContentManager
export function usePortfolioContent() {
    const [content, setContent] = useState<PortfolioData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadPortfolioContent()
            .then(setContent)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const saveContent = async (newContent: PortfolioData) => {
        try {
            await savePortfolioContent(newContent);
            setContent(newContent);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save content");
        }
    };

    const resetContent = async () => {
        try {
            setLoading(true);
            const defaultContent = await resetToDefaults();
            setContent(defaultContent);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to reset content");
        } finally {
            setLoading(false);
        }
    };

    return {
        content,
        loading,
        error,
        saveContent,
        resetContent,
        hasUnsavedChanges: hasUnsavedChanges(),
        exportContent: exportPortfolioContent,
        importContent: importPortfolioContent
    };
}


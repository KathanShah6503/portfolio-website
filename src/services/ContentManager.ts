/**
 * ContentManager service for handling portfolio data loading and saving
 * Implements JSON file loading from public directory and Local Storage integration
 */

import type { PortfolioData } from "../types/portfolio";
import { createDefaultPortfolioData, mergePortfolioData } from "../utils/dataHelpers";

export class ContentManager {
    private static readonly STORAGE_KEY = "portfolio_data";
    private static readonly DATA_PATH = "/data";

    private cache: PortfolioData | null = null;

    /**
     * Loads portfolio data with merge logic: Local Storage overrides JSON defaults
     */
    async loadContent(): Promise<PortfolioData> {
        try {
            // Load default data from JSON files
            const defaultData = await this.loadDefaultData();

            // Load any local modifications from Local Storage
            const localData = this.loadLocalData();

            // Merge local data over defaults
            const mergedData = localData ? mergePortfolioData(defaultData, localData) : defaultData;

            // Cache the result
            this.cache = mergedData;

            return mergedData;
        } catch (error) {
            console.error("Error loading content:", error);
            // Return default data structure if loading fails
            const defaultData = createDefaultPortfolioData();
            this.cache = defaultData;
            return defaultData;
        }
    }

    /**
     * Saves portfolio data to Local Storage
     */
    async saveContent(data: PortfolioData): Promise<void> {
        try {
            const jsonData = JSON.stringify(data, null, 2);
            localStorage.setItem(ContentManager.STORAGE_KEY, jsonData);

            // Update cache
            this.cache = data;
        } catch (error) {
            console.error("Error saving content to Local Storage:", error);
            throw new Error("Failed to save content");
        }
    }

    /**
     * Exports current portfolio data as JSON string
     */
    exportContent(): string {
        if (!this.cache) {
            throw new Error("No content loaded. Call loadContent() first.");
        }
        return JSON.stringify(this.cache, null, 2);
    }

    /**
     * Imports portfolio data from JSON string and saves to Local Storage
     */
    importContent(jsonData: string): void {
        try {
            const data = JSON.parse(jsonData) as PortfolioData;

            // Validate the imported data structure
            this.validatePortfolioData(data);

            // Save to Local Storage
            localStorage.setItem(ContentManager.STORAGE_KEY, jsonData);

            // Update cache
            this.cache = data;
        } catch (error) {
            console.error("Error importing content:", error);
            if (error instanceof SyntaxError) {
                throw new Error("Invalid JSON data or structure");
            }
            // Re-throw validation errors with their original message
            throw error;
        }
    }

    /**
     * Clears local modifications and reverts to default JSON data
     */
    async resetToDefaults(): Promise<PortfolioData> {
        localStorage.removeItem(ContentManager.STORAGE_KEY);
        this.cache = null;
        return await this.loadContent();
    }

    /**
     * Gets cached content without reloading
     */
    getCachedContent(): PortfolioData | null {
        return this.cache;
    }

    /**
     * Checks if there are local modifications
     */
    hasLocalModifications(): boolean {
        return localStorage.getItem(ContentManager.STORAGE_KEY) !== null;
    }

    /**
     * Loads default data from JSON files in public directory
     */
    private async loadDefaultData(): Promise<PortfolioData> {
        const defaultData = createDefaultPortfolioData();

        try {
            // Load individual JSON files
            const [profile, projects, resume, certificates, socialLinks, config] = await Promise.allSettled([
                this.loadJsonFile("profile.json"),
                this.loadJsonFile("projects.json"),
                this.loadJsonFile("resume.json"),
                this.loadJsonFile("certificates.json"),
                this.loadJsonFile("social-links.json"),
                this.loadJsonFile("config.json")
            ]);

            // Merge loaded data with defaults
            if (profile.status === "fulfilled" && profile.value) {
                defaultData.profile = { ...defaultData.profile, ...profile.value };
            }

            if (projects.status === "fulfilled" && Array.isArray(projects.value)) {
                defaultData.projects = projects.value;
            }

            if (resume.status === "fulfilled" && resume.value) {
                defaultData.resume = { ...defaultData.resume, ...resume.value };
            }

            if (certificates.status === "fulfilled" && Array.isArray(certificates.value)) {
                defaultData.certificates = certificates.value;
            }

            if (socialLinks.status === "fulfilled" && Array.isArray(socialLinks.value)) {
                defaultData.socialLinks = socialLinks.value;
            }

            if (config.status === "fulfilled" && config.value) {
                defaultData.config = { ...defaultData.config, ...config.value };
            }

            return defaultData;
        } catch (error) {
            console.warn("Some JSON files could not be loaded, using defaults:", error);
            return defaultData;
        }
    }

    /**
     * Loads a single JSON file from the public directory
     */
    private async loadJsonFile(filename: string): Promise<unknown> {
        const response = await fetch(`${ContentManager.DATA_PATH}/${filename}`);

        if (!response.ok) {
            throw new Error(`Failed to load ${filename}: ${response.status}`);
        }

        return await response.json();
    }

    /**
     * Loads portfolio data from Local Storage
     */
    private loadLocalData(): Partial<PortfolioData> | null {
        try {
            const storedData = localStorage.getItem(ContentManager.STORAGE_KEY);
            if (!storedData) {
                return null;
            }

            return JSON.parse(storedData) as Partial<PortfolioData>;
        } catch (error) {
            console.error("Error loading local data:", error);
            // Clear corrupted data
            localStorage.removeItem(ContentManager.STORAGE_KEY);
            return null;
        }
    }

    /**
     * Basic validation of portfolio data structure
     */
    private validatePortfolioData(data: unknown): asserts data is PortfolioData {
        if (!data || typeof data !== "object") {
            throw new Error("Invalid data: must be an object");
        }

        const dataObj = data as Record<string, unknown>;

        // Check required top-level properties
        const requiredProps = ["profile", "projects", "resume", "certificates", "socialLinks", "config"];
        for (const prop of requiredProps) {
            if (!(prop in dataObj)) {
                throw new Error(`Invalid data: missing required property '${prop}'`);
            }
        }

        // Basic type checks
        if (typeof dataObj.profile !== "object") {
            throw new Error("Invalid data: profile must be an object");
        }

        if (!Array.isArray(dataObj.projects)) {
            throw new Error("Invalid data: projects must be an array");
        }

        if (typeof dataObj.resume !== "object") {
            throw new Error("Invalid data: resume must be an object");
        }

        if (!Array.isArray(dataObj.certificates)) {
            throw new Error("Invalid data: certificates must be an array");
        }

        if (!Array.isArray(dataObj.socialLinks)) {
            throw new Error("Invalid data: socialLinks must be an array");
        }

        if (typeof dataObj.config !== "object") {
            throw new Error("Invalid data: config must be an object");
        }
    }
}

// Export singleton instance
export const contentManager = new ContentManager();
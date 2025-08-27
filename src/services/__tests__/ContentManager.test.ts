/**
 * Unit tests for ContentManager service
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ContentManager } from "../ContentManager";
import type { PortfolioData } from "../../types/portfolio";

// Mock fetch globally
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

// Mock localStorage
const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
};
Object.defineProperty(window, "localStorage", {
    value: mockLocalStorage
});

describe("ContentManager", () => {
    let contentManager: ContentManager;
    
    const mockProfileData = {
        name: "Test User",
        title: "Test Developer",
        photo: "/test.jpg",
        summary: "Test summary",
        description: "Test description",
        location: "Test City",
        email: "test@example.com"
    };
    
    const mockProjectsData = [
        {
            id: "test-project",
            title: "Test Project",
            description: "Test description",
            longDescription: "Long test description",
            technologies: ["React", "TypeScript"],
            images: ["/test.jpg"],
            category: "Web App",
            featured: true,
            completedDate: "2024-01-01"
        }
    ];

    const mockPortfolioData: PortfolioData = {
        profile: mockProfileData,
        projects: mockProjectsData,
        resume: {
            experience: [],
            education: [],
            skills: [],
            downloadUrl: "/test-resume.pdf"
        },
        certificates: [],
        socialLinks: [],
        config: {
            theme: "light",
            language: "en",
            analytics: { enabled: false },
            seo: {
                title: "Test Portfolio",
                description: "Test description",
                keywords: ["test"]
            }
        }
    };

    beforeEach(() => {
        contentManager = new ContentManager();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe("loadContent", () => {
        it("should load and merge JSON files with default data", async () => {
            // Mock successful fetch responses
            mockFetch
                .mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve(mockProfileData)
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve(mockProjectsData)
                })
                .mockResolvedValueOnce({
                    ok: false,
                    status: 404
                })
                .mockResolvedValueOnce({
                    ok: false,
                    status: 404
                })
                .mockResolvedValueOnce({
                    ok: false,
                    status: 404
                })
                .mockResolvedValueOnce({
                    ok: false,
                    status: 404
                });

            mockLocalStorage.getItem.mockReturnValue(null);

            const result = await contentManager.loadContent();

            expect(result.profile).toEqual(mockProfileData);
            expect(result.projects).toEqual(mockProjectsData);
            expect(mockFetch).toHaveBeenCalledTimes(6);
        });

        it("should merge local storage data over JSON defaults", async () => {
            const localModifications = {
                profile: {
                    name: "Modified Name"
                }
            };

            // Mock fetch for JSON files
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockProfileData)
            });

            mockLocalStorage.getItem.mockReturnValue(JSON.stringify(localModifications));

            const result = await contentManager.loadContent();

            expect(result.profile.name).toBe("Modified Name");
            expect(result.profile.title).toBe(mockProfileData.title); // Should keep other properties
        });

        it("should return default data when JSON files fail to load", async () => {
            mockFetch.mockRejectedValue(new Error("Network error"));
            mockLocalStorage.getItem.mockReturnValue(null);

            const result = await contentManager.loadContent();

            expect(result).toBeDefined();
            expect(result.profile).toBeDefined();
            expect(result.projects).toEqual([]);
        });

        it("should handle corrupted local storage data gracefully", async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockProfileData)
            });

            mockLocalStorage.getItem.mockReturnValue("invalid json");

            const result = await contentManager.loadContent();

            expect(result).toBeDefined();
            expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("portfolio_data");
        });
    });

    describe("saveContent", () => {
        it("should save portfolio data to local storage", async () => {
            await contentManager.saveContent(mockPortfolioData);

            expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
                "portfolio_data",
                JSON.stringify(mockPortfolioData, null, 2)
            );
        });

        it("should update cache after saving", async () => {
            await contentManager.saveContent(mockPortfolioData);

            const cached = contentManager.getCachedContent();
            expect(cached).toEqual(mockPortfolioData);
        });

        it("should throw error when localStorage fails", async () => {
            mockLocalStorage.setItem.mockImplementation(() => {
                throw new Error("Storage quota exceeded");
            });

            await expect(contentManager.saveContent(mockPortfolioData))
                .rejects.toThrow("Failed to save content");
        });
    });

    describe("exportContent", () => {
        it("should export cached content as JSON string", async () => {
            // Load content first to populate cache
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({})
            });
            mockLocalStorage.getItem.mockReturnValue(null);
            
            await contentManager.loadContent();

            const exported = contentManager.exportContent();
            expect(typeof exported).toBe("string");
            expect(() => JSON.parse(exported)).not.toThrow();
        });

        it("should throw error when no content is cached", () => {
            expect(() => contentManager.exportContent())
                .toThrow("No content loaded. Call loadContent() first.");
        });
    });

    describe("importContent", () => {
        it("should import valid JSON data", () => {
            const jsonData = JSON.stringify(mockPortfolioData);

            contentManager.importContent(jsonData);

            expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
                "portfolio_data",
                jsonData
            );
        });

        it("should update cache after importing", () => {
            const jsonData = JSON.stringify(mockPortfolioData);

            contentManager.importContent(jsonData);

            const cached = contentManager.getCachedContent();
            expect(cached).toEqual(mockPortfolioData);
        });

        it("should throw error for invalid JSON", () => {
            expect(() => contentManager.importContent("invalid json"))
                .toThrow("Invalid JSON data or structure");
        });

        it("should throw error for invalid data structure", () => {
            const invalidData = { invalid: "structure" };
            const jsonData = JSON.stringify(invalidData);

            expect(() => contentManager.importContent(jsonData))
                .toThrow("missing required property");
        });
    });

    describe("resetToDefaults", () => {
        it("should clear local storage and reload defaults", async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({})
            });

            const result = await contentManager.resetToDefaults();

            expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("portfolio_data");
            expect(result).toBeDefined();
        });
    });

    describe("hasLocalModifications", () => {
        it("should return true when local storage has data", () => {
            mockLocalStorage.getItem.mockReturnValue("some data");

            expect(contentManager.hasLocalModifications()).toBe(true);
        });

        it("should return false when local storage is empty", () => {
            mockLocalStorage.getItem.mockReturnValue(null);

            expect(contentManager.hasLocalModifications()).toBe(false);
        });
    });

    describe("getCachedContent", () => {
        it("should return null when no content is cached", () => {
            expect(contentManager.getCachedContent()).toBeNull();
        });

        it("should return cached content after loading", async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({})
            });
            mockLocalStorage.getItem.mockReturnValue(null);

            await contentManager.loadContent();

            const cached = contentManager.getCachedContent();
            expect(cached).not.toBeNull();
        });
    });

    describe("data validation", () => {
        it("should validate required properties", () => {
            const invalidData = {
                profile: {}
                // missing other required properties
            };

            expect(() => contentManager.importContent(JSON.stringify(invalidData)))
                .toThrow("missing required property");
        });

        it("should validate data types", () => {
            const invalidData = {
                profile: {},
                projects: "not an array", // should be array
                resume: {},
                certificates: [],
                socialLinks: [],
                config: {}
            };

            expect(() => contentManager.importContent(JSON.stringify(invalidData)))
                .toThrow("projects must be an array");
        });
    });
});
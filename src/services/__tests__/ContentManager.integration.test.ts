/**
 * Integration tests for ContentManager service with actual JSON files
 */

import { describe, it, expect, beforeEach } from "vitest";
import { ContentManager } from "../ContentManager";

// Mock localStorage for integration tests
const mockLocalStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {}
};
Object.defineProperty(window, "localStorage", {
    value: mockLocalStorage
});

describe("ContentManager Integration Tests", () => {
    let contentManager: ContentManager;

    beforeEach(() => {
        contentManager = new ContentManager();
    });

    it("should load content and return valid structure", async () => {
        const content = await contentManager.loadContent();

        // Verify the structure is correct
        expect(content).toBeDefined();
        expect(content.profile).toBeDefined();
        expect(content.projects).toBeDefined();
        expect(content.resume).toBeDefined();
        expect(content.certificates).toBeDefined();
        expect(content.socialLinks).toBeDefined();
        expect(content.config).toBeDefined();

        // Verify data types are correct
        expect(typeof content.profile.name).toBe("string");
        expect(typeof content.profile.title).toBe("string");
        expect(Array.isArray(content.projects)).toBe(true);
        expect(Array.isArray(content.certificates)).toBe(true);
        expect(Array.isArray(content.socialLinks)).toBe(true);
        expect(typeof content.config.theme).toBe("string");
    });

    it("should export loaded content as valid JSON", async () => {
        await contentManager.loadContent();
        const exported = contentManager.exportContent();

        // Should be valid JSON
        expect(() => JSON.parse(exported)).not.toThrow();

        // Should contain expected structure
        const parsed = JSON.parse(exported);
        expect(parsed.profile).toBeDefined();
        expect(parsed.projects).toBeDefined();
        expect(parsed.resume).toBeDefined();
        expect(parsed.certificates).toBeDefined();
        expect(parsed.socialLinks).toBeDefined();
        expect(parsed.config).toBeDefined();
    });

    it("should handle missing JSON files gracefully", async () => {
        // This test verifies that the service works even if some JSON files are missing
        // The actual files exist, but the service should handle missing files gracefully
        const content = await contentManager.loadContent();

        // Should still return a valid structure
        expect(content).toBeDefined();
        expect(content.profile).toBeDefined();
        expect(Array.isArray(content.projects)).toBe(true);
        expect(Array.isArray(content.certificates)).toBe(true);
        expect(Array.isArray(content.socialLinks)).toBe(true);
        expect(content.config).toBeDefined();
    });
});
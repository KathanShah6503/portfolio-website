/**
 * Unit tests for data helper functions
 */

import { describe, it, expect } from "vitest";
import {
    createDefaultPortfolioData,
    generateId,
    sortProjectsByDate,
    filterProjectsByCategory,
    getFeaturedProjects,
    formatDate,
    formatDateRange,
    calculateTotalExperience,
    getUniqueTechnologies,
    searchProjects,
    clonePortfolioData,
    mergePortfolioData
} from "../dataHelpers";

import type { ProjectData, ExperienceItem } from "../../types/portfolio";

describe("Data Helper Functions", () => {
    describe("createDefaultPortfolioData", () => {
        it("should create a valid default portfolio structure", () => {
            const defaultData = createDefaultPortfolioData();
      
            expect(defaultData).toHaveProperty("profile");
            expect(defaultData).toHaveProperty("projects");
            expect(defaultData).toHaveProperty("resume");
            expect(defaultData).toHaveProperty("certificates");
            expect(defaultData).toHaveProperty("socialLinks");
            expect(defaultData).toHaveProperty("config");
      
            expect(Array.isArray(defaultData.projects)).toBe(true);
            expect(Array.isArray(defaultData.certificates)).toBe(true);
            expect(Array.isArray(defaultData.socialLinks)).toBe(true);
        });
    });

    describe("generateId", () => {
        it("should generate unique IDs with prefix", () => {
            const id1 = generateId("test");
            const id2 = generateId("test");
      
            expect(id1).toMatch(/^test-\d+-[a-z0-9]+$/);
            expect(id2).toMatch(/^test-\d+-[a-z0-9]+$/);
            expect(id1).not.toBe(id2);
        });

        it("should use default prefix when none provided", () => {
            const id = generateId();
            expect(id).toMatch(/^item-\d+-[a-z0-9]+$/);
        });
    });

    describe("sortProjectsByDate", () => {
        const projects: ProjectData[] = [
            {
                id: "1",
                title: "Project 1",
                description: "Desc 1",
                longDescription: "Long desc 1",
                technologies: ["React"],
                images: [],
                category: "Web",
                featured: false,
                completedDate: "2023-01-15"
            },
            {
                id: "2",
                title: "Project 2",
                description: "Desc 2",
                longDescription: "Long desc 2",
                technologies: ["Vue"],
                images: [],
                category: "Web",
                featured: false,
                completedDate: "2023-06-20"
            },
            {
                id: "3",
                title: "Project 3",
                description: "Desc 3",
                longDescription: "Long desc 3",
                technologies: ["Angular"],
                images: [],
                category: "Web",
                featured: false,
                completedDate: "2023-03-10"
            }
        ];

        it("should sort projects by completion date (newest first)", () => {
            const sorted = sortProjectsByDate(projects);
      
            expect(sorted[0]?.id).toBe("2"); // June 2023
            expect(sorted[1]?.id).toBe("3"); // March 2023
            expect(sorted[2]?.id).toBe("1"); // January 2023
        });

        it("should not mutate original array", () => {
            const originalOrder = projects.map(p => p.id);
            sortProjectsByDate(projects);
      
            expect(projects.map(p => p.id)).toEqual(originalOrder);
        });
    });

    describe("filterProjectsByCategory", () => {
        const projects: ProjectData[] = [
            {
                id: "1",
                title: "Web App",
                description: "A web application",
                longDescription: "Long desc",
                technologies: ["React"],
                images: [],
                category: "Web Development",
                featured: false,
                completedDate: "2023-01-15"
            },
            {
                id: "2",
                title: "Mobile App",
                description: "A mobile application",
                longDescription: "Long desc",
                technologies: ["React Native"],
                images: [],
                category: "Mobile Development",
                featured: false,
                completedDate: "2023-06-20"
            }
        ];

        it("should filter projects by category (case insensitive)", () => {
            const webProjects = filterProjectsByCategory(projects, "web development");
            const mobileProjects = filterProjectsByCategory(projects, "Mobile Development");
      
            expect(webProjects).toHaveLength(1);
            expect(webProjects[0]?.id).toBe("1");
      
            expect(mobileProjects).toHaveLength(1);
            expect(mobileProjects[0]?.id).toBe("2");
        });
    });

    describe("getFeaturedProjects", () => {
        const projects: ProjectData[] = [
            {
                id: "1",
                title: "Featured Project",
                description: "Desc",
                longDescription: "Long desc",
                technologies: ["React"],
                images: [],
                category: "Web",
                featured: true,
                completedDate: "2023-01-15"
            },
            {
                id: "2",
                title: "Regular Project",
                description: "Desc",
                longDescription: "Long desc",
                technologies: ["Vue"],
                images: [],
                category: "Web",
                featured: false,
                completedDate: "2023-06-20"
            }
        ];

        it("should return only featured projects", () => {
            const featured = getFeaturedProjects(projects);
      
            expect(featured).toHaveLength(1);
            expect(featured[0]?.id).toBe("1");
            expect(featured[0]?.featured).toBe(true);
        });
    });

    describe("formatDate", () => {
        it("should format date string correctly", () => {
            const formatted = formatDate("2023-12-25");
            expect(formatted).toBe("December 25, 2023");
        });

        it("should accept custom formatting options", () => {
            const formatted = formatDate("2023-12-25", { year: "numeric", month: "short" });
            expect(formatted).toBe("Dec 2023");
        });
    });

    describe("formatDateRange", () => {
        it("should format date range with end date", () => {
            const range = formatDateRange("2023-01-15", "2023-06-20");
            expect(range).toBe("Jan 2023 - Jun 2023");
        });

        it("should format current position", () => {
            const range = formatDateRange("2023-01-15", undefined, true);
            expect(range).toBe("Jan 2023 - Present");
        });

        it("should format single date when no end date", () => {
            const range = formatDateRange("2023-01-15");
            expect(range).toBe("Jan 2023");
        });
    });

    describe("calculateTotalExperience", () => {
        const experience: ExperienceItem[] = [
            {
                id: "1",
                company: "Company A",
                position: "Developer",
                startDate: "2022-01-01",
                endDate: "2022-12-31",
                current: false,
                description: "Worked as developer",
                achievements: [],
                technologies: ["JavaScript"]
            },
            {
                id: "2",
                company: "Company B",
                position: "Senior Developer",
                startDate: "2023-01-01",
                current: true,
                description: "Working as senior developer",
                achievements: [],
                technologies: ["TypeScript"]
            }
        ];

        it("should calculate total years of experience", () => {
            const totalYears = calculateTotalExperience(experience);
            expect(totalYears).toBeGreaterThan(0);
        });
    });

    describe("getUniqueTechnologies", () => {
        const projects: ProjectData[] = [
            {
                id: "1",
                title: "Project 1",
                description: "Desc",
                longDescription: "Long desc",
                technologies: ["React", "TypeScript", "Node.js"],
                images: [],
                category: "Web",
                featured: false,
                completedDate: "2023-01-15"
            },
            {
                id: "2",
                title: "Project 2",
                description: "Desc",
                longDescription: "Long desc",
                technologies: ["Vue", "TypeScript", "Express"],
                images: [],
                category: "Web",
                featured: false,
                completedDate: "2023-06-20"
            }
        ];

        it("should return unique technologies sorted alphabetically", () => {
            const technologies = getUniqueTechnologies(projects);
      
            expect(technologies).toEqual(["Express", "Node.js", "React", "TypeScript", "Vue"]);
            expect(technologies).toHaveLength(5);
        });
    });

    describe("searchProjects", () => {
        const projects: ProjectData[] = [
            {
                id: "1",
                title: "React Dashboard",
                description: "A dashboard built with React",
                longDescription: "Comprehensive admin dashboard",
                technologies: ["React", "TypeScript"],
                images: [],
                category: "Web Development",
                featured: false,
                completedDate: "2023-01-15"
            },
            {
                id: "2",
                title: "Mobile App",
                description: "Cross-platform mobile application",
                longDescription: "Built with React Native",
                technologies: ["React Native", "JavaScript"],
                images: [],
                category: "Mobile Development",
                featured: false,
                completedDate: "2023-06-20"
            }
        ];

        it("should search by title", () => {
            const results = searchProjects(projects, "dashboard");
            expect(results).toHaveLength(1);
            expect(results[0]?.id).toBe("1");
        });

        it("should search by technology", () => {
            const results = searchProjects(projects, "react");
            expect(results).toHaveLength(2); // Both projects use React/React Native
        });

        it("should search by category", () => {
            const results = searchProjects(projects, "mobile");
            expect(results).toHaveLength(1);
            expect(results[0]?.id).toBe("2");
        });

        it("should be case insensitive", () => {
            const results = searchProjects(projects, "REACT");
            expect(results).toHaveLength(2);
        });
    });

    describe("clonePortfolioData", () => {
        it("should create a deep copy of portfolio data", () => {
            const original = createDefaultPortfolioData();
            original.profile.name = "John Doe";
      
            const cloned = clonePortfolioData(original);
            cloned.profile.name = "Jane Doe";
      
            expect(original.profile.name).toBe("John Doe");
            expect(cloned.profile.name).toBe("Jane Doe");
        });
    });

    describe("mergePortfolioData", () => {
        it("should merge partial updates with existing data", () => {
            const existing = createDefaultPortfolioData();
            existing.profile.name = "John Doe";
            existing.profile.email = "john@example.com";
      
            const updates: Partial<typeof existing> = {
                profile: {
                    ...existing.profile,
                    name: "Jane Doe"
                }
            };
      
            const merged = mergePortfolioData(existing, updates);
      
            expect(merged.profile.name).toBe("Jane Doe");
            expect(merged.profile.email).toBe("john@example.com"); // Should preserve existing
        });
    });
});
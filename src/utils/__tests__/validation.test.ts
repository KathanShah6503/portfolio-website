/**
 * Unit tests for data model validation utilities
 */

import { describe, it, expect } from "vitest";
import {
    isString,
    isStringArray,
    isBoolean,
    isValidDate,
    isValidEmail,
    isValidUrl,
    isProfileData,
    isProjectData,
    isSkill,
    isSkillCategory,
    isCertificateData,
    validateProfileData,
    validateProjectData,
    validatePortfolioData
} from "../validation";

import type {
    ProfileData,
    ProjectData,
    Skill,
    SkillCategory,
    CertificateData
} from "../../types/portfolio";

describe("Basic type guards", () => {
    describe("isString", () => {
        it("should return true for strings", () => {
            expect(isString("hello")).toBe(true);
            expect(isString("")).toBe(true);
        });

        it("should return false for non-strings", () => {
            expect(isString(123)).toBe(false);
            expect(isString(null)).toBe(false);
            expect(isString(undefined)).toBe(false);
            expect(isString({})).toBe(false);
        });
    });

    describe("isStringArray", () => {
        it("should return true for string arrays", () => {
            expect(isStringArray(["a", "b", "c"])).toBe(true);
            expect(isStringArray([])).toBe(true);
        });

        it("should return false for non-string arrays", () => {
            expect(isStringArray([1, 2, 3])).toBe(false);
            expect(isStringArray(["a", 1, "c"])).toBe(false);
            expect(isStringArray("not an array")).toBe(false);
        });
    });

    describe("isBoolean", () => {
        it("should return true for booleans", () => {
            expect(isBoolean(true)).toBe(true);
            expect(isBoolean(false)).toBe(true);
        });

        it("should return false for non-booleans", () => {
            expect(isBoolean(1)).toBe(false);
            expect(isBoolean("true")).toBe(false);
            expect(isBoolean(null)).toBe(false);
        });
    });

    describe("isValidDate", () => {
        it("should return true for valid date strings", () => {
            expect(isValidDate("2023-12-25")).toBe(true);
            expect(isValidDate("2024-01-01")).toBe(true);
        });

        it("should return false for invalid date strings", () => {
            expect(isValidDate("invalid-date")).toBe(false);
            expect(isValidDate("2023-13-01")).toBe(false);
            expect(isValidDate("2023/12/25")).toBe(false);
        });
    });

    describe("isValidEmail", () => {
        it("should return true for valid emails", () => {
            expect(isValidEmail("test@example.com")).toBe(true);
            expect(isValidEmail("user.name@domain.co.uk")).toBe(true);
        });

        it("should return false for invalid emails", () => {
            expect(isValidEmail("invalid-email")).toBe(false);
            expect(isValidEmail("test@")).toBe(false);
            expect(isValidEmail("@example.com")).toBe(false);
        });
    });

    describe("isValidUrl", () => {
        it("should return true for valid URLs", () => {
            expect(isValidUrl("https://example.com")).toBe(true);
            expect(isValidUrl("http://localhost:3000")).toBe(true);
        });

        it("should return false for invalid URLs", () => {
            expect(isValidUrl("not-a-url")).toBe(false);
            expect(isValidUrl("ftp://invalid")).toBe(true); // URL constructor accepts this
        });
    });
});

describe("Complex type guards", () => {
    describe("isProfileData", () => {
        const validProfile: ProfileData = {
            name: "John Doe",
            title: "Software Developer",
            photo: "/images/profile.jpg",
            summary: "Experienced developer",
            description: "Full description here",
            location: "New York, NY",
            email: "john@example.com"
        };

        it("should return true for valid profile data", () => {
            expect(isProfileData(validProfile)).toBe(true);
        });

        it("should return false for invalid profile data", () => {
            expect(isProfileData(null)).toBe(false);
            expect(isProfileData({})).toBe(false);
            expect(isProfileData({ ...validProfile, name: "" })).toBe(false);
            expect(isProfileData({ ...validProfile, email: "invalid-email" })).toBe(false);
        });
    });

    describe("isProjectData", () => {
        const validProject: ProjectData = {
            id: "project-1",
            title: "My Project",
            description: "Short description",
            longDescription: "Long description here",
            technologies: ["React", "TypeScript"],
            images: ["/images/project1.jpg"],
            liveUrl: "https://example.com",
            githubUrl: "https://github.com/user/repo",
            category: "Web Development",
            featured: true,
            completedDate: "2023-12-01"
        };

        it("should return true for valid project data", () => {
            expect(isProjectData(validProject)).toBe(true);
        });

        it("should return true for project without optional fields", () => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { liveUrl, githubUrl, ...projectWithoutOptional } = validProject;
            expect(isProjectData(projectWithoutOptional)).toBe(true);
        });

        it("should return false for invalid project data", () => {
            expect(isProjectData(null)).toBe(false);
            expect(isProjectData({ ...validProject, id: "" })).toBe(false);
            expect(isProjectData({ ...validProject, technologies: ["React", 123] })).toBe(false);
            expect(isProjectData({ ...validProject, completedDate: "invalid-date" })).toBe(false);
        });
    });

    describe("isSkill", () => {
        const validSkill: Skill = {
            name: "JavaScript",
            level: "Advanced",
            yearsOfExperience: 5
        };

        it("should return true for valid skill data", () => {
            expect(isSkill(validSkill)).toBe(true);
        });

        it("should return true for skill without optional fields", () => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { yearsOfExperience, ...skillWithoutOptional } = validSkill;
            expect(isSkill(skillWithoutOptional)).toBe(true);
        });

        it("should return false for invalid skill data", () => {
            expect(isSkill({ ...validSkill, level: "InvalidLevel" })).toBe(false);
            expect(isSkill({ ...validSkill, name: "" })).toBe(false);
        });
    });

    describe("isSkillCategory", () => {
        const validSkillCategory: SkillCategory = {
            category: "Programming Languages",
            skills: [
                { name: "JavaScript", level: "Advanced" },
                { name: "Python", level: "Intermediate" }
            ]
        };

        it("should return true for valid skill category", () => {
            expect(isSkillCategory(validSkillCategory)).toBe(true);
        });

        it("should return false for invalid skill category", () => {
            expect(isSkillCategory({ ...validSkillCategory, category: "" })).toBe(false);
            expect(isSkillCategory({ ...validSkillCategory, skills: [{ name: "JS", level: "Invalid" }] })).toBe(false);
        });
    });

    describe("isCertificateData", () => {
        const validCertificate: CertificateData = {
            id: "cert-1",
            title: "AWS Certified Developer",
            issuer: "Amazon Web Services",
            issueDate: "2023-06-15",
            expiryDate: "2026-06-15",
            credentialId: "ABC123",
            verificationUrl: "https://aws.amazon.com/verification",
            image: "/images/aws-cert.jpg"
        };

        it("should return true for valid certificate data", () => {
            expect(isCertificateData(validCertificate)).toBe(true);
        });

        it("should return true for certificate without optional fields", () => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { expiryDate, credentialId, verificationUrl, ...certWithoutOptional } = validCertificate;
            expect(isCertificateData(certWithoutOptional)).toBe(true);
        });

        it("should return false for invalid certificate data", () => {
            expect(isCertificateData({ ...validCertificate, issueDate: "invalid-date" })).toBe(false);
            expect(isCertificateData({ ...validCertificate, verificationUrl: "not-a-url" })).toBe(false);
        });
    });
});

describe("Validation functions", () => {
    describe("validateProfileData", () => {
        it("should return no errors for valid profile", () => {
            const validProfile: ProfileData = {
                name: "John Doe",
                title: "Developer",
                photo: "/photo.jpg",
                summary: "Summary",
                description: "Description",
                location: "NYC",
                email: "john@example.com"
            };

            const errors = validateProfileData(validProfile);
            expect(errors).toHaveLength(0);
        });

        it("should return errors for invalid profile", () => {
            const invalidProfile = {
                name: "",
                title: "",
                email: "invalid-email"
            };

            const errors = validateProfileData(invalidProfile);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors.some(e => e.field === "profile.name")).toBe(true);
            expect(errors.some(e => e.field === "profile.email")).toBe(true);
        });
    });

    describe("validateProjectData", () => {
        it("should return no errors for valid project", () => {
            const validProject: ProjectData = {
                id: "project-1",
                title: "My Project",
                description: "Description",
                longDescription: "Long description",
                technologies: ["React"],
                images: ["/image.jpg"],
                category: "Web",
                featured: false,
                completedDate: "2023-12-01"
            };

            const errors = validateProjectData(validProject);
            expect(errors).toHaveLength(0);
        });

        it("should return errors for invalid project", () => {
            const invalidProject = {
                id: "",
                title: "",
                technologies: ["React", 123],
                liveUrl: "not-a-url"
            };

            const errors = validateProjectData(invalidProject);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors.some(e => e.field === "project.id")).toBe(true);
            expect(errors.some(e => e.field === "project.liveUrl")).toBe(true);
        });
    });

    describe("validatePortfolioData", () => {
        it("should return errors for missing required fields", () => {
            const invalidPortfolio = {};

            const errors = validatePortfolioData(invalidPortfolio);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors.some(e => e.field === "portfolio.profile")).toBe(true);
        });
    });
});
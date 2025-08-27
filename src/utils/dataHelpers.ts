/**
 * Helper functions for working with portfolio data models
 */

import type {
    PortfolioData,
    ProjectData,
    ExperienceItem,
    CertificateData
} from "../types/portfolio";

/**
 * Creates a default portfolio data structure
 */
export function createDefaultPortfolioData(): PortfolioData {
    return {
        profile: {
            name: "",
            title: "",
            photo: "",
            summary: "",
            description: "",
            location: "",
            email: ""
        },
        projects: [],
        resume: {
            experience: [],
            education: [],
            skills: [],
            downloadUrl: ""
        },
        certificates: [],
        socialLinks: [],
        config: {
            theme: "auto",
            language: "en",
            analytics: {
                enabled: false
            },
            seo: {
                title: "",
                description: "",
                keywords: []
            }
        }
    };
}

/**
 * Generates a unique ID for data items
 */
export function generateId(prefix: string = "item"): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}-${timestamp}-${random}`;
}

/**
 * Sorts projects by completion date (newest first)
 */
export function sortProjectsByDate(projects: ProjectData[]): ProjectData[] {
    return [...projects].sort((a, b) => {
        const dateA = new Date(a.completedDate);
        const dateB = new Date(b.completedDate);
        return dateB.getTime() - dateA.getTime();
    });
}

/**
 * Filters projects by category
 */
export function filterProjectsByCategory(projects: ProjectData[], category: string): ProjectData[] {
    return projects.filter(project => 
        project.category.toLowerCase() === category.toLowerCase()
    );
}

/**
 * Gets featured projects
 */
export function getFeaturedProjects(projects: ProjectData[]): ProjectData[] {
    return projects.filter(project => project.featured);
}

/**
 * Sorts experience items by start date (newest first)
 */
export function sortExperienceByDate(experience: ExperienceItem[]): ExperienceItem[] {
    return [...experience].sort((a, b) => {
        const dateA = new Date(a.startDate);
        const dateB = new Date(b.startDate);
        return dateB.getTime() - dateA.getTime();
    });
}

/**
 * Gets current experience items
 */
export function getCurrentExperience(experience: ExperienceItem[]): ExperienceItem[] {
    return experience.filter(item => item.current);
}

/**
 * Sorts certificates by issue date (newest first)
 */
export function sortCertificatesByDate(certificates: CertificateData[]): CertificateData[] {
    return [...certificates].sort((a, b) => {
        const dateA = new Date(a.issueDate);
        const dateB = new Date(b.issueDate);
        return dateB.getTime() - dateA.getTime();
    });
}

/**
 * Gets non-expired certificates
 */
export function getValidCertificates(certificates: CertificateData[]): CertificateData[] {
    const now = new Date();
    return certificates.filter(cert => {
        if (!cert.expiryDate) return true; // No expiry date means it doesn't expire
        const expiryDate = new Date(cert.expiryDate);
        return expiryDate > now;
    });
}

/**
 * Formats a date string for display
 */
export function formatDate(dateString: string, options?: Intl.DateTimeFormatOptions): string {
    const date = new Date(dateString);
    const defaultOptions: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric"
    };
  
    // If custom options are provided, use them instead of merging with defaults
    const formatOptions = options ? options : defaultOptions;
  
    return date.toLocaleDateString("en-US", formatOptions);
}

/**
 * Formats a date range for display
 */
export function formatDateRange(startDate: string, endDate?: string, current: boolean = false): string {
    const start = formatDate(startDate, { year: "numeric", month: "short" });
  
    if (current) {
        return `${start} - Present`;
    }
  
    if (endDate) {
        const end = formatDate(endDate, { year: "numeric", month: "short" });
        return `${start} - ${end}`;
    }
  
    return start;
}

/**
 * Calculates years of experience from experience items
 */
export function calculateTotalExperience(experience: ExperienceItem[]): number {
    let totalMonths = 0;
  
    experience.forEach(item => {
        const startDate = new Date(item.startDate);
        const endDate = item.current ? new Date() : new Date(item.endDate || item.startDate);
    
        const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                      (endDate.getMonth() - startDate.getMonth());
    
        totalMonths += Math.max(0, monthsDiff);
    });
  
    return Math.round(totalMonths / 12 * 10) / 10; // Round to 1 decimal place
}

/**
 * Extracts unique technologies from projects
 */
export function getUniqueTechnologies(projects: ProjectData[]): string[] {
    const technologies = new Set<string>();
  
    projects.forEach(project => {
        project.technologies.forEach(tech => {
            technologies.add(tech);
        });
    });
  
    return Array.from(technologies).sort();
}

/**
 * Searches projects by title, description, or technologies
 */
export function searchProjects(projects: ProjectData[], query: string): ProjectData[] {
    const lowerQuery = query.toLowerCase();
  
    return projects.filter(project => 
        project.title.toLowerCase().includes(lowerQuery) ||
    project.description.toLowerCase().includes(lowerQuery) ||
    project.longDescription.toLowerCase().includes(lowerQuery) ||
    project.technologies.some(tech => tech.toLowerCase().includes(lowerQuery)) ||
    project.category.toLowerCase().includes(lowerQuery)
    );
}

/**
 * Deep clones portfolio data to avoid mutations
 */
export function clonePortfolioData(data: PortfolioData): PortfolioData {
    return JSON.parse(JSON.stringify(data));
}

/**
 * Merges partial portfolio data with existing data
 */
export function mergePortfolioData(existing: PortfolioData, updates: Partial<PortfolioData>): PortfolioData {
    return {
        ...existing,
        ...updates,
        profile: updates.profile ? { ...existing.profile, ...updates.profile } : existing.profile,
        config: updates.config ? { ...existing.config, ...updates.config } : existing.config
    };
}
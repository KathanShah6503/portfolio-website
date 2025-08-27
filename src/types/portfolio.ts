/**
 * Core data models and TypeScript interfaces for the portfolio website
 * These interfaces define the structure of all portfolio data
 */

export interface PortfolioData {
    profile: ProfileData;
    projects: ProjectData[];
    resume: ResumeData;
    certificates: CertificateData[];
    socialLinks: SocialLinkData[];
    config: ConfigData;
}

export interface ProfileData {
    name: string;
    title: string;
    photo: string;
    summary: string;
    description: string;
    location: string;
    email: string;
}

export interface ProjectData {
    id: string;
    title: string;
    description: string;
    longDescription: string;
    technologies: string[];
    images: string[];
    liveUrl?: string;
    githubUrl?: string;
    category: string;
    featured: boolean;
    completedDate: string;
}

export interface ResumeData {
    experience: ExperienceItem[];
    education: EducationItem[];
    skills: SkillCategory[];
    downloadUrl: string;
}

export interface ExperienceItem {
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description: string;
    achievements: string[];
    technologies: string[];
}

export interface EducationItem {
    id: string;
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate?: string;
    gpa?: string;
    description?: string;
}

export interface SkillCategory {
    category: string;
    skills: Skill[];
}

export interface Skill {
    name: string;
    level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
    yearsOfExperience?: number;
}

export interface CertificateData {
    id: string;
    title: string;
    issuer: string;
    issueDate: string;
    expiryDate?: string;
    credentialId?: string;
    verificationUrl?: string;
    image: string;
}

export interface SocialLinkData {
    platform: string;
    url: string;
    icon: string;
    displayName: string;
}

export interface ConfigData {
    theme: "light" | "dark" | "auto";
    language: string;
    analytics?: {
        enabled: boolean;
        trackingId?: string;
    };
    seo: {
        title: string;
        description: string;
        keywords: string[];
    };
}
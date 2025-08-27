/**
 * Data validation utilities and type guards for portfolio data
 */

import type {
    PortfolioData,
    ProfileData,
    ProjectData,
    ResumeData,
    ExperienceItem,
    EducationItem,
    SkillCategory,
    Skill,
    CertificateData,
    SocialLinkData,
    ConfigData
} from "../types/portfolio";

// Type guard functions
export function isString(value: unknown): value is string {
    return typeof value === "string";
}

export function isStringArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.every(item => typeof item === "string");
}

export function isBoolean(value: unknown): value is boolean {
    return typeof value === "boolean";
}

export function isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && dateString.match(/^\d{4}-\d{2}-\d{2}$/) !== null;
}

export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

// Type guards for complex objects
export function isProfileData(obj: unknown): obj is ProfileData {
    if (!obj || typeof obj !== "object") return false;
  
    const profile = obj as Record<string, unknown>;
  
    return (
        isString(profile.name) && profile.name.length > 0 &&
    isString(profile.title) && profile.title.length > 0 &&
    isString(profile.photo) &&
    isString(profile.summary) &&
    isString(profile.description) &&
    isString(profile.location) &&
    isString(profile.email) && isValidEmail(profile.email)
    );
}

export function isProjectData(obj: unknown): obj is ProjectData {
    if (!obj || typeof obj !== "object") return false;
  
    const project = obj as Record<string, unknown>;
  
    return (
        isString(project.id) && project.id.length > 0 &&
    isString(project.title) && project.title.length > 0 &&
    isString(project.description) &&
    isString(project.longDescription) &&
    isStringArray(project.technologies) &&
    isStringArray(project.images) &&
    (project.liveUrl === undefined || (isString(project.liveUrl) && isValidUrl(project.liveUrl))) &&
    (project.githubUrl === undefined || (isString(project.githubUrl) && isValidUrl(project.githubUrl))) &&
    isString(project.category) &&
    isBoolean(project.featured) &&
    isString(project.completedDate) && isValidDate(project.completedDate)
    );
}

export function isSkill(obj: unknown): obj is Skill {
    if (!obj || typeof obj !== "object") return false;
  
    const skill = obj as Record<string, unknown>;
    const validLevels = ["Beginner", "Intermediate", "Advanced", "Expert"];
  
    return (
        isString(skill.name) && skill.name.length > 0 &&
    isString(skill.level) && validLevels.includes(skill.level) &&
    (skill.yearsOfExperience === undefined || typeof skill.yearsOfExperience === "number")
    );
}

export function isSkillCategory(obj: unknown): obj is SkillCategory {
    if (!obj || typeof obj !== "object") return false;
  
    const category = obj as Record<string, unknown>;
  
    return (
        isString(category.category) && category.category.length > 0 &&
    Array.isArray(category.skills) && category.skills.every(isSkill)
    );
}

export function isExperienceItem(obj: unknown): obj is ExperienceItem {
    if (!obj || typeof obj !== "object") return false;
  
    const exp = obj as Record<string, unknown>;
  
    return (
        isString(exp.id) && exp.id.length > 0 &&
    isString(exp.company) && exp.company.length > 0 &&
    isString(exp.position) && exp.position.length > 0 &&
    isString(exp.startDate) && isValidDate(exp.startDate) &&
    (exp.endDate === undefined || (isString(exp.endDate) && isValidDate(exp.endDate))) &&
    isBoolean(exp.current) &&
    isString(exp.description) &&
    isStringArray(exp.achievements) &&
    isStringArray(exp.technologies)
    );
}

export function isEducationItem(obj: unknown): obj is EducationItem {
    if (!obj || typeof obj !== "object") return false;
  
    const edu = obj as Record<string, unknown>;
  
    return (
        isString(edu.id) && edu.id.length > 0 &&
    isString(edu.institution) && edu.institution.length > 0 &&
    isString(edu.degree) && edu.degree.length > 0 &&
    isString(edu.field) && edu.field.length > 0 &&
    isString(edu.startDate) && isValidDate(edu.startDate) &&
    (edu.endDate === undefined || (isString(edu.endDate) && isValidDate(edu.endDate))) &&
    (edu.gpa === undefined || isString(edu.gpa)) &&
    (edu.description === undefined || isString(edu.description))
    );
}

export function isResumeData(obj: unknown): obj is ResumeData {
    if (!obj || typeof obj !== "object") return false;
  
    const resume = obj as Record<string, unknown>;
  
    return (
        Array.isArray(resume.experience) && resume.experience.every(isExperienceItem) &&
    Array.isArray(resume.education) && resume.education.every(isEducationItem) &&
    Array.isArray(resume.skills) && resume.skills.every(isSkillCategory) &&
    isString(resume.downloadUrl)
    );
}

export function isCertificateData(obj: unknown): obj is CertificateData {
    if (!obj || typeof obj !== "object") return false;
  
    const cert = obj as Record<string, unknown>;
  
    return (
        isString(cert.id) && cert.id.length > 0 &&
    isString(cert.title) && cert.title.length > 0 &&
    isString(cert.issuer) && cert.issuer.length > 0 &&
    isString(cert.issueDate) && isValidDate(cert.issueDate) &&
    (cert.expiryDate === undefined || (isString(cert.expiryDate) && isValidDate(cert.expiryDate))) &&
    (cert.credentialId === undefined || isString(cert.credentialId)) &&
    (cert.verificationUrl === undefined || (isString(cert.verificationUrl) && isValidUrl(cert.verificationUrl))) &&
    isString(cert.image)
    );
}

export function isSocialLinkData(obj: unknown): obj is SocialLinkData {
    if (!obj || typeof obj !== "object") return false;
  
    const social = obj as Record<string, unknown>;
  
    return (
        isString(social.platform) && social.platform.length > 0 &&
    isString(social.url) && isValidUrl(social.url) &&
    isString(social.icon) &&
    isString(social.displayName) && social.displayName.length > 0
    );
}

export function isConfigData(obj: unknown): obj is ConfigData {
    if (!obj || typeof obj !== "object") return false;
  
    const config = obj as Record<string, unknown>;
    const validThemes = ["light", "dark", "auto"];
  
    return (
        isString(config.theme) && validThemes.includes(config.theme) &&
    isString(config.language) && config.language.length > 0 &&
    (config.analytics === undefined || (
        typeof config.analytics === "object" &&
      config.analytics !== null &&
      isBoolean((config.analytics as Record<string, unknown>).enabled)
    )) &&
    typeof config.seo === "object" &&
    config.seo !== null &&
    isString((config.seo as Record<string, unknown>).title) &&
    isString((config.seo as Record<string, unknown>).description) &&
    isStringArray((config.seo as Record<string, unknown>).keywords)
    );
}

export function isPortfolioData(obj: unknown): obj is PortfolioData {
    if (!obj || typeof obj !== "object") return false;
  
    const portfolio = obj as Record<string, unknown>;
  
    return (
        isProfileData(portfolio.profile) &&
    Array.isArray(portfolio.projects) && portfolio.projects.every(isProjectData) &&
    isResumeData(portfolio.resume) &&
    Array.isArray(portfolio.certificates) && portfolio.certificates.every(isCertificateData) &&
    Array.isArray(portfolio.socialLinks) && portfolio.socialLinks.every(isSocialLinkData) &&
    isConfigData(portfolio.config)
    );
}

// Validation error types
export interface ValidationError {
    field: string;
    message: string;
    value?: unknown;
}

// Validation functions that return detailed error information
export function validateProfileData(obj: unknown): ValidationError[] {
    const errors: ValidationError[] = [];
  
    if (!obj || typeof obj !== "object") {
        errors.push({ field: "profile", message: "Profile data must be an object" });
        return errors;
    }
  
    const profile = obj as Record<string, unknown>;
  
    if (!isString(profile.name) || profile.name.length === 0) {
        errors.push({ field: "profile.name", message: "Name is required and must be a non-empty string", value: profile.name });
    }
  
    if (!isString(profile.title) || profile.title.length === 0) {
        errors.push({ field: "profile.title", message: "Title is required and must be a non-empty string", value: profile.title });
    }
  
    if (!isString(profile.email) || !isValidEmail(profile.email)) {
        errors.push({ field: "profile.email", message: "Email must be a valid email address", value: profile.email });
    }
  
    return errors;
}

export function validateProjectData(obj: unknown): ValidationError[] {
    const errors: ValidationError[] = [];
  
    if (!obj || typeof obj !== "object") {
        errors.push({ field: "project", message: "Project data must be an object" });
        return errors;
    }
  
    const project = obj as Record<string, unknown>;
  
    if (!isString(project.id) || project.id.length === 0) {
        errors.push({ field: "project.id", message: "Project ID is required and must be a non-empty string", value: project.id });
    }
  
    if (!isString(project.title) || project.title.length === 0) {
        errors.push({ field: "project.title", message: "Project title is required and must be a non-empty string", value: project.title });
    }
  
    if (!isStringArray(project.technologies)) {
        errors.push({ field: "project.technologies", message: "Technologies must be an array of strings", value: project.technologies });
    }
  
    if (project.liveUrl && (!isString(project.liveUrl) || !isValidUrl(project.liveUrl))) {
        errors.push({ field: "project.liveUrl", message: "Live URL must be a valid URL", value: project.liveUrl });
    }
  
    if (project.githubUrl && (!isString(project.githubUrl) || !isValidUrl(project.githubUrl))) {
        errors.push({ field: "project.githubUrl", message: "GitHub URL must be a valid URL", value: project.githubUrl });
    }
  
    return errors;
}

export function validatePortfolioData(obj: unknown): ValidationError[] {
    const errors: ValidationError[] = [];
  
    if (!obj || typeof obj !== "object") {
        errors.push({ field: "portfolio", message: "Portfolio data must be an object" });
        return errors;
    }
  
    const portfolio = obj as Record<string, unknown>;
  
    // Validate profile
    if (portfolio.profile) {
        errors.push(...validateProfileData(portfolio.profile));
    } else {
        errors.push({ field: "portfolio.profile", message: "Profile data is required" });
    }
  
    // Validate projects
    if (Array.isArray(portfolio.projects)) {
        portfolio.projects.forEach((project, index) => {
            const projectErrors = validateProjectData(project);
            projectErrors.forEach(error => {
                errors.push({
                    ...error,
                    field: `portfolio.projects[${index}].${error.field.replace("project.", "")}`
                });
            });
        });
    } else {
        errors.push({ field: "portfolio.projects", message: "Projects must be an array" });
    }
  
    return errors;
}
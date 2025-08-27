/**
 * Main types export file for the portfolio website
 */

export type {
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
} from "./portfolio"

export type {
    ValidationError
} from "../utils/validation"

// Re-export validation functions for convenience
export {
    isPortfolioData,
    isProfileData,
    isProjectData,
    isCertificateData,
    validatePortfolioData,
    validateProfileData,
    validateProjectData
} from "../utils/validation"

// Re-export helper functions for convenience
export {
    createDefaultPortfolioData,
    generateId,
    sortProjectsByDate,
    filterProjectsByCategory,
    getFeaturedProjects,
    formatDate,
    formatDateRange,
    getUniqueTechnologies,
    searchProjects
} from "../utils/dataHelpers"
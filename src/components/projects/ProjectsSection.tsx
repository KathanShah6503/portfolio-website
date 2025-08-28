import React, { useState, useMemo } from "react";
import type { ProjectData } from "../../types";
import { sortProjectsByDate, filterProjectsByCategory, searchProjects } from "../../utils";
import ProjectsGrid from "./ProjectsGrid";
import ProjectFilters from "./ProjectFilters";
import ProjectModal from "./ProjectModal";
import ProjectForm from "./ProjectForm";

interface ProjectsSectionProps {
    projects: ProjectData[];
    onUpdateProjects: (projects: ProjectData[]) => void;
    isEditMode?: boolean;
    isLoading?: boolean;
}

const ProjectsSection: React.FC<ProjectsSectionProps> = ({
    projects,
    onUpdateProjects,
    isEditMode = false,
    isLoading = false
}) => {
    // Filter states
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedTechnology, setSelectedTechnology] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    // Modal states
    const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<ProjectData | null>(null);

    // Filter and sort projects
    const filteredProjects = useMemo(() => {
        let filtered = [...projects];

        // Apply search filter
        if (searchQuery.trim()) {
            filtered = searchProjects(filtered, searchQuery);
        }

        // Apply category filter
        if (selectedCategory !== "all") {
            filtered = filterProjectsByCategory(filtered, selectedCategory);
        }

        // Apply technology filter
        if (selectedTechnology !== "all") {
            filtered = filtered.filter(project =>
                project.technologies.includes(selectedTechnology)
            );
        }

        // Sort by completion date (newest first)
        return sortProjectsByDate(filtered);
    }, [projects, searchQuery, selectedCategory, selectedTechnology]);

    const handleViewProject = (project: ProjectData) => {
        setSelectedProject(project);
        setIsModalOpen(true);
    };

    const handleEditProject = (project: ProjectData) => {
        setEditingProject(project);
        setIsFormOpen(true);
    };

    const handleAddProject = () => {
        setEditingProject(null);
        setIsFormOpen(true);
    };

    const handleDeleteProject = (projectId: string) => {
        const updatedProjects = projects.filter(p => p.id !== projectId);
        onUpdateProjects(updatedProjects);
    };

    const handleSaveProject = (projectData: ProjectData) => {
        if (editingProject) {
            // Update existing project
            const updatedProjects = projects.map(p =>
                p.id === projectData.id ? projectData : p
            );
            onUpdateProjects(updatedProjects);
        } else {
            // Add new project
            onUpdateProjects([...projects, projectData]);
        }
    };

    const handleClearFilters = () => {
        setSelectedCategory("all");
        setSelectedTechnology("all");
        setSearchQuery("");
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProject(null);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingProject(null);
    };

    return (
        <section className="py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        My Projects
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        A showcase of my work, featuring web applications, mobile apps, and other software projects
                        I've built using various technologies and frameworks.
                    </p>
                </div>

                {/* Add Project Button (Edit Mode) */}
                {isEditMode && (
                    <div className="flex justify-end mb-6">
                        <button
                            onClick={handleAddProject}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add New Project
                        </button>
                    </div>
                )}

                {/* Filters */}
                <ProjectFilters
                    projects={projects}
                    selectedCategory={selectedCategory}
                    selectedTechnology={selectedTechnology}
                    searchQuery={searchQuery}
                    onCategoryChange={setSelectedCategory}
                    onTechnologyChange={setSelectedTechnology}
                    onSearchChange={setSearchQuery}
                    onClearFilters={handleClearFilters}
                />

                {/* Results Summary */}
                {!isLoading && (
                    <div className="mb-6">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Showing {filteredProjects.length} of {projects.length} projects
                            {(selectedCategory !== "all" || selectedTechnology !== "all" || searchQuery.trim()) && (
                                <span className="ml-1">(filtered)</span>
                            )}
                        </p>
                    </div>
                )}

                {/* Projects Grid */}
                <ProjectsGrid
                    projects={filteredProjects}
                    onViewProject={handleViewProject}
                    {...(isEditMode && { onEditProject: handleEditProject })}
                    {...(isEditMode && { onDeleteProject: handleDeleteProject })}
                    isEditMode={isEditMode}
                    isLoading={isLoading}
                />

                {/* Project Detail Modal */}
                <ProjectModal
                    project={selectedProject}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    {...(isEditMode && { onEdit: handleEditProject })}
                    isEditMode={isEditMode}
                />

                {/* Project Form Modal */}
                <ProjectForm
                    project={editingProject}
                    isOpen={isFormOpen}
                    onClose={handleCloseForm}
                    onSave={handleSaveProject}
                />
            </div>
        </section>
    );
};

export default ProjectsSection;
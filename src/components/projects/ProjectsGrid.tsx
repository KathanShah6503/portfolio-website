import React from "react";
import type { ProjectData } from "../../types";
import ProjectCard from "./ProjectCard";

interface ProjectsGridProps {
    projects: ProjectData[];
    onViewProject: (project: ProjectData) => void;
    onEditProject?: ((project: ProjectData) => void) | undefined;
    onDeleteProject?: ((projectId: string) => void) | undefined;
    isEditMode?: boolean;
    isLoading?: boolean;
}

const ProjectsGrid: React.FC<ProjectsGridProps> = ({
    projects,
    onViewProject,
    onEditProject,
    onDeleteProject,
    isEditMode = false,
    isLoading = false
}) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                    <div
                        key={index}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse"
                    >
                        <div className="h-48 bg-gray-300 dark:bg-gray-600"></div>
                        <div className="p-4">
                            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded mb-3 w-3/4"></div>
                            <div className="flex gap-2 mb-3">
                                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                            </div>
                            <div className="flex justify-between">
                                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (projects.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <svg
                        className="w-12 h-12 text-gray-400 dark:text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No projects found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {isEditMode 
                        ? "Get started by adding your first project."
                        : "No projects match your current filters. Try adjusting your search criteria."
                    }
                </p>
                {isEditMode && (
                    <button
                        onClick={() => onEditProject?.({
                            id: "",
                            title: "",
                            description: "",
                            longDescription: "",
                            technologies: [],
                            images: [],
                            category: "",
                            featured: false,
                            completedDate: new Date().toISOString().split("T")[0] as string
                        })}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Add Your First Project
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
                <ProjectCard
                    key={project.id}
                    project={project}
                    onView={onViewProject}
                    {...(onEditProject && { onEdit: onEditProject })}
                    {...(onDeleteProject && { onDelete: onDeleteProject })}
                    isEditMode={isEditMode}
                />
            ))}
        </div>
    );
};

export default ProjectsGrid;
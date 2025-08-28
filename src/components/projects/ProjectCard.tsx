import React from "react";
import type { ProjectData } from "../../types";
import { formatDate } from "../../utils";

interface ProjectCardProps {
    project: ProjectData;
    onView: (project: ProjectData) => void;
    onEdit?: ((project: ProjectData) => void) | undefined;
    onDelete?: ((projectId: string) => void) | undefined;
    isEditMode?: boolean;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
    project,
    onView,
    onEdit,
    onDelete,
    isEditMode = false
}) => {
    const handleCardClick = () => {
        onView(project);
    };

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit?.(project);
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm(`Are you sure you want to delete "${project.title}"?`)) {
            onDelete?.(project.id);
        }
    };

    return (
        <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer overflow-hidden"
            onClick={handleCardClick}
        >
            {/* Project Image */}
            {project.images.length > 0 && (
                <div className="relative h-48 overflow-hidden">
                    <img
                        src={project.images[0]}
                        alt={project.title}
                        className="w-full h-full object-cover"
                    />
                    {project.featured && (
                        <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                            Featured
                        </div>
                    )}
                </div>
            )}

            <div className="p-4">
                {/* Project Title and Category */}
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {project.title}
                    </h3>
                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full ml-2 whitespace-nowrap">
                        {project.category}
                    </span>
                </div>

                {/* Project Description */}
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 overflow-hidden" style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical"
                }}>
                    {project.description}
                </p>

                {/* Technologies */}
                <div className="flex flex-wrap gap-1 mb-3">
                    {project.technologies.slice(0, 3).map((tech) => (
                        <span
                            key={tech}
                            className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded"
                        >
                            {tech}
                        </span>
                    ))}
                    {project.technologies.length > 3 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                            +{project.technologies.length - 3} more
                        </span>
                    )}
                </div>

                {/* Project Links and Date */}
                <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                        {project.liveUrl && (
                            <a
                                href={project.liveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm"
                                onClick={(e) => e.stopPropagation()}
                            >
                                Live Demo
                            </a>
                        )}
                        {project.githubUrl && (
                            <a
                                href={project.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm"
                                onClick={(e) => e.stopPropagation()}
                            >
                                GitHub
                            </a>
                        )}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(project.completedDate, { year: "numeric", month: "short" })}
                    </span>
                </div>

                {/* Edit Mode Actions */}
                {isEditMode && (
                    <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={handleEditClick}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                        >
                            Edit
                        </button>
                        <button
                            onClick={handleDeleteClick}
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium"
                        >
                            Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectCard;
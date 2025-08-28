import React, { useEffect } from "react";
import type { ProjectData } from "../../types";
import { formatDate } from "../../utils";

interface ProjectModalProps {
    project: ProjectData | null;
    isOpen: boolean;
    onClose: () => void;
    onEdit?: ((project: ProjectData) => void) | undefined;
    isEditMode?: boolean;
}

const ProjectModal: React.FC<ProjectModalProps> = ({
    project,
    isOpen,
    onClose,
    onEdit,
    isEditMode = false
}) => {
    // Handle escape key press
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    if (!isOpen || !project) {
        return null;
    }

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleEditClick = () => {
        onEdit?.(project);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-start p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {project.title}
                            </h2>
                            {project.featured && (
                                <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                                    Featured
                                </span>
                            )}
                            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-sm">
                                {project.category}
                            </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                            Completed: {formatDate(project.completedDate)}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 ml-4"
                        aria-label="Close modal"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Project Images */}
                    {project.images.length > 0 && (
                        <div className="mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {project.images.map((image, index) => (
                                    <div key={index} className="relative">
                                        <img
                                            src={image}
                                            alt={`${project.title} screenshot ${index + 1}`}
                                            className="w-full h-64 object-cover rounded-lg"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Project Description */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            Description
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                            {project.description}
                        </p>
                        {project.longDescription && project.longDescription !== project.description && (
                            <div className="prose dark:prose-invert max-w-none">
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {project.longDescription}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Technologies */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            Technologies Used
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {project.technologies.map((tech) => (
                                <span
                                    key={tech}
                                    className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm"
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Project Links */}
                    <div className="flex flex-wrap gap-4 mb-6">
                        {project.liveUrl && (
                            <a
                                href={project.liveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                View Live Demo
                            </a>
                        )}
                        {project.githubUrl && (
                            <a
                                href={project.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition-colors"
                            >
                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                </svg>
                                View Source Code
                            </a>
                        )}
                    </div>

                    {/* Edit Mode Actions */}
                    {isEditMode && (
                        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                            <button
                                onClick={handleEditClick}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit Project
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectModal;
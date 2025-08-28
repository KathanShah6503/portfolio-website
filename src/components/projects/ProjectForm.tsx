import React, { useState, useEffect } from "react";
import type { ProjectData } from "../../types";
import { generateId } from "../../utils";

interface ProjectFormProps {
    project?: ProjectData | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (project: ProjectData) => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({
    project,
    isOpen,
    onClose,
    onSave
}) => {
    const [formData, setFormData] = useState<ProjectData>({
        id: "",
        title: "",
        description: "",
        longDescription: "",
        technologies: [],
        images: [],
        liveUrl: "",
        githubUrl: "",
        category: "",
        featured: false,
        completedDate: new Date().toISOString().split("T")[0] as string
    });

    const [techInput, setTechInput] = useState("");
    const [imageInput, setImageInput] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Initialize form data when project changes
    useEffect(() => {
        if (project) {
            setFormData(project);
        } else {
            setFormData({
                id: "",
                title: "",
                description: "",
                longDescription: "",
                technologies: [],
                images: [],
                liveUrl: "",
                githubUrl: "",
                category: "",
                featured: false,
                completedDate: new Date().toISOString().split("T")[0] as string
            });
        }
        setErrors({});
    }, [project, isOpen]);

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

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = "Title is required";
        }

        if (!formData.description.trim()) {
            newErrors.description = "Description is required";
        }

        if (!formData.category.trim()) {
            newErrors.category = "Category is required";
        }

        if (!formData.completedDate) {
            newErrors.completedDate = "Completion date is required";
        }

        if (formData.technologies.length === 0) {
            newErrors.technologies = "At least one technology is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
    
        if (!validateForm()) {
            return;
        }

        const projectData: ProjectData = {
            ...formData,
            id: formData.id || generateId("project")
        };

        onSave(projectData);
        onClose();
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
    
        if (type === "checkbox") {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const handleAddTechnology = () => {
        const tech = techInput.trim();
        if (tech && !formData.technologies.includes(tech)) {
            setFormData(prev => ({
                ...prev,
                technologies: [...prev.technologies, tech]
            }));
            setTechInput("");
            if (errors.technologies) {
                setErrors(prev => ({ ...prev, technologies: "" }));
            }
        }
    };

    const handleRemoveTechnology = (techToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            technologies: prev.technologies.filter(tech => tech !== techToRemove)
        }));
    };

    const handleAddImage = () => {
        const imageUrl = imageInput.trim();
        if (imageUrl && !formData.images.includes(imageUrl)) {
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, imageUrl]
            }));
            setImageInput("");
        }
    };

    const handleRemoveImage = (imageToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter(img => img !== imageToRemove)
        }));
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {project ? "Edit Project" : "Add New Project"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6" role="form">
                    {/* Title */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Project Title *
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                                errors.title ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                            }`}
                            placeholder="Enter project title"
                        />
                        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                    </div>

                    {/* Category and Featured */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Category *
                            </label>
                            <input
                                type="text"
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                                    errors.category ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                                }`}
                                placeholder="e.g., Web Application, Mobile App"
                            />
                            {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="featured"
                                name="featured"
                                checked={formData.featured}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="featured" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                Featured Project
                            </label>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Short Description *
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={3}
                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                                errors.description ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                            }`}
                            placeholder="Brief description for project cards"
                        />
                        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                    </div>

                    {/* Long Description */}
                    <div>
                        <label htmlFor="longDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Detailed Description
                        </label>
                        <textarea
                            id="longDescription"
                            name="longDescription"
                            value={formData.longDescription}
                            onChange={handleInputChange}
                            rows={5}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                            placeholder="Detailed description for project modal"
                        />
                    </div>

                    {/* Technologies */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Technologies *
                        </label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={techInput}
                                onChange={(e) => setTechInput(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTechnology())}
                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                placeholder="Add technology (e.g., React, TypeScript)"
                            />
                            <button
                                type="button"
                                onClick={handleAddTechnology}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Add
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.technologies.map((tech) => (
                                <span
                                    key={tech}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                                >
                                    {tech}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveTechnology(tech)}
                                        className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                        {errors.technologies && <p className="mt-1 text-sm text-red-600">{errors.technologies}</p>}
                    </div>

                    {/* URLs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="liveUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Live Demo URL
                            </label>
                            <input
                                type="url"
                                id="liveUrl"
                                name="liveUrl"
                                value={formData.liveUrl}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                placeholder="https://example.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                GitHub URL
                            </label>
                            <input
                                type="url"
                                id="githubUrl"
                                name="githubUrl"
                                value={formData.githubUrl}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                placeholder="https://github.com/username/repo"
                            />
                        </div>
                    </div>

                    {/* Completion Date */}
                    <div>
                        <label htmlFor="completedDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Completion Date *
                        </label>
                        <input
                            type="date"
                            id="completedDate"
                            name="completedDate"
                            value={formData.completedDate}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                                errors.completedDate ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                            }`}
                        />
                        {errors.completedDate && <p className="mt-1 text-sm text-red-600">{errors.completedDate}</p>}
                    </div>

                    {/* Images */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Project Images
                        </label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="url"
                                value={imageInput}
                                onChange={(e) => setImageInput(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddImage())}
                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                placeholder="Add image URL"
                            />
                            <button
                                type="button"
                                onClick={handleAddImage}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                Add
                            </button>
                        </div>
                        {formData.images.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {formData.images.map((image, index) => (
                                    <div key={index} className="relative">
                                        <img
                                            src={image}
                                            alt={`Project image ${index + 1}`}
                                            className="w-full h-24 object-cover rounded border"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(image)}
                                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {project ? "Update Project" : "Create Project"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProjectForm;
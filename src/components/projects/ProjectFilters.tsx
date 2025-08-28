import React from "react";
import type { ProjectData } from "../../types";
import { getUniqueTechnologies } from "../../utils";

interface ProjectFiltersProps {
    projects: ProjectData[];
    selectedCategory: string;
    selectedTechnology: string;
    searchQuery: string;
    onCategoryChange: (category: string) => void;
    onTechnologyChange: (technology: string) => void;
    onSearchChange: (query: string) => void;
    onClearFilters: () => void;
}

const ProjectFilters: React.FC<ProjectFiltersProps> = ({
    projects,
    selectedCategory,
    selectedTechnology,
    searchQuery,
    onCategoryChange,
    onTechnologyChange,
    onSearchChange,
    onClearFilters
}) => {
    // Get unique categories from projects
    const categories = Array.from(new Set(projects.map(p => p.category))).sort();
  
    // Get unique technologies from projects
    const technologies = getUniqueTechnologies(projects);

    const hasActiveFilters = selectedCategory !== "all" || selectedTechnology !== "all" || searchQuery.trim() !== "";

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
                {/* Search Input */}
                <div className="flex-1">
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Search Projects
                    </label>
                    <input
                        type="text"
                        id="search"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search by title, description, or technology..."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                </div>

                {/* Category Filter */}
                <div className="min-w-0 lg:w-48">
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Category
                    </label>
                    <select
                        id="category"
                        value={selectedCategory}
                        onChange={(e) => onCategoryChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                        <option value="all">All Categories</option>
                        {categories.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Technology Filter */}
                <div className="min-w-0 lg:w-48">
                    <label htmlFor="technology" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Technology
                    </label>
                    <select
                        id="technology"
                        value={selectedTechnology}
                        onChange={(e) => onTechnologyChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                        <option value="all">All Technologies</option>
                        {technologies.map((tech) => (
                            <option key={tech} value={tech}>
                                {tech}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                    <div className="flex items-end">
                        <button
                            onClick={onClearFilters}
                            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
                        {selectedCategory !== "all" && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                Category: {selectedCategory}
                                <button
                                    onClick={() => onCategoryChange("all")}
                                    className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                                >
                                    ×
                                </button>
                            </span>
                        )}
                        {selectedTechnology !== "all" && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                                Tech: {selectedTechnology}
                                <button
                                    onClick={() => onTechnologyChange("all")}
                                    className="ml-1 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                                >
                                    ×
                                </button>
                            </span>
                        )}
                        {searchQuery.trim() !== "" && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                                Search: "{searchQuery}"
                                <button
                                    onClick={() => onSearchChange("")}
                                    className="ml-1 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200"
                                >
                                    ×
                                </button>
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectFilters;
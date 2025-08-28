import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ProjectFilters from "../ProjectFilters";
import type { ProjectData } from "../../../types";

const mockProjects: ProjectData[] = [
    {
        id: "1",
        title: "Web App",
        description: "A web application",
        longDescription: "",
        technologies: ["React", "TypeScript"],
        images: [],
        category: "Web Application",
        featured: false,
        completedDate: "2024-01-01"
    },
    {
        id: "2",
        title: "Mobile App",
        description: "A mobile application",
        longDescription: "",
        technologies: ["React Native", "JavaScript"],
        images: [],
        category: "Mobile Application",
        featured: false,
        completedDate: "2024-02-01"
    }
];

describe("ProjectFilters", () => {
    const mockOnCategoryChange = vi.fn();
    const mockOnTechnologyChange = vi.fn();
    const mockOnSearchChange = vi.fn();
    const mockOnClearFilters = vi.fn();

    const defaultProps = {
        projects: mockProjects,
        selectedCategory: "all",
        selectedTechnology: "all",
        searchQuery: "",
        onCategoryChange: mockOnCategoryChange,
        onTechnologyChange: mockOnTechnologyChange,
        onSearchChange: mockOnSearchChange,
        onClearFilters: mockOnClearFilters
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders all filter controls", () => {
        render(<ProjectFilters {...defaultProps} />);

        expect(screen.getByLabelText("Search Projects")).toBeInTheDocument();
        expect(screen.getByLabelText("Category")).toBeInTheDocument();
        expect(screen.getByLabelText("Technology")).toBeInTheDocument();
    });

    it("displays unique categories from projects", () => {
        render(<ProjectFilters {...defaultProps} />);

        const categorySelect = screen.getByLabelText("Category");
        expect(categorySelect).toBeInTheDocument();

        // Check that options include the categories from mock projects
        fireEvent.click(categorySelect);
        expect(screen.getByText("All Categories")).toBeInTheDocument();
        expect(screen.getByText("Mobile Application")).toBeInTheDocument();
        expect(screen.getByText("Web Application")).toBeInTheDocument();
    });

    it("displays unique technologies from projects", () => {
        render(<ProjectFilters {...defaultProps} />);

        const technologySelect = screen.getByLabelText("Technology");
        expect(technologySelect).toBeInTheDocument();

        // Check that options include the technologies from mock projects
        fireEvent.click(technologySelect);
        expect(screen.getByText("All Technologies")).toBeInTheDocument();
        expect(screen.getByText("JavaScript")).toBeInTheDocument();
        expect(screen.getByText("React")).toBeInTheDocument();
        expect(screen.getByText("React Native")).toBeInTheDocument();
        expect(screen.getByText("TypeScript")).toBeInTheDocument();
    });

    it("calls onSearchChange when search input changes", () => {
        render(<ProjectFilters {...defaultProps} />);

        const searchInput = screen.getByLabelText("Search Projects");
        fireEvent.change(searchInput, { target: { value: "web" } });

        expect(mockOnSearchChange).toHaveBeenCalledWith("web");
    });

    it("calls onCategoryChange when category selection changes", () => {
        render(<ProjectFilters {...defaultProps} />);

        const categorySelect = screen.getByLabelText("Category");
        fireEvent.change(categorySelect, { target: { value: "Web Application" } });

        expect(mockOnCategoryChange).toHaveBeenCalledWith("Web Application");
    });

    it("calls onTechnologyChange when technology selection changes", () => {
        render(<ProjectFilters {...defaultProps} />);

        const technologySelect = screen.getByLabelText("Technology");
        fireEvent.change(technologySelect, { target: { value: "React" } });

        expect(mockOnTechnologyChange).toHaveBeenCalledWith("React");
    });

    it("shows clear filters button when filters are active", () => {
        render(
            <ProjectFilters
                {...defaultProps}
                selectedCategory="Web Application"
                searchQuery="test"
            />
        );

        expect(screen.getByText("Clear Filters")).toBeInTheDocument();
    });

    it("does not show clear filters button when no filters are active", () => {
        render(<ProjectFilters {...defaultProps} />);

        expect(screen.queryByText("Clear Filters")).not.toBeInTheDocument();
    });

    it("calls onClearFilters when clear filters button is clicked", () => {
        render(
            <ProjectFilters
                {...defaultProps}
                selectedCategory="Web Application"
            />
        );

        fireEvent.click(screen.getByText("Clear Filters"));
        expect(mockOnClearFilters).toHaveBeenCalled();
    });

    it("displays active filters", () => {
        render(
            <ProjectFilters
                {...defaultProps}
                selectedCategory="Web Application"
                selectedTechnology="React"
                searchQuery="test search"
            />
        );

        expect(screen.getByText("Active filters:")).toBeInTheDocument();
        expect(screen.getByText("Category: Web Application")).toBeInTheDocument();
        expect(screen.getByText("Tech: React")).toBeInTheDocument();
        expect(screen.getByText("Search: \"test search\"")).toBeInTheDocument();
    });

    it("allows removing individual active filters", () => {
        render(
            <ProjectFilters
                {...defaultProps}
                selectedCategory="Web Application"
                selectedTechnology="React"
                searchQuery="test"
            />
        );

        // Test category filter removal
        const categoryFilter = screen.getByText("Category: Web Application");
        const categoryRemoveButton = categoryFilter.parentElement?.querySelector("button");
        expect(categoryRemoveButton).toBeTruthy();
        fireEvent.click(categoryRemoveButton!);
        expect(mockOnCategoryChange).toHaveBeenCalledWith("all");
    });

    it("allows removing technology filter", () => {
        render(
            <ProjectFilters
                {...defaultProps}
                selectedCategory="all"
                selectedTechnology="React"
                searchQuery=""
            />
        );

        // Test technology filter removal
        const technologyFilter = screen.getByText("Tech: React");
        const technologyRemoveButton = technologyFilter.parentElement?.querySelector("button");
        expect(technologyRemoveButton).toBeTruthy();
        fireEvent.click(technologyRemoveButton!);
        expect(mockOnTechnologyChange).toHaveBeenCalledWith("all");
    });

    it("allows removing search filter", () => {
        render(
            <ProjectFilters
                {...defaultProps}
                selectedCategory="all"
                selectedTechnology="all"
                searchQuery="test"
            />
        );

        // Test search filter removal
        const searchFilter = screen.getByText("Search: \"test\"");
        const searchRemoveButton = searchFilter.parentElement?.querySelector("button");
        expect(searchRemoveButton).toBeTruthy();
        fireEvent.click(searchRemoveButton!);
        expect(mockOnSearchChange).toHaveBeenCalledWith("");
    });

    it("handles empty projects array gracefully", () => {
        render(
            <ProjectFilters
                {...defaultProps}
                projects={[]}
            />
        );

        expect(screen.getByLabelText("Search Projects")).toBeInTheDocument();
        expect(screen.getByLabelText("Category")).toBeInTheDocument();
        expect(screen.getByLabelText("Technology")).toBeInTheDocument();
    });
});
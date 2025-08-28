import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ProjectsGrid from "../ProjectsGrid";
import type { ProjectData } from "../../../types";

const mockProjects: ProjectData[] = [
    {
        id: "1",
        title: "Project 1",
        description: "First project",
        longDescription: "",
        technologies: ["React"],
        images: [],
        category: "Web Application",
        featured: false,
        completedDate: "2024-01-01"
    },
    {
        id: "2",
        title: "Project 2",
        description: "Second project",
        longDescription: "",
        technologies: ["Vue"],
        images: [],
        category: "Web Application",
        featured: true,
        completedDate: "2024-02-01"
    }
];

describe("ProjectsGrid", () => {
    const mockOnViewProject = vi.fn();
    const mockOnEditProject = vi.fn();
    const mockOnDeleteProject = vi.fn();

    const defaultProps = {
        projects: mockProjects,
        onViewProject: mockOnViewProject
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders all projects", () => {
        render(<ProjectsGrid {...defaultProps} />);

        expect(screen.getByText("Project 1")).toBeInTheDocument();
        expect(screen.getByText("Project 2")).toBeInTheDocument();
    });

    it("shows loading skeleton when isLoading is true", () => {
        render(<ProjectsGrid {...defaultProps} isLoading={true} />);

        // Should show skeleton cards instead of actual projects
        expect(screen.queryByText("Project 1")).not.toBeInTheDocument();
        expect(screen.queryByText("Project 2")).not.toBeInTheDocument();

        // Should show multiple skeleton cards
        const skeletonCards = screen.getAllByRole("generic").filter(el => 
            el.classList.contains("animate-pulse")
        );
        expect(skeletonCards.length).toBeGreaterThan(0);
    });

    it("shows empty state when no projects", () => {
        render(<ProjectsGrid {...defaultProps} projects={[]} />);

        expect(screen.getByText("No projects found")).toBeInTheDocument();
        expect(screen.getByText("No projects match your current filters. Try adjusting your search criteria.")).toBeInTheDocument();
    });

    it("shows add project button in empty state when in edit mode", () => {
        render(
            <ProjectsGrid
                {...defaultProps}
                projects={[]}
                isEditMode={true}
                onEditProject={mockOnEditProject}
            />
        );

        expect(screen.getByText("Add Your First Project")).toBeInTheDocument();
    });

    it("calls onEditProject with empty project when add first project button is clicked", () => {
        render(
            <ProjectsGrid
                {...defaultProps}
                projects={[]}
                isEditMode={true}
                onEditProject={mockOnEditProject}
            />
        );

        fireEvent.click(screen.getByText("Add Your First Project"));
    
        expect(mockOnEditProject).toHaveBeenCalledWith({
            id: "",
            title: "",
            description: "",
            longDescription: "",
            technologies: [],
            images: [],
            category: "",
            featured: false,
            completedDate: expect.any(String)
        });
    });

    it("passes edit mode props to ProjectCard components", () => {
        render(
            <ProjectsGrid
                {...defaultProps}
                isEditMode={true}
                onEditProject={mockOnEditProject}
                onDeleteProject={mockOnDeleteProject}
            />
        );

        // In edit mode, cards should show edit and delete buttons
        expect(screen.getAllByText("Edit")).toHaveLength(2);
        expect(screen.getAllByText("Delete")).toHaveLength(2);
    });

    it("does not show edit controls when not in edit mode", () => {
        render(<ProjectsGrid {...defaultProps} isEditMode={false} />);

        expect(screen.queryByText("Edit")).not.toBeInTheDocument();
        expect(screen.queryByText("Delete")).not.toBeInTheDocument();
    });

    it("calls onViewProject when a project card is clicked", () => {
        render(<ProjectsGrid {...defaultProps} />);

        // Click on the first project card
        const projectCard = screen.getByText("Project 1").closest("div");
        if (projectCard) {
            fireEvent.click(projectCard);
            expect(mockOnViewProject).toHaveBeenCalledWith(mockProjects[0]);
        }
    });

    it("calls onEditProject when edit button is clicked", () => {
        render(
            <ProjectsGrid
                {...defaultProps}
                isEditMode={true}
                onEditProject={mockOnEditProject}
            />
        );

        const editButtons = screen.getAllByText("Edit");
        if (editButtons[0]) fireEvent.click(editButtons[0]);
    
        expect(mockOnEditProject).toHaveBeenCalledWith(mockProjects[0]);
    });

    it("calls onDeleteProject when delete button is clicked and confirmed", () => {
    // Mock window.confirm to return true
        const originalConfirm = window.confirm;
        window.confirm = vi.fn(() => true);

        render(
            <ProjectsGrid
                {...defaultProps}
                isEditMode={true}
                onDeleteProject={mockOnDeleteProject}
            />
        );

        const deleteButtons = screen.getAllByText("Delete");
        if (deleteButtons[0]) fireEvent.click(deleteButtons[0]);
    
        expect(mockOnDeleteProject).toHaveBeenCalledWith("1");

        // Restore original confirm
        window.confirm = originalConfirm;
    });

    it("renders projects in a responsive grid layout", () => {
        render(<ProjectsGrid {...defaultProps} />);

        const gridContainer = screen.getByText("Project 1").closest(".grid");
        expect(gridContainer).toHaveClass("grid-cols-1", "md:grid-cols-2", "lg:grid-cols-3");
    });

    it("handles undefined callback props gracefully", () => {
        render(
            <ProjectsGrid
                projects={mockProjects}
                onViewProject={mockOnViewProject}
                isEditMode={true}
                // onEditProject and onDeleteProject are undefined
            />
        );

        // Should render without errors
        expect(screen.getByText("Project 1")).toBeInTheDocument();
        expect(screen.getByText("Project 2")).toBeInTheDocument();
    });
});
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ProjectsSection from "../ProjectsSection";
import type { ProjectData } from "../../../types";

const mockProjects: ProjectData[] = [
    {
        id: "1",
        title: "Test Project 1",
        description: "First test project",
        longDescription: "Detailed description of first project",
        technologies: ["React", "TypeScript"],
        images: ["https://example.com/image1.jpg"],
        liveUrl: "https://project1.com",
        githubUrl: "https://github.com/user/project1",
        category: "Web Application",
        featured: true,
        completedDate: "2024-01-15"
    },
    {
        id: "2",
        title: "Test Project 2",
        description: "Second test project",
        longDescription: "Detailed description of second project",
        technologies: ["Vue", "JavaScript"],
        images: [],
        liveUrl: "",
        githubUrl: "",
        category: "Mobile Application",
        featured: false,
        completedDate: "2024-02-01"
    }
];

describe("Projects Integration", () => {
    const mockOnUpdateProjects = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders projects section with all components", () => {
        render(
            <ProjectsSection
                projects={mockProjects}
                onUpdateProjects={mockOnUpdateProjects}
            />
        );

        // Section header
        expect(screen.getByText("My Projects")).toBeInTheDocument();

        // Filters
        expect(screen.getByLabelText("Search Projects")).toBeInTheDocument();
        expect(screen.getByLabelText("Category")).toBeInTheDocument();
        expect(screen.getByLabelText("Technology")).toBeInTheDocument();

        // Projects
        expect(screen.getByText("Test Project 1")).toBeInTheDocument();
        expect(screen.getByText("Test Project 2")).toBeInTheDocument();

        // Results summary
        expect(screen.getByText("Showing 2 of 2 projects")).toBeInTheDocument();
    });

    it("filters projects and updates results", () => {
        render(
            <ProjectsSection
                projects={mockProjects}
                onUpdateProjects={mockOnUpdateProjects}
            />
        );

        // Filter by category
        const categorySelect = screen.getByLabelText("Category");
        fireEvent.change(categorySelect, { target: { value: "Web Application" } });

        // Should show only one project
        expect(screen.getByText("Test Project 1")).toBeInTheDocument();
        expect(screen.queryByText("Test Project 2")).not.toBeInTheDocument();
        expect(screen.getByText(/Showing 1 of 2 projects/)).toBeInTheDocument();
        expect(screen.getByText(/\(filtered\)/)).toBeInTheDocument();
    });

    it("opens and closes project modal", () => {
        render(
            <ProjectsSection
                projects={mockProjects}
                onUpdateProjects={mockOnUpdateProjects}
            />
        );

        // Click on project to open modal
        const projectCard = screen.getByText("Test Project 1").closest("div");
        if (projectCard) {
            fireEvent.click(projectCard);
        }

        // Modal should be open
        expect(screen.getByText("Description")).toBeInTheDocument();
        expect(screen.getByText("Technologies Used")).toBeInTheDocument();

        // Close modal by clicking backdrop
        const modal = screen.getByText("Description").closest(".fixed");
        if (modal) {
            fireEvent.click(modal);
        }

        // Modal should be closed
        expect(screen.queryByText("Description")).not.toBeInTheDocument();
    });

    it("handles project management in edit mode", async () => {
        // Mock window.confirm for delete operations
        const originalConfirm = window.confirm;
        window.confirm = vi.fn(() => true);

        render(
            <ProjectsSection
                projects={mockProjects}
                onUpdateProjects={mockOnUpdateProjects}
                isEditMode={true}
            />
        );

        // Should show add project button
        expect(screen.getByText("Add New Project")).toBeInTheDocument();

        // Should show edit and delete buttons on cards
        expect(screen.getAllByText("Edit")).toHaveLength(2);
        expect(screen.getAllByText("Delete")).toHaveLength(2);

        // Delete a project
        const deleteButtons = screen.getAllByText("Delete");
        if (deleteButtons[0]) fireEvent.click(deleteButtons[0]);

        // Should delete Test Project 2 (id: "2") and leave Test Project 1 (id: "1")
        expect(mockOnUpdateProjects).toHaveBeenCalledWith([
            expect.objectContaining({ id: "1", title: "Test Project 1" })
        ]);

        // Restore window.confirm
        window.confirm = originalConfirm;
    });

    it("adds new project through form", async () => {
        render(
            <ProjectsSection
                projects={mockProjects}
                onUpdateProjects={mockOnUpdateProjects}
                isEditMode={true}
            />
        );

        // Click add project button
        fireEvent.click(screen.getByText("Add New Project"));

        // Form should open
        expect(screen.getByRole("heading", { name: "Add New Project" })).toBeInTheDocument();

        // Fill out form
        fireEvent.change(screen.getByLabelText("Project Title *"), {
            target: { value: "New Test Project" }
        });
        // Find the category input within the form (not the filter dropdown)
        const categoryInput = screen.getByRole("form").querySelector("input[name=\"category\"]") as HTMLInputElement;
        expect(categoryInput).toBeTruthy();
        fireEvent.change(categoryInput, {
            target: { value: "Test Category" }
        });
        fireEvent.change(screen.getByLabelText("Short Description *"), {
            target: { value: "New project description" }
        });
        fireEvent.change(screen.getByLabelText("Completion Date *"), {
            target: { value: "2024-03-01" }
        });

        // Add technology
        const techInput = screen.getByPlaceholderText("Add technology (e.g., React, TypeScript)");
        fireEvent.change(techInput, { target: { value: "React" } });
        const addTechButton = techInput.parentElement?.querySelector("button");
        expect(addTechButton).toBeTruthy();
        fireEvent.click(addTechButton!);

        // Wait for technology to be added (look for the tag, not the option)
        await waitFor(() => {
            const reactTags = screen.getAllByText("React");
            expect(reactTags.length).toBeGreaterThan(1); // Should have both option and tag
        });

        // Submit the form directly
        const form = screen.getByRole("form");
        fireEvent.submit(form);

        await waitFor(() => {
            expect(mockOnUpdateProjects).toHaveBeenCalledWith([
                ...mockProjects,
                expect.objectContaining({
                    title: "New Test Project",
                    category: "Test Category",
                    description: "New project description",
                    technologies: ["React"],
                    completedDate: "2024-03-01"
                })
            ]);
        });
    });

    it("searches projects by text", () => {
        render(
            <ProjectsSection
                projects={mockProjects}
                onUpdateProjects={mockOnUpdateProjects}
            />
        );

        // Search for "First"
        const searchInput = screen.getByLabelText("Search Projects");
        fireEvent.change(searchInput, { target: { value: "First" } });

        // Should show only the first project
        expect(screen.getByText("Test Project 1")).toBeInTheDocument();
        expect(screen.queryByText("Test Project 2")).not.toBeInTheDocument();
    });

    it("clears all filters", () => {
        render(
            <ProjectsSection
                projects={mockProjects}
                onUpdateProjects={mockOnUpdateProjects}
            />
        );

        // Apply filters
        const searchInput = screen.getByLabelText("Search Projects");
        fireEvent.change(searchInput, { target: { value: "First" } });

        const categorySelect = screen.getByLabelText("Category");
        fireEvent.change(categorySelect, { target: { value: "Web Application" } });

        // Clear filters button should appear
        expect(screen.getByText("Clear Filters")).toBeInTheDocument();

        // Click clear filters
        fireEvent.click(screen.getByText("Clear Filters"));

        // All projects should be visible again
        expect(screen.getByText("Test Project 1")).toBeInTheDocument();
        expect(screen.getByText("Test Project 2")).toBeInTheDocument();
        expect(screen.getByText("Showing 2 of 2 projects")).toBeInTheDocument();
    });
});
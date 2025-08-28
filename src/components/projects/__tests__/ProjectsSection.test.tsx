import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ProjectsSection from "../ProjectsSection";
import type { ProjectData } from "../../../types";

const mockProjects: ProjectData[] = [
    {
        id: "1",
        title: "Web App",
        description: "A web application",
        longDescription: "A web application description",
        technologies: ["React", "TypeScript"],
        images: [],
        liveUrl: "https://webapp.com",
        githubUrl: "https://github.com/user/webapp",
        category: "Web Application",
        featured: true,
        completedDate: "2024-01-15"
    },
    {
        id: "2",
        title: "Mobile App",
        description: "A mobile application",
        longDescription: "A mobile application description",
        technologies: ["React Native", "JavaScript"],
        images: [],
        liveUrl: "",
        githubUrl: "",
        category: "Mobile Application",
        featured: false,
        completedDate: "2024-02-01"
    }
];

describe("ProjectsSection", () => {
    const mockOnUpdateProjects = vi.fn();

    const defaultProps = {
        projects: mockProjects,
        onUpdateProjects: mockOnUpdateProjects
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders section header and description", () => {
        render(<ProjectsSection {...defaultProps} />);

        expect(screen.getByText("My Projects")).toBeInTheDocument();
        expect(screen.getByText(/A showcase of my work/)).toBeInTheDocument();
    });

    it("renders projects grid with all projects", () => {
        render(<ProjectsSection {...defaultProps} />);

        expect(screen.getByText("Web App")).toBeInTheDocument();
        expect(screen.getByText("Mobile App")).toBeInTheDocument();
    });

    it("shows add project button in edit mode", () => {
        render(<ProjectsSection {...defaultProps} isEditMode={true} />);

        expect(screen.getByText("Add New Project")).toBeInTheDocument();
    });

    it("does not show add project button when not in edit mode", () => {
        render(<ProjectsSection {...defaultProps} isEditMode={false} />);

        expect(screen.queryByText("Add New Project")).not.toBeInTheDocument();
    });

    it("opens project form when add project button is clicked", () => {
        render(<ProjectsSection {...defaultProps} isEditMode={true} />);

        fireEvent.click(screen.getByText("Add New Project"));

        expect(screen.getByRole("heading", { name: "Add New Project" })).toBeInTheDocument();
    });

    it("filters projects by search query", () => {
        render(<ProjectsSection {...defaultProps} />);

        const searchInput = screen.getByLabelText("Search Projects");
        fireEvent.change(searchInput, { target: { value: "web" } });

        // Should show only the web app
        expect(screen.getByText("Web App")).toBeInTheDocument();
        expect(screen.queryByText("Mobile App")).not.toBeInTheDocument();
    });

    it("filters projects by category", () => {
        render(<ProjectsSection {...defaultProps} />);

        const categorySelect = screen.getByLabelText("Category");
        fireEvent.change(categorySelect, { target: { value: "Web Application" } });

        // Should show only the web app
        expect(screen.getByText("Web App")).toBeInTheDocument();
        expect(screen.queryByText("Mobile App")).not.toBeInTheDocument();
    });

    it("filters projects by technology", () => {
        render(<ProjectsSection {...defaultProps} />);

        const technologySelect = screen.getByLabelText("Technology");
        fireEvent.change(technologySelect, { target: { value: "React" } });

        // Should show only the web app (which uses React)
        expect(screen.getByText("Web App")).toBeInTheDocument();
        expect(screen.queryByText("Mobile App")).not.toBeInTheDocument();
    });

    it("clears all filters when clear filters is clicked", () => {
        render(<ProjectsSection {...defaultProps} />);

        // Apply some filters
        const searchInput = screen.getByLabelText("Search Projects");
        fireEvent.change(searchInput, { target: { value: "web" } });

        const categorySelect = screen.getByLabelText("Category");
        fireEvent.change(categorySelect, { target: { value: "Web Application" } });

        // Clear filters
        fireEvent.click(screen.getByText("Clear Filters"));

        // Both projects should be visible again
        expect(screen.getByText("Web App")).toBeInTheDocument();
        expect(screen.getByText("Mobile App")).toBeInTheDocument();
    });

    it("shows results summary", () => {
        render(<ProjectsSection {...defaultProps} />);

        expect(screen.getByText("Showing 2 of 2 projects")).toBeInTheDocument();
    });

    it("shows filtered results summary", () => {
        render(<ProjectsSection {...defaultProps} />);

        const searchInput = screen.getByLabelText("Search Projects");
        fireEvent.change(searchInput, { target: { value: "web" } });

        expect(screen.getByText(/Showing 1 of 2 projects/)).toBeInTheDocument();
        expect(screen.getByText(/\(filtered\)/)).toBeInTheDocument();
    });

    it("opens project modal when project is viewed", () => {
        render(<ProjectsSection {...defaultProps} />);

        // Click on a project card
        const projectCard = screen.getByText("Web App").closest("div");
        if (projectCard) {
            fireEvent.click(projectCard);
        }

        // Modal should open with project details
        expect(screen.getByText(/Completed:/)).toBeInTheDocument();
    });

    it("opens project form when project is edited", async () => {
        render(<ProjectsSection {...defaultProps} isEditMode={true} />);

        // Click edit button on first project (Mobile App due to sorting)
        const editButtons = screen.getAllByText("Edit");
        expect(editButtons.length).toBeGreaterThan(0);
        fireEvent.click(editButtons[0]!);

        // Form should open in edit mode
        await waitFor(() => {
            expect(screen.getByText("Edit Project")).toBeInTheDocument();
        });

        // Should show Mobile App data (first project after sorting)
        await waitFor(() => {
            expect(screen.getByDisplayValue("Mobile App")).toBeInTheDocument();
        });
    });

    it("calls onUpdateProjects when project is deleted", () => {
        // Mock window.confirm to return true
        const originalConfirm = window.confirm;
        window.confirm = vi.fn(() => true);

        render(<ProjectsSection {...defaultProps} isEditMode={true} />);

        // Click delete button on first project
        const deleteButtons = screen.getAllByText("Delete");
        if (deleteButtons[0]) fireEvent.click(deleteButtons[0]);

        // Should delete Mobile App (id: "2") and leave Web App (id: "1")
        expect(mockOnUpdateProjects).toHaveBeenCalledWith([
            expect.objectContaining({ id: "1", title: "Web App" })
        ]);

        // Restore original confirm
        window.confirm = originalConfirm;
    });

    it("calls onUpdateProjects when new project is saved", async () => {
        render(<ProjectsSection {...defaultProps} isEditMode={true} />);

        // Open add project form
        fireEvent.click(screen.getByText("Add New Project"));

        // Fill out the form
        fireEvent.change(screen.getByLabelText("Project Title *"), {
            target: { value: "New Project" }
        });
        // Find the category input within the form (not the filter dropdown)
        const categoryInput = screen.getByRole("form").querySelector("input[name=\"category\"]") as HTMLInputElement;
        expect(categoryInput).toBeTruthy();
        fireEvent.change(categoryInput, {
            target: { value: "Test" }
        });
        fireEvent.change(screen.getByLabelText("Short Description *"), {
            target: { value: "Test description" }
        });
        fireEvent.change(screen.getByLabelText("Completion Date *"), {
            target: { value: "2024-03-01" }
        });

        // Add a technology
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
                    title: "New Project",
                    category: "Test",
                    description: "Test description",
                    technologies: ["React"],
                    completedDate: "2024-03-01"
                })
            ]);
        });
    });

    it("calls onUpdateProjects when existing project is updated", async () => {
        render(<ProjectsSection {...defaultProps} isEditMode={true} />);

        // Click edit on first project (Mobile App due to sorting)
        const editButtons = screen.getAllByText("Edit");
        expect(editButtons.length).toBeGreaterThan(0);
        fireEvent.click(editButtons[0]!);

        // Wait for form to open and then update the title
        await waitFor(() => {
            expect(screen.getByDisplayValue("Mobile App")).toBeInTheDocument();
        });

        const titleInput = screen.getByDisplayValue("Mobile App");
        fireEvent.change(titleInput, { target: { value: "Updated Mobile App" } });

        // Submit the form
        fireEvent.click(screen.getByText("Update Project"));

        await waitFor(() => {
            expect(mockOnUpdateProjects).toHaveBeenCalledWith([
                mockProjects[0], // Web App
                expect.objectContaining({
                    id: "2",
                    title: "Updated Mobile App"
                })
            ]);
        });
    });

    it("closes modal when close button is clicked", () => {
        render(<ProjectsSection {...defaultProps} />);

        // Open modal
        const projectCard = screen.getByText("Web App").closest("div");
        if (projectCard) {
            fireEvent.click(projectCard);
        }

        // Close modal
        const closeButton = screen.getByRole("button", { name: /close modal/i });
        fireEvent.click(closeButton);

        // Modal should be closed
        expect(screen.queryByText("Completed:")).not.toBeInTheDocument();
    });

    it("shows loading state", () => {
        render(<ProjectsSection {...defaultProps} isLoading={true} />);

        // Should show skeleton loading cards
        const { container } = render(<ProjectsSection {...defaultProps} isLoading={true} />);
        const skeletonCards = container.querySelectorAll(".animate-pulse");
        expect(skeletonCards.length).toBeGreaterThan(0);
    });

    it("sorts projects by completion date (newest first)", () => {
        const unsortedProjects: ProjectData[] = [
            { ...mockProjects[0], completedDate: "2024-01-01" } as ProjectData,
            { ...mockProjects[1], completedDate: "2024-03-01" } as ProjectData
        ];

        render(<ProjectsSection {...defaultProps} projects={unsortedProjects} />);

        const projectTitles = screen.getAllByText(/App$/);
        // Mobile App (March) should appear before Web App (January)
        expect(projectTitles[0]).toHaveTextContent("Mobile App");
        expect(projectTitles[1]).toHaveTextContent("Web App");
    });
});
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ProjectCard from "../ProjectCard";
import type { ProjectData } from "../../../types";

const mockProject: ProjectData = {
    id: "project-1",
    title: "Test Project",
    description: "A test project description",
    longDescription: "A longer test project description",
    technologies: ["React", "TypeScript", "Tailwind CSS"],
    images: ["https://example.com/image1.jpg"],
    liveUrl: "https://example.com",
    githubUrl: "https://github.com/user/repo",
    category: "Web Application",
    featured: true,
    completedDate: "2024-01-15"
};

describe("ProjectCard", () => {
    const mockOnView = vi.fn();
    const mockOnEdit = vi.fn();
    const mockOnDelete = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders project information correctly", () => {
        render(
            <ProjectCard
                project={mockProject}
                onView={mockOnView}
            />
        );

        expect(screen.getByText("Test Project")).toBeInTheDocument();
        expect(screen.getByText("A test project description")).toBeInTheDocument();
        expect(screen.getByText("Web Application")).toBeInTheDocument();
        expect(screen.getByText("Featured")).toBeInTheDocument();
        expect(screen.getByText("React")).toBeInTheDocument();
        expect(screen.getByText("TypeScript")).toBeInTheDocument();
        expect(screen.getByText("Tailwind CSS")).toBeInTheDocument();
    });

    it("displays project image when available", () => {
        render(
            <ProjectCard
                project={mockProject}
                onView={mockOnView}
            />
        );

        const image = screen.getByAltText("Test Project");
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute("src", "https://example.com/image1.jpg");
    });

    it("shows featured badge for featured projects", () => {
        render(
            <ProjectCard
                project={mockProject}
                onView={mockOnView}
            />
        );

        expect(screen.getByText("Featured")).toBeInTheDocument();
    });

    it("does not show featured badge for non-featured projects", () => {
        const nonFeaturedProject = { ...mockProject, featured: false };
        render(
            <ProjectCard
                project={nonFeaturedProject}
                onView={mockOnView}
            />
        );

        expect(screen.queryByText("Featured")).not.toBeInTheDocument();
    });

    it("displays external links correctly", () => {
        render(
            <ProjectCard
                project={mockProject}
                onView={mockOnView}
            />
        );

        const liveLink = screen.getByText("Live Demo");
        const githubLink = screen.getByText("GitHub");

        expect(liveLink).toHaveAttribute("href", "https://example.com");
        expect(githubLink).toHaveAttribute("href", "https://github.com/user/repo");
    });

    it("calls onView when card is clicked", () => {
        render(
            <ProjectCard
                project={mockProject}
                onView={mockOnView}
            />
        );

        fireEvent.click(screen.getByText("Test Project").closest("div")!);
        expect(mockOnView).toHaveBeenCalledWith(mockProject);
    });

    it("shows edit and delete buttons in edit mode", () => {
        render(
            <ProjectCard
                project={mockProject}
                onView={mockOnView}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
                isEditMode={true}
            />
        );

        expect(screen.getByText("Edit")).toBeInTheDocument();
        expect(screen.getByText("Delete")).toBeInTheDocument();
    });

    it("does not show edit and delete buttons when not in edit mode", () => {
        render(
            <ProjectCard
                project={mockProject}
                onView={mockOnView}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
                isEditMode={false}
            />
        );

        expect(screen.queryByText("Edit")).not.toBeInTheDocument();
        expect(screen.queryByText("Delete")).not.toBeInTheDocument();
    });

    it("calls onEdit when edit button is clicked", () => {
        render(
            <ProjectCard
                project={mockProject}
                onView={mockOnView}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
                isEditMode={true}
            />
        );

        fireEvent.click(screen.getByText("Edit"));
        expect(mockOnEdit).toHaveBeenCalledWith(mockProject);
        expect(mockOnView).not.toHaveBeenCalled();
    });

    it("calls onDelete when delete button is clicked and confirmed", () => {
    // Mock window.confirm to return true
        const originalConfirm = window.confirm;
        window.confirm = vi.fn(() => true);

        render(
            <ProjectCard
                project={mockProject}
                onView={mockOnView}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
                isEditMode={true}
            />
        );

        fireEvent.click(screen.getByText("Delete"));
        expect(mockOnDelete).toHaveBeenCalledWith("project-1");
        expect(mockOnView).not.toHaveBeenCalled();

        // Restore original confirm
        window.confirm = originalConfirm;
    });

    it("does not call onDelete when delete is cancelled", () => {
    // Mock window.confirm to return false
        const originalConfirm = window.confirm;
        window.confirm = vi.fn(() => false);

        render(
            <ProjectCard
                project={mockProject}
                onView={mockOnView}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
                isEditMode={true}
            />
        );

        fireEvent.click(screen.getByText("Delete"));
        expect(mockOnDelete).not.toHaveBeenCalled();

        // Restore original confirm
        window.confirm = originalConfirm;
    });

    it("truncates technology list when more than 3 technologies", () => {
        const projectWithManyTechs = {
            ...mockProject,
            technologies: ["React", "TypeScript", "Tailwind CSS", "Node.js", "Express"]
        };

        render(
            <ProjectCard
                project={projectWithManyTechs}
                onView={mockOnView}
            />
        );

        expect(screen.getByText("React")).toBeInTheDocument();
        expect(screen.getByText("TypeScript")).toBeInTheDocument();
        expect(screen.getByText("Tailwind CSS")).toBeInTheDocument();
        expect(screen.getByText("+2 more")).toBeInTheDocument();
        expect(screen.queryByText("Node.js")).not.toBeInTheDocument();
    });

    it("prevents event propagation on external link clicks", () => {
        render(
            <ProjectCard
                project={mockProject}
                onView={mockOnView}
            />
        );

        fireEvent.click(screen.getByText("Live Demo"));
        expect(mockOnView).not.toHaveBeenCalled();

        fireEvent.click(screen.getByText("GitHub"));
        expect(mockOnView).not.toHaveBeenCalled();
    });
});
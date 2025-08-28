import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ProjectForm from "../ProjectForm";
import type { ProjectData } from "../../../types";

const mockProject: ProjectData = {
    id: "project-1",
    title: "Test Project",
    description: "A test project",
    longDescription: "A longer description",
    technologies: ["React", "TypeScript"],
    images: ["https://example.com/image1.jpg"],
    liveUrl: "https://example.com",
    githubUrl: "https://github.com/user/repo",
    category: "Web Application",
    featured: true,
    completedDate: "2024-01-15"
};

describe("ProjectForm", () => {
    const mockOnClose = vi.fn();
    const mockOnSave = vi.fn();

    const defaultProps = {
        isOpen: true,
        onClose: mockOnClose,
        onSave: mockOnSave
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("does not render when isOpen is false", () => {
        render(
            <ProjectForm
                {...defaultProps}
                isOpen={false}
            />
        );

        expect(screen.queryByText("Add New Project")).not.toBeInTheDocument();
    });

    it("renders add form when no project is provided", () => {
        render(<ProjectForm {...defaultProps} />);

        expect(screen.getByText("Add New Project")).toBeInTheDocument();
        expect(screen.getByText("Create Project")).toBeInTheDocument();
    });

    it("renders edit form when project is provided", () => {
        render(
            <ProjectForm
                {...defaultProps}
                project={mockProject}
            />
        );

        expect(screen.getByText("Edit Project")).toBeInTheDocument();
        expect(screen.getByText("Update Project")).toBeInTheDocument();
    });

    it("populates form fields with project data when editing", () => {
        render(
            <ProjectForm
                {...defaultProps}
                project={mockProject}
            />
        );

        expect(screen.getByDisplayValue("Test Project")).toBeInTheDocument();
        expect(screen.getByDisplayValue("A test project")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Web Application")).toBeInTheDocument();
        expect(screen.getByDisplayValue("https://example.com")).toBeInTheDocument();
        expect(screen.getByDisplayValue("https://github.com/user/repo")).toBeInTheDocument();
        expect(screen.getByDisplayValue("2024-01-15")).toBeInTheDocument();
    
        const featuredCheckbox = screen.getByLabelText("Featured Project") as HTMLInputElement;
        expect(featuredCheckbox.checked).toBe(true);
    });

    it("shows validation errors for required fields", async () => {
        render(<ProjectForm {...defaultProps} />);

        // Try to submit without filling required fields
        fireEvent.click(screen.getByText("Create Project"));

        await waitFor(() => {
            expect(screen.getByText("Title is required")).toBeInTheDocument();
            expect(screen.getByText("Description is required")).toBeInTheDocument();
            expect(screen.getByText("Category is required")).toBeInTheDocument();
            expect(screen.getByText("At least one technology is required")).toBeInTheDocument();
        });

        expect(mockOnSave).not.toHaveBeenCalled();
    });

    it("allows adding and removing technologies", () => {
        render(<ProjectForm {...defaultProps} />);

        const techInput = screen.getByPlaceholderText("Add technology (e.g., React, TypeScript)");
        const addButton = techInput.parentElement?.querySelector("button");

        // Add a technology
        fireEvent.change(techInput, { target: { value: "React" } });
        if (addButton) fireEvent.click(addButton);

        expect(screen.getByText("React")).toBeInTheDocument();
        expect(techInput).toHaveValue("");

        // Add another technology
        fireEvent.change(techInput, { target: { value: "TypeScript" } });
        if (addButton) fireEvent.click(addButton);

        expect(screen.getByText("TypeScript")).toBeInTheDocument();

        // Remove a technology
        const reactTag = screen.getByText("React").parentElement;
        const removeButton = reactTag?.querySelector("button");
        if (removeButton) {
            fireEvent.click(removeButton);
        }

        expect(screen.queryByText("React")).not.toBeInTheDocument();
        expect(screen.getByText("TypeScript")).toBeInTheDocument();
    });

    it("allows adding technology by pressing Enter", () => {
        render(<ProjectForm {...defaultProps} />);

        const techInput = screen.getByPlaceholderText("Add technology (e.g., React, TypeScript)");

        fireEvent.change(techInput, { target: { value: "Vue.js" } });
        fireEvent.keyPress(techInput, { key: "Enter", code: "Enter", charCode: 13 });

        expect(screen.getByText("Vue.js")).toBeInTheDocument();
        expect(techInput).toHaveValue("");
    });

    it("prevents adding duplicate technologies", () => {
        render(<ProjectForm {...defaultProps} />);

        const techInput = screen.getByPlaceholderText("Add technology (e.g., React, TypeScript)");
        const addButton = techInput.parentElement?.querySelector("button");

        // Add React twice
        fireEvent.change(techInput, { target: { value: "React" } });
        if (addButton) fireEvent.click(addButton);
    
        fireEvent.change(techInput, { target: { value: "React" } });
        if (addButton) fireEvent.click(addButton);

        // Should only appear once
        const reactTags = screen.getAllByText("React");
        expect(reactTags).toHaveLength(1);
    });

    it("allows adding and removing images", () => {
        render(<ProjectForm {...defaultProps} />);

        const imageInput = screen.getByPlaceholderText("Add image URL");
        const addImageButton = imageInput.parentElement?.querySelector("button");

        // Add an image
        fireEvent.change(imageInput, { target: { value: "https://example.com/image.jpg" } });
        if (addImageButton) fireEvent.click(addImageButton);

        const image = screen.getByAltText("Project image 1");
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute("src", "https://example.com/image.jpg");

        // Remove the image
        const removeButton = image.parentElement?.querySelector("button");
        if (removeButton) {
            fireEvent.click(removeButton);
        }

        expect(screen.queryByAltText("Project image 1")).not.toBeInTheDocument();
    });

    it("calls onSave with correct data when form is submitted", async () => {
        render(<ProjectForm {...defaultProps} />);

        // Fill out the form
        fireEvent.change(screen.getByLabelText("Project Title *"), {
            target: { value: "New Project" }
        });
        fireEvent.change(screen.getByLabelText("Category *"), {
            target: { value: "Web App" }
        });
        fireEvent.change(screen.getByLabelText("Short Description *"), {
            target: { value: "A new project" }
        });

        // Add a technology
        const techInput = screen.getByPlaceholderText("Add technology (e.g., React, TypeScript)");
        fireEvent.change(techInput, { target: { value: "React" } });
        const addTechButton = techInput.parentElement?.querySelector("button");
        if (addTechButton) fireEvent.click(addTechButton);

        // Submit the form
        fireEvent.click(screen.getByText("Create Project"));

        await waitFor(() => {
            expect(mockOnSave).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: "New Project",
                    category: "Web App",
                    description: "A new project",
                    technologies: ["React"],
                    featured: false
                })
            );
        });

        expect(mockOnClose).toHaveBeenCalled();
    });

    it("calls onClose when cancel button is clicked", () => {
        render(<ProjectForm {...defaultProps} />);

        fireEvent.click(screen.getByText("Cancel"));
        expect(mockOnClose).toHaveBeenCalled();
    });

    it("calls onClose when backdrop is clicked", () => {
        render(<ProjectForm {...defaultProps} />);

        const backdrop = screen.getByText("Add New Project").closest(".fixed");
        if (backdrop) {
            fireEvent.click(backdrop);
            expect(mockOnClose).toHaveBeenCalled();
        }
    });

    it("calls onClose when escape key is pressed", async () => {
        render(<ProjectForm {...defaultProps} />);

        // Wait for component to mount and add event listeners
        await waitFor(() => {
            expect(screen.getByText("Create Project")).toBeInTheDocument();
        });

        fireEvent.keyDown(document, { key: "Escape", code: "Escape", keyCode: 27 });
        expect(mockOnClose).toHaveBeenCalled();
    });

    it("clears validation errors when user starts typing", async () => {
        render(<ProjectForm {...defaultProps} />);

        // Submit to trigger validation errors
        fireEvent.click(screen.getByText("Create Project"));

        await waitFor(() => {
            expect(screen.getByText("Title is required")).toBeInTheDocument();
        });

        // Start typing in title field
        fireEvent.change(screen.getByLabelText("Project Title *"), {
            target: { value: "T" }
        });

        // Error should be cleared
        expect(screen.queryByText("Title is required")).not.toBeInTheDocument();
    });

    it("generates ID for new projects", async () => {
        render(<ProjectForm {...defaultProps} />);

        // Fill out minimum required fields
        fireEvent.change(screen.getByLabelText("Project Title *"), {
            target: { value: "Test" }
        });
        fireEvent.change(screen.getByLabelText("Category *"), {
            target: { value: "Test" }
        });
        fireEvent.change(screen.getByLabelText("Short Description *"), {
            target: { value: "Test" }
        });

        // Add a technology
        const techInput = screen.getByPlaceholderText("Add technology (e.g., React, TypeScript)");
        fireEvent.change(techInput, { target: { value: "React" } });
        const addTechButton = techInput.parentElement?.querySelector("button");
        if (addTechButton) fireEvent.click(addTechButton);

        fireEvent.click(screen.getByText("Create Project"));

        await waitFor(() => {
            expect(mockOnSave).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: expect.stringMatching(/^project-\d+-[a-z0-9]+$/)
                })
            );
        });
    });

    it("preserves existing ID when editing", async () => {
        render(
            <ProjectForm
                {...defaultProps}
                project={mockProject}
            />
        );

        fireEvent.click(screen.getByText("Update Project"));

        await waitFor(() => {
            expect(mockOnSave).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: "project-1"
                })
            );
        });
    });
});
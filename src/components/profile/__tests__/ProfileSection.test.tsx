/**
 * Tests for ProfileSection component
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { ProfileSection } from "../ProfileSection";
import { useApp } from "../../../contexts/AppContext";
import { useAuth } from "../../../contexts/AuthContext";
import type { PortfolioData } from "../../../types/portfolio";

// Mock the context hooks
vi.mock("../../../contexts/AppContext", () => ({
    useApp: vi.fn(),
    AppProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

vi.mock("../../../contexts/AuthContext", () => ({
    useAuth: vi.fn(),
    AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

const mockPortfolioData: PortfolioData = {
    profile: {
        name: "John Doe",
        title: "Software Developer",
        photo: "/test-photo.jpg",
        summary: "Experienced software developer with expertise in React and TypeScript.",
        description: "I am a passionate developer who loves creating innovative solutions.",
        location: "San Francisco, CA",
        email: "john.doe@example.com"
    },
    projects: [],
    resume: {
        experience: [],
        education: [],
        skills: [],
        downloadUrl: ""
    },
    certificates: [],
    socialLinks: [],
    config: {
        theme: "light",
        language: "en",
        seo: {
            title: "Portfolio",
            description: "My portfolio",
            keywords: []
        }
    }
};

// Setup mock implementations
const setupMocks = (isEditMode = false, isAuthenticated = false, portfolioData: PortfolioData | null = mockPortfolioData) => {
    (useApp as ReturnType<typeof vi.fn>).mockReturnValue({
        portfolioData,
        isEditMode,
        isLoading: false,
        error: null,
        toggleEditMode: vi.fn(),
        setEditMode: vi.fn(),
        reloadContent: vi.fn(),
        saveContent: vi.fn().mockResolvedValue(undefined)
    });

    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
        isAuthenticated,
        isLoading: false,
        sessionTimeRemaining: 3600,
        lockoutInfo: { isLockedOut: false },
        login: vi.fn(),
        logout: vi.fn(),
        extendSession: vi.fn()
    });
};

describe("ProfileSection", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("renders profile information correctly", () => {
        setupMocks();
        render(<ProfileSection />);

        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("Software Developer")).toBeInTheDocument();
        expect(screen.getByText("San Francisco, CA")).toBeInTheDocument();
        expect(screen.getByText("john.doe@example.com")).toBeInTheDocument();
        expect(screen.getByText("Experienced software developer with expertise in React and TypeScript.")).toBeInTheDocument();
        expect(screen.getByText("I am a passionate developer who loves creating innovative solutions.")).toBeInTheDocument();
    });

    it("displays profile image with correct alt text", () => {
        setupMocks();
        render(<ProfileSection />);

        const profileImage = screen.getByAltText("John Doe");
        expect(profileImage).toBeInTheDocument();
        expect(profileImage).toHaveAttribute("src", "/test-photo.jpg");
    });

    it("shows loading state when portfolio data is not available", () => {
        setupMocks(false, false, null);
        render(<ProfileSection />);

        expect(screen.getByText("Loading profile...")).toBeInTheDocument();
    });

    it("does not show edit button when not in edit mode", () => {
        setupMocks(false, false);
        render(<ProfileSection />);

        expect(screen.queryByText("Edit Profile")).not.toBeInTheDocument();
    });

    it("does not show edit button when in edit mode but not authenticated", () => {
        setupMocks(true, false);
        render(<ProfileSection />);

        expect(screen.queryByText("Edit Profile")).not.toBeInTheDocument();
    });

    it("shows edit button when in edit mode and authenticated", () => {
        setupMocks(true, true);
        render(<ProfileSection />);

        expect(screen.getByText("Edit Profile")).toBeInTheDocument();
    });

    it("enters edit mode when edit button is clicked", async () => {
        const user = userEvent.setup();
        setupMocks(true, true);
        
        render(<ProfileSection />);

        const editButton = screen.getByText("Edit Profile");
        await user.click(editButton);

        expect(screen.getByText("Cancel")).toBeInTheDocument();
        expect(screen.getByText("Save Changes")).toBeInTheDocument();
        expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Software Developer")).toBeInTheDocument();
    });

    it("cancels edit mode when cancel button is clicked", async () => {
        const user = userEvent.setup();
        setupMocks(true, true);
        
        render(<ProfileSection />);

        // Enter edit mode
        const editButton = screen.getByText("Edit Profile");
        await user.click(editButton);

        // Cancel edit mode
        const cancelButton = screen.getByText("Cancel");
        await user.click(cancelButton);

        expect(screen.getByText("Edit Profile")).toBeInTheDocument();
        expect(screen.queryByText("Cancel")).not.toBeInTheDocument();
        expect(screen.queryByText("Save Changes")).not.toBeInTheDocument();
    });

    it("allows editing profile fields", async () => {
        const user = userEvent.setup();
        setupMocks(true, true);
        
        render(<ProfileSection />);

        // Enter edit mode
        const editButton = screen.getByText("Edit Profile");
        await user.click(editButton);

        // Edit name field
        const nameInput = screen.getByDisplayValue("John Doe");
        await user.clear(nameInput);
        await user.type(nameInput, "Jane Smith");

        expect(screen.getByDisplayValue("Jane Smith")).toBeInTheDocument();

        // Edit title field
        const titleInput = screen.getByDisplayValue("Software Developer");
        await user.clear(titleInput);
        await user.type(titleInput, "Senior Developer");

        expect(screen.getByDisplayValue("Senior Developer")).toBeInTheDocument();
    });

    it("handles image upload", async () => {
        const user = userEvent.setup();
        
        // Mock FileReader
        const mockFileReader = {
            readAsDataURL: vi.fn(),
            result: "data:image/jpeg;base64,mockbase64data",
            onload: null as ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null,
            onerror: null as ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null
        };
        
        (globalThis as typeof globalThis & { FileReader: typeof FileReader }).FileReader = vi.fn(() => mockFileReader) as unknown as typeof FileReader;
        setupMocks(true, true);

        render(<ProfileSection />);

        // Enter edit mode
        const editButton = screen.getByText("Edit Profile");
        await user.click(editButton);

        // Click change photo button
        const changePhotoButton = screen.getByText("Change Photo");
        await user.click(changePhotoButton);

        // Find the hidden file input
        const fileInput = document.querySelector("input[type=\"file\"]");
        expect(fileInput).toBeInTheDocument();

        const file = new File(["mock image"], "test.jpg", { type: "image/jpeg" });
        
        if (fileInput) {
            fireEvent.change(fileInput, { target: { files: [file] } });
            
            // Simulate FileReader onload
            if (mockFileReader.onload) {
                mockFileReader.onload.call(mockFileReader as unknown as FileReader, { target: mockFileReader } as unknown as ProgressEvent<FileReader>);
            }
        }

        expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(file);
    });

    it("validates image file type", async () => {
        const user = userEvent.setup();
        const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
        setupMocks(true, true);
        
        render(<ProfileSection />);

        // Enter edit mode
        const editButton = screen.getByText("Edit Profile");
        await user.click(editButton);

        // Try to upload non-image file
        const fileInput = document.querySelector("input[type=\"file\"]") as HTMLInputElement;
        const textFile = new File(["text content"], "test.txt", { type: "text/plain" });
        
        if (fileInput) {
            fireEvent.change(fileInput, { target: { files: [textFile] } });
        }

        expect(alertSpy).toHaveBeenCalledWith("Please select an image file");
        alertSpy.mockRestore();
    });

    it("validates image file size", async () => {
        const user = userEvent.setup();
        const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
        setupMocks(true, true);
        
        render(<ProfileSection />);

        // Enter edit mode
        const editButton = screen.getByText("Edit Profile");
        await user.click(editButton);

        // Try to upload large file (6MB)
        const fileInput = document.querySelector("input[type=\"file\"]") as HTMLInputElement;
        const largeFile = new File([new ArrayBuffer(6 * 1024 * 1024)], "large.jpg", { type: "image/jpeg" });
        
        if (fileInput) {
            fireEvent.change(fileInput, { target: { files: [largeFile] } });
        }

        expect(alertSpy).toHaveBeenCalledWith("Image size must be less than 5MB");
        alertSpy.mockRestore();
    });

    it("handles image fallback on error", () => {
        setupMocks();
        render(<ProfileSection />);

        const profileImage = screen.getByAltText("John Doe");
        
        // Simulate image load error
        fireEvent.error(profileImage);

        expect(profileImage).toHaveAttribute("src", "/placeholder-avatar.jpg");
    });

    it("applies custom className", () => {
        setupMocks();
        const { container } = render(<ProfileSection className="custom-class" />);

        expect(container.querySelector(".profile-section")).toHaveClass("custom-class");
    });

    it("makes email clickable with mailto link", () => {
        setupMocks();
        render(<ProfileSection />);

        const emailLink = screen.getByRole("link", { name: "john.doe@example.com" });
        expect(emailLink).toHaveAttribute("href", "mailto:john.doe@example.com");
    });
});
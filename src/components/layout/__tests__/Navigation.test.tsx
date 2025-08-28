/**
 * Tests for Navigation component
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Navigation } from "../Navigation";
import { AuthProvider } from "../../../contexts/AuthContext";
import { AppProvider } from "../../../contexts/AppContext";

// Mock fetch for content loading
(globalThis as unknown as { fetch: typeof vi.fn }).fetch = vi.fn().mockResolvedValue({
    ok: false,
    status: 404
});

const MockProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <AuthProvider>
        <AppProvider>
            {children}
        </AppProvider>
    </AuthProvider>
);

describe("Navigation", () => {
    const mockOnSectionChange = vi.fn();

    beforeEach(() => {
        mockOnSectionChange.mockClear();
    });

    it("renders navigation items", () => {
        render(
            <MockProviders>
                <Navigation currentSection="profile" onSectionChange={mockOnSectionChange} />
            </MockProviders>
        );

        // Check that navigation items exist (both desktop and mobile versions)
        expect(screen.getAllByText("About")).toHaveLength(2);
        expect(screen.getAllByText("Projects")).toHaveLength(2);
        expect(screen.getAllByText("Resume")).toHaveLength(2);
        expect(screen.getAllByText("Certificates")).toHaveLength(2);
        expect(screen.getAllByText("Contact")).toHaveLength(2);
    });

    it("highlights current section", () => {
        render(
            <MockProviders>
                <Navigation currentSection="projects" onSectionChange={mockOnSectionChange} />
            </MockProviders>
        );

        const projectsButtons = screen.getAllByText("Projects");
        const desktopProjectsButton = projectsButtons[0]?.closest("button");
        expect(desktopProjectsButton).toHaveClass("bg-blue-100", "text-blue-700");
    });

    it("calls onSectionChange when navigation item is clicked", () => {
        render(
            <MockProviders>
                <Navigation currentSection="profile" onSectionChange={mockOnSectionChange} />
            </MockProviders>
        );

        const projectsButtons = screen.getAllByText("Projects");
        if (projectsButtons[0]) {
            fireEvent.click(projectsButtons[0]); // Click the first (desktop) version
        }
        expect(mockOnSectionChange).toHaveBeenCalledWith("projects");
    });

    it("shows mobile menu toggle button", () => {
        render(
            <MockProviders>
                <Navigation currentSection="profile" onSectionChange={mockOnSectionChange} />
            </MockProviders>
        );

        const menuButton = screen.getByRole("button", { name: /open main menu/i });
        expect(menuButton).toBeInTheDocument();
    });

    it("toggles mobile menu when button is clicked", () => {
        render(
            <MockProviders>
                <Navigation currentSection="profile" onSectionChange={mockOnSectionChange} />
            </MockProviders>
        );

        const menuButton = screen.getByRole("button", { name: /open main menu/i });
        
        // Mobile menu should be hidden initially - look for the mobile menu container
        const mobileMenuContainer = document.querySelector(".md\\:hidden.hidden");
        expect(mobileMenuContainer).toBeInTheDocument();
        
        // Click to open mobile menu
        fireEvent.click(menuButton);
        
        // Mobile menu should now be visible - the hidden class should be removed
        const visibleMobileMenu = document.querySelector(".md\\:hidden:not(.hidden)");
        expect(visibleMobileMenu).toBeInTheDocument();
        
        // Should have both desktop and mobile versions of navigation items
        const aboutItems = screen.getAllByText("About");
        expect(aboutItems.length).toBe(2); // Desktop + mobile versions
    });
});
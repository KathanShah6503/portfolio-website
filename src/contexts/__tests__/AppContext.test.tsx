/**
 * Tests for AppContext
 */

import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AppProvider, useApp } from "../AppContext";

// Mock fetch for content loading
const mockFetch = vi.fn();
(globalThis as unknown as { fetch: typeof vi.fn }).fetch = mockFetch;

// Test component that uses the context
const TestComponent: React.FC = () => {
    const { portfolioData, isLoading, isEditMode, error, toggleEditMode } = useApp();
    
    return (
        <div>
            <div data-testid="loading">{isLoading ? "loading" : "loaded"}</div>
            <div data-testid="edit-mode">{isEditMode ? "edit" : "view"}</div>
            <div data-testid="error">{error || "no-error"}</div>
            <div data-testid="data">{portfolioData ? "has-data" : "no-data"}</div>
            <button onClick={toggleEditMode}>Toggle Edit</button>
        </div>
    );
};

describe("AppContext", () => {
    beforeEach(() => {
        localStorage.clear();
        mockFetch.mockClear();
        mockFetch.mockResolvedValue({
            ok: false,
            status: 404
        });
    });

    it("provides initial state", async () => {
        render(
            <AppProvider>
                <TestComponent />
            </AppProvider>
        );

        // Should start in loading state
        expect(screen.getByTestId("loading")).toHaveTextContent("loading");
        expect(screen.getByTestId("edit-mode")).toHaveTextContent("view");
        expect(screen.getByTestId("error")).toHaveTextContent("no-error");

        // Wait for loading to complete
        await screen.findByText("loaded");
        
        // Should have loaded default data
        expect(screen.getByTestId("data")).toHaveTextContent("has-data");
    });

    it("toggles edit mode", async () => {
        render(
            <AppProvider>
                <TestComponent />
            </AppProvider>
        );

        // Wait for loading to complete
        await screen.findByText("loaded");

        // Should start in view mode
        expect(screen.getByTestId("edit-mode")).toHaveTextContent("view");

        // Toggle edit mode
        act(() => {
            screen.getByText("Toggle Edit").click();
        });

        expect(screen.getByTestId("edit-mode")).toHaveTextContent("edit");

        // Toggle back
        act(() => {
            screen.getByText("Toggle Edit").click();
        });

        expect(screen.getByTestId("edit-mode")).toHaveTextContent("view");
    });

    it("handles content loading errors gracefully", async () => {
        // Mock fetch to reject
        mockFetch.mockRejectedValue(new Error("Network error"));

        render(
            <AppProvider>
                <TestComponent />
            </AppProvider>
        );

        // Wait for loading to complete
        await screen.findByText("loaded");

        // Should still have data (default fallback) but no error shown to user
        expect(screen.getByTestId("data")).toHaveTextContent("has-data");
        expect(screen.getByTestId("error")).toHaveTextContent("no-error");
    });
});
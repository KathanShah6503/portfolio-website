import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import App from "./App";

// Mock the fetch API for content loading
(globalThis as unknown as { fetch: typeof vi.fn }).fetch = vi.fn();

describe("App", () => {
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();

        // Mock fetch to return empty responses for JSON files
        (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
            ok: false,
            status: 404
        });
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    it("renders loading spinner initially", () => {
        render(<App />);
        expect(screen.getByText(/Loading portfolio.../i)).toBeInTheDocument();
    });

    it("renders without crashing", async () => {
        render(<App />);

        // Should show loading initially
        expect(screen.getByText(/Loading portfolio.../i)).toBeInTheDocument();

        // Wait for content to load (will use default data since fetch is mocked to fail)
        await screen.findByText(/Profile Section/i, {}, { timeout: 3000 });

        // Should show the profile section by default
        expect(screen.getByText(/Profile Section/i)).toBeInTheDocument();
    });
});
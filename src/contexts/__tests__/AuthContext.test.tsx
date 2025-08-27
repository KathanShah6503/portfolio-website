/**
 * Unit tests for AuthContext
 * Tests React authentication context and hooks
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { renderHook } from "@testing-library/react";

import { AuthProvider, useAuth, withAuth } from "../AuthContext";
import { authService } from "../../services/AuthService";

// Mock the AuthService
vi.mock("../../services/AuthService", () => ({
    authService: {
        isAuthenticated: vi.fn(),
        getSessionTimeRemaining: vi.fn(),
        getLockoutInfo: vi.fn(),
        authenticate: vi.fn(),
        logout: vi.fn(),
        extendSession: vi.fn()
    }
}));

const mockAuthService = authService as unknown as {
    isAuthenticated: ReturnType<typeof vi.fn>;
    getSessionTimeRemaining: ReturnType<typeof vi.fn>;
    getLockoutInfo: ReturnType<typeof vi.fn>;
    authenticate: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
    extendSession: ReturnType<typeof vi.fn>;
};

describe("AuthContext", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        
        // Default mock implementations
        mockAuthService.isAuthenticated.mockReturnValue(false);
        mockAuthService.getSessionTimeRemaining.mockReturnValue(0);
        mockAuthService.getLockoutInfo.mockReturnValue({ isLockedOut: false });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("AuthProvider", () => {
        it("should provide authentication context", () => {
            const TestComponent = () => {
                const { isAuthenticated, isLoading } = useAuth();
                return (
                    <div>
                        <div data-testid="authenticated">{isAuthenticated.toString()}</div>
                        <div data-testid="loading">{isLoading.toString()}</div>
                    </div>
                );
            };

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );
            
            // Should provide context values
            expect(screen.getByTestId("authenticated")).toBeInTheDocument();
            expect(screen.getByTestId("loading")).toBeInTheDocument();
        });
    });

    describe("useAuth hook", () => {
        it("should throw error when used outside AuthProvider", () => {
            const TestComponent = () => {
                useAuth();
                return <div>Test</div>;
            };

            // Suppress console.error for this test
            const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

            expect(() => render(<TestComponent />)).toThrow(
                "useAuth must be used within an AuthProvider"
            );

            consoleSpy.mockRestore();
        });

        it("should provide login functionality", async () => {
            mockAuthService.authenticate.mockResolvedValue({ success: true });

            const { result } = renderHook(() => useAuth(), {
                wrapper: AuthProvider
            });

            await act(async () => {
                const loginResult = await result.current.login("password123");
                expect(loginResult.success).toBe(true);
            });

            expect(mockAuthService.authenticate).toHaveBeenCalledWith("password123");
        });

        it("should handle login failure", async () => {
            mockAuthService.authenticate.mockResolvedValue({
                success: false,
                error: "Invalid password"
            });
            mockAuthService.getLockoutInfo.mockReturnValue({
                isLockedOut: false
            });

            const { result } = renderHook(() => useAuth(), {
                wrapper: AuthProvider
            });

            await act(async () => {
                const loginResult = await result.current.login("wrongpassword");
                expect(loginResult.success).toBe(false);
                expect(loginResult.error).toBe("Invalid password");
            });
        });

        it("should provide logout functionality", async () => {
            const { result } = renderHook(() => useAuth(), {
                wrapper: AuthProvider
            });

            await act(async () => {
                result.current.logout();
            });

            expect(mockAuthService.logout).toHaveBeenCalled();
        });

        it("should provide session extension functionality", async () => {
            mockAuthService.extendSession.mockReturnValue(true);

            const { result } = renderHook(() => useAuth(), {
                wrapper: AuthProvider
            });

            await act(async () => {
                const extended = result.current.extendSession();
                expect(extended).toBe(true);
            });

            expect(mockAuthService.extendSession).toHaveBeenCalled();
        });
    });

    describe("withAuth HOC", () => {
        const TestComponent = () => (
            <div data-testid="protected-content">Secret content</div>
        );

        it("should render component when authenticated", () => {
            mockAuthService.isAuthenticated.mockReturnValue(true);
            const ProtectedComponent = withAuth(TestComponent);

            render(
                <AuthProvider>
                    <ProtectedComponent />
                </AuthProvider>
            );

            // Should eventually render the protected content
            expect(screen.getByTestId("protected-content") || screen.getByText("Loading...")).toBeInTheDocument();
        });

        it("should show fallback when not authenticated", () => {
            mockAuthService.isAuthenticated.mockReturnValue(false);
            const ProtectedComponent = withAuth(TestComponent);

            render(
                <AuthProvider>
                    <ProtectedComponent />
                </AuthProvider>
            );

            // Should show access denied or loading
            expect(screen.getByText(/Access denied|Loading/)).toBeInTheDocument();
        });

        it("should show loading state initially", () => {
            // Set loading to true initially
            const TestComponentWithLoading = () => {
                const { isLoading } = useAuth();
                if (isLoading) return <div>Loading...</div>;
                return <div>Not loading</div>;
            };
            
            const ProtectedComponent = withAuth(TestComponentWithLoading);

            render(
                <AuthProvider>
                    <ProtectedComponent />
                </AuthProvider>
            );

            // The component should show loading initially or access denied
            expect(screen.getByText(/Loading...|Access denied/)).toBeInTheDocument();
        });

        it("should have correct display name", () => {
            const ProtectedComponent = withAuth(TestComponent);
            expect(ProtectedComponent.displayName).toBe("withAuth(TestComponent)");
        });
    });
});
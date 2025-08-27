/**
 * Unit tests for AuthService
 * Tests authentication flows, session management, and security features
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { AuthService } from "../AuthService";

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
};

Object.defineProperty(window, "localStorage", {
    value: localStorageMock
});

// Mock crypto.subtle for password hashing
const mockCrypto = {
    subtle: {
        digest: vi.fn()
    }
};

Object.defineProperty(window, "crypto", {
    value: mockCrypto
});

describe("AuthService", () => {
    let authService: AuthService;
    
    beforeEach(() => {
        // Reset all mocks
        vi.clearAllMocks();
        localStorageMock.getItem.mockReturnValue(null);
        
        // Mock crypto.subtle.digest to return different hashes for different passwords
        mockCrypto.subtle.digest.mockImplementation(async (_algorithm, data) => {
            const text = new TextDecoder().decode(data);
            const mockHashBuffer = new ArrayBuffer(32);
            const mockHashArray = new Uint8Array(mockHashBuffer);
            
            if (text === "admin123") {
                // Return the expected hash for admin123
                mockHashArray.fill(227);
            } else {
                // Return a different hash for other passwords
                mockHashArray.fill(123);
            }
            
            return mockHashBuffer;
        });
        
        // Get fresh instance
        authService = AuthService.getInstance();
        
        // Clear any existing timers
        vi.clearAllTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("Singleton Pattern", () => {
        it("should return the same instance", () => {
            const instance1 = AuthService.getInstance();
            const instance2 = AuthService.getInstance();
            expect(instance1).toBe(instance2);
        });
    });

    describe("Authentication", () => {
        it("should authenticate with correct password", async () => {
            const result = await authService.authenticate("admin123");
            
            expect(result.success).toBe(true);
            expect(result.error).toBeUndefined();
            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                "portfolio_auth_session",
                expect.stringContaining("\"isAuthenticated\":true")
            );
        });

        it("should reject incorrect password", async () => {
            const result = await authService.authenticate("wrongpassword");
            
            expect(result.success).toBe(false);
            expect(result.error).toContain("Invalid password");
            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                "portfolio_auth_attempts",
                "1"
            );
        });

        it("should track failed login attempts", async () => {
            // First failed attempt
            await authService.authenticate("wrong1");
            expect(localStorageMock.setItem).toHaveBeenCalledWith("portfolio_auth_attempts", "1");
            
            // Second failed attempt
            localStorageMock.getItem.mockImplementation((key) => {
                if (key === "portfolio_auth_attempts") return "1";
                return null;
            });
            
            await authService.authenticate("wrong2");
            expect(localStorageMock.setItem).toHaveBeenCalledWith("portfolio_auth_attempts", "2");
        });

        it("should lock account after max failed attempts", async () => {
            // Mock 4 existing failed attempts
            let attemptCount = 4;
            localStorageMock.getItem.mockImplementation((key) => {
                if (key === "portfolio_auth_attempts") return attemptCount.toString();
                return null;
            });
            
            // Mock setItem to update our attempt count
            localStorageMock.setItem.mockImplementation((key, value) => {
                if (key === "portfolio_auth_attempts") {
                    attemptCount = parseInt(value, 10);
                }
            });
            
            const result = await authService.authenticate("wrongpassword");
            
            expect(result.success).toBe(false);
            expect(result.error).toContain("Too many failed attempts");
            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                "portfolio_auth_lockout",
                expect.any(String)
            );
        });

        it("should prevent login when locked out", async () => {
            const futureTime = Date.now() + 10 * 60 * 1000; // 10 minutes from now
            localStorageMock.getItem.mockImplementation((key) => {
                if (key === "portfolio_auth_lockout") return futureTime.toString();
                return null;
            });
            
            const result = await authService.authenticate("admin123");
            
            expect(result.success).toBe(false);
            expect(result.error).toContain("Try again in");
        });

        it("should clear failed attempts on successful login", async () => {
            localStorageMock.getItem.mockImplementation((key) => {
                if (key === "portfolio_auth_attempts") return "2";
                return null;
            });
            
            await authService.authenticate("admin123");
            
            expect(localStorageMock.removeItem).toHaveBeenCalledWith("portfolio_auth_attempts");
            expect(localStorageMock.removeItem).toHaveBeenCalledWith("portfolio_auth_lockout");
        });
    });

    describe("Session Management", () => {
        it("should return false for isAuthenticated when no session exists", () => {
            expect(authService.isAuthenticated()).toBe(false);
        });

        it("should return true for isAuthenticated when valid session exists", () => {
            const futureTime = Date.now() + 30 * 60 * 1000; // 30 minutes from now
            const session = {
                isAuthenticated: true,
                loginTime: Date.now(),
                expiresAt: futureTime
            };
            
            localStorageMock.getItem.mockReturnValue(JSON.stringify(session));
            
            expect(authService.isAuthenticated()).toBe(true);
        });

        it("should return false for expired session", () => {
            const pastTime = Date.now() - 1000; // 1 second ago
            const session = {
                isAuthenticated: true,
                loginTime: Date.now() - 31 * 60 * 1000,
                expiresAt: pastTime
            };
            
            localStorageMock.getItem.mockReturnValue(JSON.stringify(session));
            
            expect(authService.isAuthenticated()).toBe(false);
            expect(localStorageMock.removeItem).toHaveBeenCalledWith("portfolio_auth_session");
        });

        it("should calculate correct session time remaining", () => {
            const futureTime = Date.now() + 15 * 60 * 1000; // 15 minutes from now
            const session = {
                isAuthenticated: true,
                loginTime: Date.now(),
                expiresAt: futureTime
            };
            
            localStorageMock.getItem.mockReturnValue(JSON.stringify(session));
            
            const remaining = authService.getSessionTimeRemaining();
            expect(remaining).toBeGreaterThan(14 * 60 * 1000); // Should be close to 15 minutes
            expect(remaining).toBeLessThanOrEqual(15 * 60 * 1000);
        });

        it("should extend session successfully", () => {
            const currentTime = Date.now();
            const session = {
                isAuthenticated: true,
                loginTime: currentTime,
                expiresAt: currentTime + 15 * 60 * 1000
            };
            
            localStorageMock.getItem.mockReturnValue(JSON.stringify(session));
            
            const result = authService.extendSession();
            
            expect(result).toBe(true);
            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                "portfolio_auth_session",
                expect.stringContaining("\"isAuthenticated\":true")
            );
        });

        it("should not extend session when not authenticated", () => {
            const result = authService.extendSession();
            expect(result).toBe(false);
        });

        it("should logout and clear session", () => {
            authService.logout();
            expect(localStorageMock.removeItem).toHaveBeenCalledWith("portfolio_auth_session");
        });
    });

    describe("Configuration Management", () => {
        it("should return default configuration", () => {
            const config = authService.getConfig();
            
            expect(config).toEqual({
                sessionTimeout: 30 * 60 * 1000,
                maxLoginAttempts: 5,
                lockoutDuration: 15 * 60 * 1000
            });
        });

        it("should update configuration", () => {
            const newConfig = {
                sessionTimeout: 60 * 60 * 1000, // 1 hour
                maxLoginAttempts: 3
            };
            
            authService.updateConfig(newConfig);
            const config = authService.getConfig();
            
            expect(config.sessionTimeout).toBe(60 * 60 * 1000);
            expect(config.maxLoginAttempts).toBe(3);
            expect(config.lockoutDuration).toBe(15 * 60 * 1000); // Should remain unchanged
        });
    });

    describe("Lockout Information", () => {
        it("should return not locked out when no lockout exists", () => {
            const lockoutInfo = authService.getLockoutInfo();
            
            expect(lockoutInfo.isLockedOut).toBe(false);
            expect(lockoutInfo.remainingMinutes).toBeUndefined();
        });

        it("should return lockout info when locked out", () => {
            const futureTime = Date.now() + 10 * 60 * 1000; // 10 minutes from now
            localStorageMock.getItem.mockImplementation((key) => {
                if (key === "portfolio_auth_lockout") return futureTime.toString();
                return null;
            });
            
            const lockoutInfo = authService.getLockoutInfo();
            
            expect(lockoutInfo.isLockedOut).toBe(true);
            expect(lockoutInfo.remainingMinutes).toBeGreaterThan(9);
            expect(lockoutInfo.remainingMinutes).toBeLessThanOrEqual(10);
        });

        it("should clear expired lockout", () => {
            const pastTime = Date.now() - 1000; // 1 second ago
            localStorageMock.getItem.mockImplementation((key) => {
                if (key === "portfolio_auth_lockout") return pastTime.toString();
                return null;
            });
            
            const lockoutInfo = authService.getLockoutInfo();
            
            expect(lockoutInfo.isLockedOut).toBe(false);
            expect(localStorageMock.removeItem).toHaveBeenCalledWith("portfolio_auth_lockout");
            expect(localStorageMock.removeItem).toHaveBeenCalledWith("portfolio_auth_attempts");
        });
    });

    describe("Error Handling", () => {
        it("should handle corrupted session data", () => {
            localStorageMock.getItem.mockReturnValue("invalid-json");
            
            expect(authService.isAuthenticated()).toBe(false);
            expect(localStorageMock.removeItem).toHaveBeenCalledWith("portfolio_auth_session");
        });

        it("should handle crypto API errors", async () => {
            mockCrypto.subtle.digest.mockRejectedValue(new Error("Crypto error"));
            
            const result = await authService.authenticate("admin123");
            
            expect(result.success).toBe(false);
            expect(result.error).toContain("technical error");
        });
    });
});
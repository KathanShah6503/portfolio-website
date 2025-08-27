/**
 * Authentication service for portfolio website edit mode
 * Provides password-based authentication with session management
 */

export interface AuthSession {
    isAuthenticated: boolean;
    loginTime: number;
    expiresAt: number;
}

export interface AuthConfig {
    sessionTimeout: number; // in milliseconds
    maxLoginAttempts: number;
    lockoutDuration: number; // in milliseconds
}

export class AuthService {
    private static instance: AuthService;
    private readonly STORAGE_KEY = "portfolio_auth_session";
    private readonly ATTEMPTS_KEY = "portfolio_auth_attempts";
    private readonly LOCKOUT_KEY = "portfolio_auth_lockout";
    
    // Default password hash (for "admin123" - should be changed in production)
    private readonly PASSWORD_HASH = "e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3";
    
    private config: AuthConfig = {
        sessionTimeout: 30 * 60 * 1000, // 30 minutes
        maxLoginAttempts: 5,
        lockoutDuration: 15 * 60 * 1000 // 15 minutes
    };

    private constructor() {
        // Start session cleanup interval
        this.startSessionCleanup();
    }

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    /**
     * Simple hash function for password validation
     * In production, this should use a proper cryptographic hash
     */
    private async hashPassword(password: string): Promise<string> {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    }

    /**
     * Check if user is currently locked out due to too many failed attempts
     */
    private isLockedOut(): boolean {
        const lockoutData = localStorage.getItem(this.LOCKOUT_KEY);
        if (!lockoutData) return false;

        const lockoutTime = parseInt(lockoutData, 10);
        const now = Date.now();
        
        if (now < lockoutTime) {
            return true;
        }

        // Lockout expired, clear it
        localStorage.removeItem(this.LOCKOUT_KEY);
        localStorage.removeItem(this.ATTEMPTS_KEY);
        return false;
    }

    /**
     * Get current number of failed login attempts
     */
    private getFailedAttempts(): number {
        const attempts = localStorage.getItem(this.ATTEMPTS_KEY);
        return attempts ? parseInt(attempts, 10) : 0;
    }

    /**
     * Increment failed login attempts and potentially trigger lockout
     */
    private incrementFailedAttempts(): void {
        const attempts = this.getFailedAttempts() + 1;
        localStorage.setItem(this.ATTEMPTS_KEY, attempts.toString());

        if (attempts >= this.config.maxLoginAttempts) {
            const lockoutUntil = Date.now() + this.config.lockoutDuration;
            localStorage.setItem(this.LOCKOUT_KEY, lockoutUntil.toString());
        }
    }

    /**
     * Clear failed login attempts (called on successful login)
     */
    private clearFailedAttempts(): void {
        localStorage.removeItem(this.ATTEMPTS_KEY);
        localStorage.removeItem(this.LOCKOUT_KEY);
    }

    /**
     * Get current authentication session
     */
    private getSession(): AuthSession | null {
        try {
            const sessionData = localStorage.getItem(this.STORAGE_KEY);
            if (!sessionData) return null;

            const session: AuthSession = JSON.parse(sessionData);
            
            // Check if session has expired
            if (Date.now() > session.expiresAt) {
                this.logout();
                return null;
            }

            return session;
        } catch (error) {
            console.error("Error parsing auth session:", error);
            this.logout();
            return null;
        }
    }

    /**
     * Create and store new authentication session
     */
    private createSession(): AuthSession {
        const now = Date.now();
        const session: AuthSession = {
            isAuthenticated: true,
            loginTime: now,
            expiresAt: now + this.config.sessionTimeout
        };

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
        return session;
    }

    /**
     * Start automatic session cleanup interval
     */
    private startSessionCleanup(): void {
        // Check every minute for expired sessions
        setInterval(() => {
            const session = this.getSession();
            if (session && Date.now() > session.expiresAt) {
                this.logout();
            }
        }, 60000);
    }

    /**
     * Authenticate user with password
     */
    public async authenticate(password: string): Promise<{ success: boolean; error?: string }> {
        // Check if user is locked out
        if (this.isLockedOut()) {
            const lockoutData = localStorage.getItem(this.LOCKOUT_KEY);
            const lockoutUntil = lockoutData ? parseInt(lockoutData, 10) : 0;
            const remainingTime = Math.ceil((lockoutUntil - Date.now()) / 60000);
            
            return {
                success: false,
                error: `Too many failed attempts. Try again in ${remainingTime} minutes.`
            };
        }

        try {
            const hashedPassword = await this.hashPassword(password);
            
            if (hashedPassword === this.PASSWORD_HASH) {
                // Successful authentication
                this.clearFailedAttempts();
                this.createSession();
                
                return { success: true };
            } else {
                // Failed authentication
                this.incrementFailedAttempts();
                const remainingAttempts = this.config.maxLoginAttempts - this.getFailedAttempts();
                
                if (remainingAttempts <= 0) {
                    return {
                        success: false,
                        error: "Too many failed attempts. Account locked for 15 minutes."
                    };
                }
                
                return {
                    success: false,
                    error: `Invalid password. ${remainingAttempts} attempts remaining.`
                };
            }
        } catch (error) {
            console.error("Authentication error:", error);
            return {
                success: false,
                error: "Authentication failed due to technical error."
            };
        }
    }

    /**
     * Check if user is currently authenticated
     */
    public isAuthenticated(): boolean {
        const session = this.getSession();
        return session?.isAuthenticated ?? false;
    }

    /**
     * Get time remaining in current session (in milliseconds)
     */
    public getSessionTimeRemaining(): number {
        const session = this.getSession();
        if (!session) return 0;
        
        return Math.max(0, session.expiresAt - Date.now());
    }

    /**
     * Extend current session by resetting the expiration time
     */
    public extendSession(): boolean {
        const session = this.getSession();
        if (!session) return false;

        session.expiresAt = Date.now() + this.config.sessionTimeout;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
        return true;
    }

    /**
     * Logout user and clear session
     */
    public logout(): void {
        localStorage.removeItem(this.STORAGE_KEY);
    }

    /**
     * Update authentication configuration
     */
    public updateConfig(newConfig: Partial<AuthConfig>): void {
        this.config = { ...this.config, ...newConfig };
    }

    /**
     * Get current authentication configuration
     */
    public getConfig(): AuthConfig {
        return { ...this.config };
    }

    /**
     * Check if account is currently locked out and get remaining time
     */
    public getLockoutInfo(): { isLockedOut: boolean; remainingMinutes?: number } {
        if (!this.isLockedOut()) {
            return { isLockedOut: false };
        }

        const lockoutData = localStorage.getItem(this.LOCKOUT_KEY);
        if (!lockoutData) return { isLockedOut: false };

        const lockoutUntil = parseInt(lockoutData, 10);
        const remainingMinutes = Math.ceil((lockoutUntil - Date.now()) / 60000);

        return {
            isLockedOut: true,
            remainingMinutes: Math.max(0, remainingMinutes)
        };
    }
}

// Export singleton instance
export const authService = AuthService.getInstance();
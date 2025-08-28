/**
 * Demo component showing ProfileSection usage
 * This is for development and testing purposes
 */

import React from "react";
import { ProfileSection } from "./ProfileSection";
import { AppProvider } from "../../contexts/AppContext";
import { AuthProvider } from "../../contexts/AuthContext";

export const ProfileDemo: React.FC = () => {
    return (
        <AppProvider>
            <AuthProvider>
                <div className="min-h-screen bg-gray-50">
                    <ProfileSection />
                </div>
            </AuthProvider>
        </AppProvider>
    );
};
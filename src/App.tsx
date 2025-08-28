/**
 * Main App component - Application shell with routing and layout
 * Integrates all context providers and manages single-page navigation
 */

import React, { useState } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { AppProvider, useApp } from "./contexts/AppContext";
import { Layout } from "./components/layout/Layout";
import { LoadingSpinner } from "./components/common/LoadingSpinner";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { LoginModal } from "./components/auth/LoginModal";
import { useAuth } from "./contexts/AuthContext";

// Placeholder components for different sections
const ProfileSection: React.FC = () => (
    <div className="text-center py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">👤 Profile Section</h1>
        <p className="text-gray-600">Profile component will be implemented in the next task</p>
    </div>
);

const ProjectsSection: React.FC = () => (
    <div className="text-center py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">💼 Projects Section</h1>
        <p className="text-gray-600">Projects component will be implemented in a future task</p>
    </div>
);

const ResumeSection: React.FC = () => (
    <div className="text-center py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">📄 Resume Section</h1>
        <p className="text-gray-600">Resume component will be implemented in a future task</p>
    </div>
);

const CertificatesSection: React.FC = () => (
    <div className="text-center py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">🏆 Certificates Section</h1>
        <p className="text-gray-600">Certificates component will be implemented in a future task</p>
    </div>
);

const ContactSection: React.FC = () => (
    <div className="text-center py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">📧 Contact Section</h1>
        <p className="text-gray-600">Contact component will be implemented in a future task</p>
    </div>
);

// Main content component that uses app context
const AppContent: React.FC = () => {
    const [currentSection, setCurrentSection] = useState("profile");
    const [showLoginModal, setShowLoginModal] = useState(false);
    const { isLoading, toggleEditMode } = useApp();
    const { isAuthenticated } = useAuth();

    // Handle edit mode toggle - show login if not authenticated
    const handleEditModeToggle = () => {
        if (isAuthenticated) {
            toggleEditMode();
        } else {
            setShowLoginModal(true);
        }
    };

    // Handle successful login
    const handleLoginSuccess = () => {
        toggleEditMode(); // Enable edit mode after successful login
    };

    // Render current section content
    const renderCurrentSection = () => {
        switch (currentSection) {
            case "profile":
                return <ProfileSection />;
            case "projects":
                return <ProjectsSection />;
            case "resume":
                return <ResumeSection />;
            case "certificates":
                return <CertificatesSection />;
            case "contact":
                return <ContactSection />;
            default:
                return <ProfileSection />;
        }
    };

    // Show loading spinner while content is loading
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" message="Loading portfolio..." />
            </div>
        );
    }

    return (
        <>
            <Layout 
                currentSection={currentSection} 
                onSectionChange={setCurrentSection}
            >
                {renderCurrentSection()}
                
                {/* Floating Edit Button (only show if not authenticated) */}
                {!isAuthenticated && (
                    <button
                        onClick={handleEditModeToggle}
                        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-colors z-40"
                        title="Admin Login"
                    >
                        🔐
                    </button>
                )}
            </Layout>

            {/* Login Modal */}
            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onSuccess={handleLoginSuccess}
            />
        </>
    );
};

// Main App component with all providers
function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <AppProvider>
                    <AppContent />
                </AppProvider>
            </AuthProvider>
        </ErrorBoundary>
    );
}

export default App;

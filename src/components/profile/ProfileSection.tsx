/**
 * ProfileSection component for displaying and editing personal information
 * Supports responsive layout and inline editing capabilities
 */

import React, { useState, useRef } from "react";
import type { ProfileData } from "../../types/portfolio";
import { useApp } from "../../contexts/AppContext";
import { useAuth } from "../../contexts/AuthContext";
import { RichTextEditor } from "./RichTextEditor";

export interface ProfileSectionProps {
    className?: string;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({ className = "" }) => {
    const { portfolioData, isEditMode, saveContent } = useApp();
    const { isAuthenticated } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<ProfileData | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const profile = portfolioData?.profile;

    if (!profile) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-gray-500">Loading profile...</div>
            </div>
        );
    }

    const canEdit = isEditMode && isAuthenticated;

    const handleEditStart = () => {
        setEditData({ ...profile });
        setIsEditing(true);
    };

    const handleEditCancel = () => {
        setEditData(null);
        setIsEditing(false);
    };

    const handleEditSave = async () => {
        if (!editData || !portfolioData) return;

        try {
            const updatedData = {
                ...portfolioData,
                profile: editData
            };
            await saveContent(updatedData);
            setIsEditing(false);
            setEditData(null);
        } catch (error) {
            console.error("Failed to save profile:", error);
            // TODO: Show error notification
        }
    };

    const handleInputChange = (field: keyof ProfileData, value: string) => {
        if (!editData) return;
        setEditData({
            ...editData,
            [field]: value
        });
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !editData) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            alert("Please select an image file");
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert("Image size must be less than 5MB");
            return;
        }

        setIsUploading(true);

        try {
            // Convert to base64 for storage
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                handleInputChange("photo", result);
                setIsUploading(false);
            };
            reader.onerror = () => {
                alert("Failed to read image file");
                setIsUploading(false);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error("Image upload error:", error);
            alert("Failed to upload image");
            setIsUploading(false);
        }
    };

    const triggerImageUpload = () => {
        fileInputRef.current?.click();
    };

    const currentData = isEditing ? editData! : profile;

    return (
        <section className={`profile-section ${className}`}>
            <div className="container mx-auto px-4 py-8 lg:py-16">
                <div className="max-w-4xl mx-auto">
                    {/* Header with Edit Controls */}
                    {canEdit && (
                        <div className="flex justify-end mb-6">
                            {!isEditing ? (
                                <button
                                    onClick={handleEditStart}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Edit Profile
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleEditCancel}
                                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleEditSave}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Main Profile Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                        {/* Profile Image */}
                        <div className="lg:col-span-1">
                            <div className="relative">
                                <div className="aspect-square w-full max-w-sm mx-auto lg:max-w-none">
                                    <img
                                        src={currentData.photo || "/placeholder-avatar.jpg"}
                                        alt={currentData.name}
                                        className="w-full h-full object-cover rounded-2xl shadow-lg"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = "/placeholder-avatar.jpg";
                                        }}
                                    />
                                    {isEditing && (
                                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-2xl flex items-center justify-center">
                                            <button
                                                onClick={triggerImageUpload}
                                                disabled={isUploading}
                                                className="px-4 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                                            >
                                                {isUploading ? "Uploading..." : "Change Photo"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </div>
                        </div>

                        {/* Profile Information */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Name and Title */}
                            <div className="space-y-2">
                                {isEditing ? (
                                    <>
                                        <input
                                            type="text"
                                            value={currentData.name}
                                            onChange={(e) => handleInputChange("name", e.target.value)}
                                            className="text-3xl lg:text-4xl font-bold text-gray-900 w-full border-b-2 border-gray-300 focus:border-blue-500 outline-none bg-transparent"
                                            placeholder="Your Name"
                                        />
                                        <input
                                            type="text"
                                            value={currentData.title}
                                            onChange={(e) => handleInputChange("title", e.target.value)}
                                            className="text-xl lg:text-2xl text-gray-600 w-full border-b border-gray-300 focus:border-blue-500 outline-none bg-transparent"
                                            placeholder="Your Professional Title"
                                        />
                                    </>
                                ) : (
                                    <>
                                        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                                            {currentData.name}
                                        </h1>
                                        <h2 className="text-xl lg:text-2xl text-gray-600">
                                            {currentData.title}
                                        </h2>
                                    </>
                                )}
                            </div>

                            {/* Location and Email */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-gray-600">
                                {isEditing ? (
                                    <>
                                        <input
                                            type="text"
                                            value={currentData.location}
                                            onChange={(e) => handleInputChange("location", e.target.value)}
                                            className="border border-gray-300 rounded px-3 py-2 focus:border-blue-500 outline-none"
                                            placeholder="Location"
                                        />
                                        <input
                                            type="email"
                                            value={currentData.email}
                                            onChange={(e) => handleInputChange("email", e.target.value)}
                                            className="border border-gray-300 rounded px-3 py-2 focus:border-blue-500 outline-none"
                                            placeholder="Email"
                                        />
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                            </svg>
                                            <span>{currentData.location}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                            </svg>
                                            <a href={`mailto:${currentData.email}`} className="hover:text-blue-600 transition-colors">
                                                {currentData.email}
                                            </a>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Professional Summary */}
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold text-gray-900">Professional Summary</h3>
                                {isEditing ? (
                                    <RichTextEditor
                                        value={currentData.summary}
                                        onChange={(value) => handleInputChange("summary", value)}
                                        placeholder="Write a brief professional summary..."
                                        rows={4}
                                    />
                                ) : (
                                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                        {currentData.summary.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\*(.*?)\*/g, "<em>$1</em>")}
                                    </div>
                                )}
                            </div>

                            {/* Detailed Description */}
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold text-gray-900">About Me</h3>
                                {isEditing ? (
                                    <RichTextEditor
                                        value={currentData.description}
                                        onChange={(value) => handleInputChange("description", value)}
                                        placeholder="Write a detailed description about yourself..."
                                        rows={6}
                                    />
                                ) : (
                                    <div
                                        className="text-gray-700 leading-relaxed whitespace-pre-wrap"
                                        dangerouslySetInnerHTML={{
                                            __html: currentData.description
                                                .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                                                .replace(/\*(.*?)\*/g, "<em>$1</em>")
                                                .replace(/\n/g, "<br>")
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
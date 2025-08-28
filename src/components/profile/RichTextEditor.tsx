/**
 * Rich text editor component for profile descriptions
 * Provides formatting capabilities for professional summary and description
 */

import React, { useRef, useEffect } from "react";

export interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    rows?: number;
    className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
    value,
    onChange,
    placeholder = "Enter text...",
    rows = 4,
    className = ""
}) => {
    // Remove unused state variables
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea based on content
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(e.target.value);
    };

    const insertFormatting = (before: string, after: string = "") => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = value.substring(start, end);
        
        const newValue = 
            value.substring(0, start) + 
            before + selectedText + after + 
            value.substring(end);
        
        onChange(newValue);
        
        // Restore cursor position
        setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + before.length + selectedText.length + after.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    const formatBold = () => insertFormatting("**", "**");
    const formatItalic = () => insertFormatting("*", "*");
    const insertBulletPoint = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        
        const start = textarea.selectionStart;
        const beforeCursor = value.substring(0, start);
        const afterCursor = value.substring(start);
        
        // Check if we're at the start of a line
        const isStartOfLine = start === 0 || beforeCursor.endsWith("\n");
        const prefix = isStartOfLine ? "• " : "\n• ";
        
        const newValue = beforeCursor + prefix + afterCursor;
        onChange(newValue);
        
        setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + prefix.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    const insertLineBreak = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        
        const start = textarea.selectionStart;
        const newValue = value.substring(0, start) + "\n\n" + value.substring(start);
        onChange(newValue);
        
        setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + 2;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    return (
        <div className={`rich-text-editor ${className}`}>
            {/* Formatting Toolbar */}
            <div className="flex items-center gap-2 p-2 border border-gray-300 border-b-0 rounded-t-lg bg-gray-50">
                <button
                    type="button"
                    onClick={formatBold}
                    className="px-3 py-1 text-sm font-bold border border-gray-300 rounded hover:bg-gray-200 transition-colors"
                    title="Bold (Ctrl+B)"
                >
                    B
                </button>
                <button
                    type="button"
                    onClick={formatItalic}
                    className="px-3 py-1 text-sm italic border border-gray-300 rounded hover:bg-gray-200 transition-colors"
                    title="Italic (Ctrl+I)"
                >
                    I
                </button>
                <div className="w-px h-6 bg-gray-300" />
                <button
                    type="button"
                    onClick={insertBulletPoint}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-200 transition-colors"
                    title="Bullet Point"
                >
                    •
                </button>
                <button
                    type="button"
                    onClick={insertLineBreak}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-200 transition-colors"
                    title="Line Break"
                >
                    ↵
                </button>
            </div>

            {/* Text Area */}
            <textarea
                ref={textareaRef}
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                rows={rows}
                className="w-full border border-gray-300 border-t-0 rounded-b-lg px-4 py-3 focus:border-blue-500 outline-none resize-none overflow-hidden"
                onKeyDown={(e) => {
                    // Handle keyboard shortcuts
                    if (e.ctrlKey || e.metaKey) {
                        switch (e.key) {
                            case "b":
                                e.preventDefault();
                                formatBold();
                                break;
                            case "i":
                                e.preventDefault();
                                formatItalic();
                                break;
                        }
                    }
                }}
            />

            {/* Character Count */}
            <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                <div>
                    Tip: Use **bold** and *italic* for formatting
                </div>
                <div>
                    {value.length} characters
                </div>
            </div>
        </div>
    );
};
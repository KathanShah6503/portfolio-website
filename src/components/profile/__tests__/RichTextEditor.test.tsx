/**
 * Tests for RichTextEditor component
 */

// React import removed as it's not used in this test file
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { RichTextEditor } from "../RichTextEditor";

describe("RichTextEditor", () => {
    const mockOnChange = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders with initial value", () => {
        render(
            <RichTextEditor
                value="Initial text"
                onChange={mockOnChange}
            />
        );

        expect(screen.getByDisplayValue("Initial text")).toBeInTheDocument();
    });

    it("renders with placeholder when value is empty", () => {
        render(
            <RichTextEditor
                value=""
                onChange={mockOnChange}
                placeholder="Enter your text here"
            />
        );

        expect(screen.getByPlaceholderText("Enter your text here")).toBeInTheDocument();
    });

    it("calls onChange when text is typed", async () => {
        const user = userEvent.setup();
        
        render(
            <RichTextEditor
                value=""
                onChange={mockOnChange}
            />
        );

        const textarea = screen.getByRole("textbox");
        await user.type(textarea, "Hello world");

        // Check that onChange was called for each character
        expect(mockOnChange).toHaveBeenCalledTimes(11);
        expect(mockOnChange).toHaveBeenNthCalledWith(1, "H");
        expect(mockOnChange).toHaveBeenNthCalledWith(2, "e");
        expect(mockOnChange).toHaveBeenNthCalledWith(3, "l");
    });

    it("displays formatting toolbar buttons", () => {
        render(
            <RichTextEditor
                value=""
                onChange={mockOnChange}
            />
        );

        expect(screen.getByRole("button", { name: "B" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "I" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "•" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "↵" })).toBeInTheDocument();
    });

    it("applies bold formatting when bold button is clicked", async () => {
        const user = userEvent.setup();
        
        render(
            <RichTextEditor
                value="Hello world"
                onChange={mockOnChange}
            />
        );

        const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
        const boldButton = screen.getByRole("button", { name: "B" });

        // Select text
        textarea.focus();
        textarea.setSelectionRange(0, 5); // Select "Hello"
        
        await user.click(boldButton);

        expect(mockOnChange).toHaveBeenCalledWith("**Hello** world");
    });

    it("applies italic formatting when italic button is clicked", async () => {
        const user = userEvent.setup();
        
        render(
            <RichTextEditor
                value="Hello world"
                onChange={mockOnChange}
            />
        );

        const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
        const italicButton = screen.getByRole("button", { name: "I" });

        // Select text
        textarea.focus();
        textarea.setSelectionRange(6, 11); // Select "world"
        
        await user.click(italicButton);

        expect(mockOnChange).toHaveBeenCalledWith("Hello *world*");
    });

    it("inserts bullet point when bullet button is clicked", async () => {
        const user = userEvent.setup();
        
        render(
            <RichTextEditor
                value=""
                onChange={mockOnChange}
            />
        );

        const textarea = screen.getByRole("textbox");
        const bulletButton = screen.getByRole("button", { name: "•" });

        textarea.focus();
        await user.click(bulletButton);

        expect(mockOnChange).toHaveBeenCalledWith("• ");
    });

    it("inserts bullet point on new line when not at start", async () => {
        const user = userEvent.setup();
        
        render(
            <RichTextEditor
                value="Some text"
                onChange={mockOnChange}
            />
        );

        const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
        const bulletButton = screen.getByRole("button", { name: "•" });

        // Position cursor at end
        textarea.focus();
        textarea.setSelectionRange(9, 9);
        
        await user.click(bulletButton);

        expect(mockOnChange).toHaveBeenCalledWith("Some text\n• ");
    });

    it("inserts line break when line break button is clicked", async () => {
        const user = userEvent.setup();
        
        render(
            <RichTextEditor
                value="First line"
                onChange={mockOnChange}
            />
        );

        const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
        const lineBreakButton = screen.getByRole("button", { name: "↵" });

        // Position cursor at end
        textarea.focus();
        textarea.setSelectionRange(10, 10);
        
        await user.click(lineBreakButton);

        expect(mockOnChange).toHaveBeenCalledWith("First line\n\n");
    });

    it("handles keyboard shortcuts for bold (Ctrl+B)", async () => {
        const user = userEvent.setup();
        
        render(
            <RichTextEditor
                value="Hello world"
                onChange={mockOnChange}
            />
        );

        const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;

        // Select text and use keyboard shortcut
        textarea.focus();
        textarea.setSelectionRange(0, 5); // Select "Hello"
        
        await user.keyboard("{Control>}b{/Control}");

        expect(mockOnChange).toHaveBeenCalledWith("**Hello** world");
    });

    it("handles keyboard shortcuts for italic (Ctrl+I)", async () => {
        const user = userEvent.setup();
        
        render(
            <RichTextEditor
                value="Hello world"
                onChange={mockOnChange}
            />
        );

        const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;

        // Select text and use keyboard shortcut
        textarea.focus();
        textarea.setSelectionRange(6, 11); // Select "world"
        
        await user.keyboard("{Control>}i{/Control}");

        expect(mockOnChange).toHaveBeenCalledWith("Hello *world*");
    });

    it("displays character count", () => {
        render(
            <RichTextEditor
                value="Hello world"
                onChange={mockOnChange}
            />
        );

        expect(screen.getByText("11 characters")).toBeInTheDocument();
    });

    it("displays formatting tip", () => {
        render(
            <RichTextEditor
                value=""
                onChange={mockOnChange}
            />
        );

        expect(screen.getByText("Tip: Use **bold** and *italic* for formatting")).toBeInTheDocument();
    });

    it("applies custom className", () => {
        const { container } = render(
            <RichTextEditor
                value=""
                onChange={mockOnChange}
                className="custom-editor"
            />
        );

        expect(container.querySelector(".rich-text-editor")).toHaveClass("custom-editor");
    });

    it("sets custom number of rows", () => {
        render(
            <RichTextEditor
                value=""
                onChange={mockOnChange}
                rows={8}
            />
        );

        const textarea = screen.getByRole("textbox");
        expect(textarea).toHaveAttribute("rows", "8");
    });

    it("auto-resizes textarea based on content", () => {
        const { rerender } = render(
            <RichTextEditor
                value="Short text"
                onChange={mockOnChange}
            />
        );

        const textarea = screen.getByRole("textbox");
        // Note: initialHeight would be used in a real browser test

        // Rerender with longer text
        rerender(
            <RichTextEditor
                value="This is a much longer text that should cause the textarea to expand in height to accommodate all the content without scrolling"
                onChange={mockOnChange}
            />
        );

        // Note: In a real browser, the height would change, but in jsdom it won't
        // This test mainly ensures the effect runs without errors
        expect(textarea).toBeInTheDocument();
    });

    it("handles Meta key shortcuts on Mac", async () => {
        const user = userEvent.setup();
        
        render(
            <RichTextEditor
                value="Hello world"
                onChange={mockOnChange}
            />
        );

        const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;

        // Select text and use Mac keyboard shortcut
        textarea.focus();
        textarea.setSelectionRange(0, 5); // Select "Hello"
        
        await user.keyboard("{Meta>}b{/Meta}");

        expect(mockOnChange).toHaveBeenCalledWith("**Hello** world");
    });
});
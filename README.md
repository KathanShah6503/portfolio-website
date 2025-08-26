# Portfolio Website

A modern, responsive personal portfolio website built with React, TypeScript, and Tailwind CSS.

## Features

- **React 19** with TypeScript (ES2024) for type-safe development
- **Tailwind CSS** for responsive styling and design system
- **Vite** for fast development and optimized builds
- **Vitest** for unit testing with React Testing Library
- **ESLint 9** (flat config) with **@stylistic** for code linting, quality, and formatting
- **ES2024** target for modern JavaScript features

## Project Structure

```
src/
├── components/     # React components
├── services/       # Business logic and API services
├── types/          # TypeScript type definitions
├── hooks/          # Custom React hooks
├── utils/          # Utility functions
└── test/           # Test setup and utilities

public/
└── data/           # JSON configuration files for content
```

## Development

### Prerequisites

- Node.js (v20.16.0 or higher)
- npm

### Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with ESLint --fix
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## Content Management

The portfolio content is managed through JSON files in the `public/data/` directory and can be edited through the frontend interface when in edit mode.

## Deployment

The application builds to static files and can be deployed to any static hosting service like Netlify, Vercel, or GitHub Pages.

```bash
npm run build
```

The built files will be in the `dist/` directory.
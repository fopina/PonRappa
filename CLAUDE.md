# PonRappa - Codebase Overview

## What is PonRappa?

PonRappa is a web-based interactive music player application that allows users to play musical note sequences through their browser. Users can specify notes via URL hash parameters (e.g., `#m=C4,D4,E4`), and pressing a button on the page plays those notes sequentially in a loop at 500ms intervals.

**Key Feature**: Shareable note sequences via URL - making it easy to share musical patterns.

## Tech Stack

- **Framework**: Preact 10.25.3 (lightweight React alternative - 3KB vs 40KB)
- **Routing**: preact-iso 2.9.1
- **Build Tool**: Vite 6.3.6
- **Language**: TypeScript 5.8.2
- **Styling**: Plain CSS
- **Sound Engine**: Mock Tone.js (structure ready for real Tone.js integration)
- **Node Version**: v20

## Project Structure

```
PonRappa/
├── src/
│   ├── index.tsx           # Entry point - renders App with LocationProvider
│   ├── App.tsx             # Main application component with note playback logic
│   ├── style.css           # Global styles with light/dark mode support
│   └── assets/
│       └── preact.svg      # Preact logo
├── public/
│   └── vite.svg            # Vite logo
├── index.html              # HTML entry point
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies and scripts
```

## Key Files

### `src/App.tsx`
The heart of the application:
- Mocked Tone.js Synth implementation (currently uses console.log + setTimeout)
- Extracts note sequences from URL hash (`#m=note1,note2,...)
- Manages button press state for interactive control
- Plays notes sequentially at 500ms intervals using setInterval
- Uses hooks (useRef, useState, useEffect) for state management
- Supports both mouse and touch input for mobile compatibility

### `src/index.tsx`
Application bootstrap:
- Imports Preact render function
- Wraps App in LocationProvider for URL routing support
- Imports global CSS styles

### `vite.config.ts`
Minimal Vite configuration using `@preact/preset-vite` plugin.

### `tsconfig.json`
TypeScript configuration:
- Targets ES2020
- Configured for Preact with `jsx="react-jsx"` and `jsxImportSource="preact"`
- Maps React/React-DOM imports to preact/compat for compatibility

## Design Patterns & Decisions

### 1. URL-Based State Management
- Notes are stored in the URL hash rather than only in component state
- Makes sequences shareable via URL - perfect for a music app
- Listens to hashchange events for dynamic updates

### 2. Mock Tone.js Implementation
- Includes mock Tone.js library structure instead of the real library
- Currently simulates audio with console.log statements
- Ready for integration with real Tone.js or Web Audio API

### 3. Minimal Framework Choice
- Uses Preact instead of React for smaller bundle size and better performance
- Preact/compat compatibility layer provides React-like API
- Ideal for a single-button interactive page that needs fast loading

### 4. Hook-Based State Management
- useState for tracking notes and button press state
- useRef for maintaining synth instance and note index across re-renders
- useEffect for managing the note-playing loop with proper cleanup

### 5. Button State-Driven Loop
- Note-playing loop managed through useEffect dependencies
- setInterval starts when button is pressed (isButtonPressed = true)
- Interval automatically stops when button is released via cleanup function
- Clean functional component patterns with proper lifecycle management

### 6. Touch and Mouse Support
- Single button supports both mouse and touch events
- Good UX design for mobile and desktop compatibility

## Project Evolution

Based on git history:
- Started as boilerplate based on Gemini (AI assistant) instructions
- Recently refactored to a "single button page" (commit 88438a5)
- Previous structure had Header component and multiple pages (Home, 404)
- Stripped down for simplicity and focus
- Regular dependency updates managed via Dependabot

## Architecture Philosophy

PonRappa prioritizes:
- **Performance**: Preact, minimal dependencies
- **Shareability**: URL-based state
- **Simplicity**: Single component, no complex routing
- **Interactivity**: Responsive button with proper cleanup

The codebase demonstrates good functional programming practices with hooks, proper cleanup, and minimal boilerplate - perfect for a specialized single-purpose web application.

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## URL Format

Access the app with notes in the URL hash:
```
http://localhost:5173/#m=C4,D4,E4,F4,G4
```

Press and hold the button to play the note sequence in a loop.

# PonRappa

*Japanese for "trumpet (rappa) tapping sound (pon)"*

A simple musical note sequencer for creating and playing melodies in your browser.

## Features

- 🎵 Play musical note sequences with Web Audio API
- 🎹 Interactive note carousel with visual feedback
- 🎲 Random song generator
- 📱 Mobile-optimized touch controls
- 🔗 Shareable URLs with note sequences
- 🎨 Clean, minimalist interface

## Getting Started

### Development

```bash
# Install dependencies
npm install

# Start development server (localhost only)
npm run dev

# Start development server with LAN access
npm run dev:lan

# Build for production
npm run build

# Preview production build
npm run preview
```

## How to Use

1. **Generate a Song**: Click "Generate Random Song" to create a random note sequence, or manually create a URL with notes
2. **Play Notes**: Press and hold the "Play Notes" button to play the highlighted note
3. **Navigate**: Release the button to advance to the next note
4. **Jump Around**: Click any note in the carousel to jump to it

## URL Format

Share your melodies by putting notes in the URL hash:

```
https://ponrappa.pages.dev/#m=C4,D4,E4,F4,G4,A4,B4,C5
```

Supported note format: `[Note][Octave]` (e.g., C4, D#5, Gb3)

## Tech Stack

- [Preact](https://preactjs.com/) - Lightweight React alternative (3KB)
- [Vite](https://vitejs.dev/) - Fast build tool and dev server
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- Web Audio API - Native browser audio synthesis

## License

See LICENSE file for details.

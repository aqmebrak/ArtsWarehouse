# ArtsWarehouse Project Overview

## Purpose
SvelteKit + TypeScript multimedia arts portfolio and recipe management application with interactive audio training tools.

## Tech Stack
- **Frontend**: SvelteKit, Svelte 5 (runes), TypeScript
- **Styling**: Tailwind CSS v4, Melt UI
- **Database**: PostgreSQL, Drizzle ORM
- **Audio**: Web Audio API
- **Graphics**: P5.js, Phaser 3
- **Forms**: Sveltekit-superforms with Zod validation
- **Testing**: Vitest (unit tests), Playwright (e2e)

## Key Features
- Arts portfolio
- Recipe management
- Audio training exercises (gamified ear training)
- Interactive visualizations

## Project Structure
```
src/
├── lib/
│   ├── components/     # Reusable Svelte components
│   ├── server/         # Server-side code (DB, etc.)
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   └── i18n/           # Internationalization
└── routes/             # SvelteKit file-based routing
    ├── audio-training/ # Audio training exercises
    ├── recipes/        # Recipe management
    └── ...
```

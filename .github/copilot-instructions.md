# Copilot Instructions for ArtsWarehouse

This is a **SvelteKit + TypeScript** multimedia arts portfolio and recipe management application with interactive audio training tools.

> **Note**: General AI assistant guidelines are defined in `.github/instructions/copilot-instructions.instructions.md`. This file focuses on project-specific technical patterns.

## Architecture Overview

- **Frontend**: SvelteKit with Svelte 5 runes (`$state`, `$props`, `$derived`)
- **Database**: PostgreSQL with Drizzle ORM for schema and migrations
- **Styling**: Tailwind CSS v4 with Melt UI components
- **Audio**: Web Audio API with custom EQ/panning training games
- **Graphics**: P5.js and Phaser 3 for interactive experiences
- **Deployment**: Vercel with analytics and speed insights

## Critical Development Workflows

### Database Operations
```bash
npm run db:start    # Start Docker PostgreSQL
npm run db:push     # Push schema changes
npm run db:seed     # Seed with sample data
npm run db:reset    # Full reset (push + seed)
npm run db:studio   # Open Drizzle Studio
```

### Environment Files
- Development: `.env.local`
- Production: `.env.prod` (accessed via `dotenv -e .env.prod`)
- Drizzle config auto-detects environment based on `VERCEL_ENV`

## Project-Specific Patterns

### 1. Svelte 5 State Management
Uses modern runes syntax throughout:
```typescript
// Class-based reactive state (see GameManager.svelte.ts)
private gameState = $state<GameState>();

// Component props (see most .svelte files)
let { children }: LayoutProps = $props();
```

### 2. Database Schema with Relations
All tables use Drizzle relations pattern:
```typescript
// Define table
export const recipes = pgTable('recipes', { ... });

// Define relations separately  
export const recipeRelations = relations(recipes, ({ many }) => ({
  instructions: many(instructions)
}));
```

### 3. SvelteKit Form Actions with Superforms
Server actions use `superValidate` + Zod for type-safe forms:
```typescript
const form = await superValidate(request, zod(validationSchema));
if (!form.valid) return fail(400, { form });
```

### 4. Audio Training Architecture
Audio games follow a specific pattern:
- `GameManager.svelte.ts`: Core game state management class
- `types.ts`: Shared interfaces (`GameState`, `RoundResult`)  
- Component structure: Controls → Canvas → Score Screen
- Uses Web Audio API with custom utility functions in `src/lib/utils/audio-training/`

### 5. Internationalization
Custom i18n system using derived stores:
```typescript
import { t } from '$lib/i18n';
// In templates: {$t('nav.paintings')}
```

### 6. CSS Utility Pattern
Uses `cn()` utility for conditional classes (clsx + tailwind-merge):
```typescript
import { cn } from '$lib/utils/cn';
class={cn('base-classes', condition && 'conditional-classes')}
```

## Key Integration Points

### Protected Routes
Routes like `/sbt` and `/tellurichymn` use password protection via API endpoints:  
`src/routes/[route]/api/verify-password/+server.ts`

### Modal System
Global modal state managed via `src/lib/store/modals.ts` with image gallery integration

### Database Transactions
Complex operations (like recipe creation) use Drizzle transactions:
```typescript
await db.transaction(async (tx) => {
  // Multiple related inserts
});
```

## File Organization Conventions

- `src/lib/components/[feature]/` - Feature-specific components
- `src/lib/utils/[feature]/` - Feature-specific utilities  
- `src/routes/[route]/+[type].ts` - SvelteKit file-based routing
- `src/lib/server/db/` - All database-related code
- Component state files use `.svelte.ts` extension

## Testing & Quality

- Unit tests: `npm run test:unit` (Vitest)
- Type checking: `npm run check` 
- Linting: `npm run lint` (ESLint + Prettier)
- Database verification: `npm run db:verify`

When working with this codebase, always use the appropriate npm scripts for database operations, follow the Svelte 5 runes patterns, and maintain the established component architecture for audio training features.
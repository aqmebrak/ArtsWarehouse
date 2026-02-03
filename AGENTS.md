# Agent Development Guidelines for ArtsWarehouse

This guide is for AI coding assistants working in this codebase. For general AI assistant guidelines, see `.github/instructions/copilot-instructions.instructions.md`. For project-specific patterns, see `.github/copilot-instructions.md`.

## Project Overview

SvelteKit + TypeScript multimedia arts portfolio and recipe management application with interactive audio training tools.

**Stack**: SvelteKit, Svelte 5 (runes), TypeScript, PostgreSQL, Drizzle ORM, Tailwind CSS v4, Melt UI, Web Audio API, P5.js, Phaser 3.

## Build, Lint & Test Commands

### Development

```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run preview          # Preview production build
```

### Code Quality

```bash
npm run check            # Type check with svelte-check
npm run check:watch      # Type check in watch mode
npm run lint             # Run ESLint + Prettier check
npm run format           # Auto-format with Prettier
```

### Testing

```bash
npm run test:unit        # Run Vitest unit tests
npm run test             # Run all tests (unit + e2e)
```

**Run a single test**:

```bash
npx vitest run path/to/file.test.ts           # Run specific test file
npx vitest run -t "test name pattern"          # Run tests matching pattern
```

**Note**: No test files currently exist. Tests should be colocated with source files using `.test.ts` or `.spec.ts` extensions (e.g., `utils.test.ts` next to `utils.ts`).

### Database Operations

```bash
npm run db:start         # Start Docker PostgreSQL container
npm run db:push          # Push schema changes (dev)
npm run db:push-prod     # Push schema changes (prod)
npm run db:migrate       # Run migrations (dev)
npm run db:migrate-prod  # Run migrations (prod)
npm run db:studio        # Open Drizzle Studio (dev)
npm run db:studio-prod   # Open Drizzle Studio (prod)
npm run db:seed          # Seed database with sample data
npm run db:verify        # Verify database integrity
npm run db:scrape        # Run recipe scraper
npm run db:reset         # Full reset: push + seed
```

## Code Style Guidelines

### Formatting

- **Indentation**: Tabs (width: 4)
- **Quotes**: Single quotes (`'`)
- **Line length**: 100 characters max
- **Trailing commas**: None
- **Semicolons**: Required (TypeScript/ESLint enforced)

### Import Organization

```typescript
// 1. External dependencies
import { relations } from 'drizzle-orm';
import { pgTable, serial, text } from 'drizzle-orm/pg-core';

// 2. SvelteKit imports ($app, $lib aliases)
import { page } from '$app/stores';
import { db } from '$lib/server/db';

// 3. Relative imports
import { GameManager } from './GameManager.svelte';
import type { GameState } from './types';
```

**Path alias**: Use `$lib/*` instead of relative imports for anything in `src/lib/`.

### TypeScript Guidelines

- **Strict mode**: Enabled in `tsconfig.json`
- **Type annotations**: Prefer explicit types for function parameters and return values
- **Interfaces vs Types**: Use `type` for unions/intersections, `interface` for object shapes
- **Type imports**: Use `import type { ... }` for type-only imports

```typescript
// Good: Explicit types
export function calculateScore(attempts: number, timeElapsed: number): number {
	return Math.round((100 - attempts * 5) * (1 - timeElapsed / 60000));
}

// Good: Type-only import
import type { GameState, RoundResult } from './types';
```

### Naming Conventions

- **Files**: `kebab-case.ts`, `PascalCase.svelte`, `PascalCase.svelte.ts`
- **Variables/Functions**: `camelCase`
- **Classes**: `PascalCase`
- **Constants**: `SCREAMING_SNAKE_CASE` for true constants, `camelCase` for config objects
- **Types/Interfaces**: `PascalCase`
- **Database tables**: `snake_case`

### Svelte 5 Patterns

**Always use modern runes syntax** (not legacy `$:` reactive statements):

```typescript
// Component props
let { children, class: className }: LayoutProps = $props();

// Reactive state
let count = $state(0);

// Derived state
let doubled = $derived(count * 2);

// Effects
$effect(() => {
	console.log('Count changed:', count);
});

// Class-based state management (see GameManager.svelte.ts)
class GameManager {
	private gameState = $state<GameState>({
		/* ... */
	});
	public isPlaying = $derived(this.gameState?.status === 'playing');
}
```

### Component Structure

```svelte
<script lang="ts">
	// 1. Imports
	import { onMount } from 'svelte';
	import { GameManager } from './GameManager.svelte';

	// 2. Props
	let { initialScore = 0 }: Props = $props();

	// 3. State
	let gameManager = new GameManager();
	let count = $state(0);

	// 4. Derived values
	let doubled = $derived(count * 2);

	// 5. Functions
	function handleClick() {
		/* ... */
	}

	// 6. Lifecycle
	onMount(() => {
		/* ... */
	});
</script>

<!-- 7. Template -->
<div>Content</div>

<!-- 8. Styles (if component-scoped) -->
<style>
	div {
		/* ... */
	}
</style>
```

### Database Patterns

**Schema definition** (Drizzle ORM):

```typescript
// 1. Define table
export const recipes = pgTable('recipes', {
	id: serial('id').primaryKey(),
	name: text('name').notNull().unique(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

// 2. Define relations separately
export const recipeRelations = relations(recipes, ({ many }) => ({
	instructions: many(instructions),
	ingredients: many(recipeIngredients)
}));
```

**Queries with transactions**:

```typescript
await db.transaction(async (tx) => {
	const [recipe] = await tx.insert(recipes).values({ name }).returning();
	await tx.insert(instructions).values(instructionData);
});
```

### Form Handling (SvelteKit + Superforms)

```typescript
// +page.server.ts
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';

const schema = z.object({
	name: z.string().min(1),
	email: z.string().email()
});

export const load = async () => {
	const form = await superValidate(zod(schema));
	return { form };
};

export const actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod(schema));
		if (!form.valid) return fail(400, { form });
		// Process form...
		return { form };
	}
};
```

### Styling with Tailwind

**Conditional classes** (always use `cn()` utility):

```typescript
import { cn } from '$lib/utils/cn';

<div class={cn(
	'base-classes',
	isActive && 'active-classes',
	className  // Allow prop override
)}>
```

**Multiple theme configs**: This project uses route-specific Tailwind configs:

- `tailwind.sbt.config.ts`
- `tailwind.recipes.config.ts`
- `tailwind.audio-training.config.ts`
- `tailwind.tellurichymn.config.ts`

### Error Handling

```typescript
// Async operations: Always use try-catch
try {
	const result = await db.query.recipes.findMany();
	return result;
} catch (error) {
	console.error('Failed to fetch recipes:', error);
	throw error; // Or return error response
}

// Form validation: Use Superforms + Zod
if (!form.valid) return fail(400, { form });
```

### Internationalization

```typescript
import { t } from '$lib/i18n';

// In templates
<h1>{$t('nav.paintings')}</h1>
```

## File Organization

```
src/
├── lib/
│   ├── components/[feature]/    # Feature-specific components
│   ├── utils/[feature]/         # Feature-specific utilities
│   ├── server/db/               # All database code
│   ├── store/                   # Global state management
│   ├── i18n/                    # Internationalization
│   └── types.ts                 # Global types
└── routes/
    └── [route]/+[type].ts       # SvelteKit file-based routing
```

- Component state files use `.svelte.ts` extension
- Colocate tests with source files (`.test.ts` or `.spec.ts`)

## Environment Configuration

- **Development**: `.env.local`
- **Production**: `.env.prod`
- Drizzle auto-detects environment based on `VERCEL_ENV`

## Important Notes

- **Svelte 5 Only**: Use runes syntax, not legacy reactive declarations
- **Database First**: Always run `npm run db:start` before database operations
- **Pre-commit Hook**: Husky runs linting before commits
- **ESLint Ignores**: `build/`, `.svelte-kit/`, `dist/`, `src/lib/songs/`
- **Protected Routes**: `/sbt/` and `/tellurichymn/` use password verification via API endpoints

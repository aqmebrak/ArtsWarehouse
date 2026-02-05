# Code Style & Conventions

## Formatting
- **Indentation**: Tabs (width: 4)
- **Quotes**: Single quotes (`'`)
- **Line length**: 100 characters max
- **Trailing commas**: None
- **Semicolons**: Required (TypeScript/ESLint enforced)

## Import Organization
```typescript
// 1. External dependencies
import { relations } from 'drizzle-orm';

// 2. SvelteKit imports ($app, $lib aliases)
import { page } from '$app/stores';
import { db } from '$lib/server/db';

// 3. Relative imports
import { GameManager } from './GameManager.svelte';
import type { GameState } from './types';
```

## TypeScript
- **Strict mode**: Enabled
- **Type annotations**: Explicit types for function parameters and return values
- **Interfaces vs Types**: Use `type` for unions/intersections, `interface` for object shapes
- **Type imports**: Use `import type { ... }` for type-only imports

## Svelte 5 Patterns
- Use modern runes syntax: `$state()`, `$derived()`, `$effect()`, `$props()`
- No legacy `$:` reactive statements

## Naming Conventions
- **Files**: `kebab-case.ts`, `PascalCase.svelte`, `PascalCase.svelte.ts`
- **Variables/Functions**: `camelCase`
- **Classes**: `PascalCase`
- **Constants**: `SCREAMING_SNAKE_CASE` or `camelCase` for config
- **Types/Interfaces**: `PascalCase`
- **Database tables**: `snake_case`

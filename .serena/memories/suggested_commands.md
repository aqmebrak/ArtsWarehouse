# Suggested Commands

## Development
```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run preview          # Preview production build
```

## Code Quality
```bash
npm run check            # Type check with svelte-check
npm run lint             # Run ESLint + Prettier check
npm run format           # Auto-format with Prettier
```

## Testing
```bash
npm run test:unit        # Run Vitest unit tests
npm run test             # Run all tests (unit + e2e)

# Run specific test
npx vitest run path/to/file.test.ts
npx vitest run -t "test name pattern"
```

## Database Operations
```bash
npm run db:start         # Start Docker PostgreSQL container
npm run db:push          # Push schema changes (dev)
npm run db:studio        # Open Drizzle Studio (dev)
npm run db:seed          # Seed database with sample data
npm run db:reset         # Full reset: push + seed
```

## Task Completion Workflow
1. Write code following style guidelines
2. Run `npm run format` to auto-format
3. Run `npm run check` to type-check
4. Run `npm run test:unit` if tests exist
5. Manually test in browser with `npm run dev`

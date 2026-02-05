# Task Completion Checklist

When completing a coding task:

1. **Code Implementation**
   - Follow code style guidelines (tabs, single quotes, etc.)
   - Use Svelte 5 runes syntax ($state, $derived, $props)
   - Use `$lib/*` path aliases instead of relative imports
   - Add JSDoc comments for exported functions

2. **Formatting & Linting**
   ```bash
   npm run format  # Auto-format code
   npm run lint    # Check for linting errors
   ```

3. **Type Checking**
   ```bash
   npm run check   # Run svelte-check
   ```

4. **Testing**
   ```bash
   npm run test:unit  # Run unit tests if they exist
   ```
   - Tests should be colocated: `utils.test.ts` next to `utils.ts`
   - Use Vitest for unit tests

5. **Manual Testing**
   - Run `npm run dev` and test in browser
   - Verify functionality works as expected

## Before Committing
- Ensure all checks pass
- Husky pre-commit hook will run linting automatically

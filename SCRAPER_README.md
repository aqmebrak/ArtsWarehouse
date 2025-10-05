# Recipe Scraper Guide

This scraper helps you migrate recipes from your old website into your new database format.

## Setup Instructions

### 1. Configure the Scraper

Edit `src/lib/server/db/scraper.ts` and update the `SCRAPER_CONFIG` object:

```typescript
const SCRAPER_CONFIG = {
  // Your old website's base URL
  baseUrl: 'https://your-old-website.com',
  
  // Add recipe URLs here
  recipeUrls: [
    'https://your-old-website.com/recipes/chocolate-cake',
    'https://your-old-website.com/recipes/pasta-salad',
    // ... add all your recipe URLs
  ],
  
  // Customize CSS selectors for your site structure
  selectors: {
    title: 'h1, .recipe-title',           // Recipe name
    prepTime: '.prep-time',               // Preparation time
    cookTime: '.cook-time',               // Cooking time  
    servings: '.servings',                // Number of servings
    notes: '.description',                // Recipe description/notes
    ingredientsList: '.ingredients ul',   // Ingredients container
    ingredientItem: 'li',                 // Individual ingredient
    instructionsList: '.instructions ol', // Instructions container
    instructionItem: 'li',                // Individual instruction step
  },
};
```

### 2. Find the Right CSS Selectors

To find the correct selectors for your old website:

1. **Open your old recipe page** in a browser
2. **Right-click** on recipe elements (title, ingredients, etc.)
3. **Select "Inspect Element"** 
4. **Copy the CSS selector** or note the class names
5. **Update the selectors** in the config

### 3. Test with One Recipe First

Start with just one recipe URL to test:

```typescript
recipeUrls: [
  'https://your-old-website.com/recipes/test-recipe',
],
```

## Running the Scraper

```bash
# Run the scraper
npm run db:scrape

# After scraping succeeds, seed the database
npm run db:seed

# Verify everything worked
npm run db:verify
```

## Common Selector Examples

Different websites use different structures. Here are common patterns:

### WordPress Recipe Plugins
```typescript
selectors: {
  title: '.recipe-card-title, .wp-block-recipe-card h2',
  ingredientsList: '.recipe-card-ingredients ul',
  instructionsList: '.recipe-card-instructions ol',
}
```

### Custom Recipe Sites
```typescript
selectors: {
  title: 'h1.recipe-title',
  ingredientsList: '.ingredients-list ul',
  instructionsList: '.method ol',
}
```

### JSON-LD Structured Data
Some sites use structured data that's easier to parse:
```typescript
// The scraper can be extended to look for JSON-LD data
// <script type="application/ld+json">{"@type": "Recipe", ...}</script>
```

## Ingredient Parsing

The scraper attempts to parse ingredients like:
- `"2 cups flour"` → `{quantity: "2", unit: "cups", name: "flour"}`
- `"1 large onion, diced"` → `{quantity: "1", unit: "(empty)", name: "large onion, diced"}`
- `"Salt and pepper to taste"` → `{quantity: "1", unit: "(empty)", name: "Salt and pepper to taste"}`

You may need to customize the `parseIngredient()` function for your specific format.

## Troubleshooting

### Common Issues

1. **No recipes scraped**: Check your CSS selectors
2. **Empty ingredients/instructions**: Verify the list selectors
3. **Rate limiting**: Increase `requestDelay` in config
4. **SSL errors**: Your old site might have certificate issues

### Debug Mode

Add console.log statements to see what's being found:

```typescript
// In scrapeRecipe method, add debugging:
console.log('Title element:', $(selectors.title).first().html());
console.log('Ingredients found:', $(selectors.ingredientsList).find(selectors.ingredientItem).length);
```

### Testing Selectors

You can test CSS selectors in your browser console:

```javascript
// Test in browser console on your old recipe page
document.querySelectorAll('.ingredients li').length  // Should show ingredient count
document.querySelector('h1').textContent             // Should show recipe title
```

## Advanced Features

### Sitemap Scraping
If your old site has a sitemap, you can auto-discover recipe URLs:

```typescript
sitemapUrl: 'https://your-old-website.com/sitemap.xml',
```

### Recipe List Page Scraping
If you have a recipes index page:

```typescript
recipeListUrl: 'https://your-old-website.com/recipes',
```

## After Scraping

1. **Review the generated data.json** - check for any parsing issues
2. **Run database seeding** - `npm run db:seed`
3. **Verify in DB Studio** - `npm run db:studio`
4. **Clean up any malformed data** manually if needed

## Tips

- **Start small**: Test with 1-2 recipes first
- **Be respectful**: Don't hammer the server (use requestDelay)
- **Check robots.txt**: Make sure scraping is allowed
- **Manual cleanup**: You might need to clean up some parsed data
- **Backup**: The scraper creates a backup of your existing data.json

## Example Workflow

```bash
# 1. Configure scraper with your URLs and selectors
# 2. Test with one recipe
npm run db:scrape

# 3. If successful, add more URLs and run again
npm run db:scrape

# 4. Seed the database with scraped recipes
npm run db:seed

# 5. Verify everything looks good
npm run db:verify
```

Your scraped recipes will be merged with existing seed data and loaded into the database!
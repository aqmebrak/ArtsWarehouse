import axios from 'axios';
import * as cheerio from 'cheerio';
import { writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration for your old website
const SCRAPER_CONFIG = {
  // Base URL of your old website
  baseUrl: 'https://your-old-website.com',
  
  // URL pattern for recipe pages (can be an array for multiple patterns)
  recipeUrls: [
    // Add your recipe URLs here, for example:
    // 'https://your-old-website.com/recipes/chocolate-cake',
    // 'https://your-old-website.com/recipes/lentil-salad',
  ],
  
  // Alternative: sitemap or recipe list page to discover URLs
  sitemapUrl: null, // 'https://your-old-website.com/sitemap.xml',
  recipeListUrl: null, // 'https://your-old-website.com/recipes',
  
  // CSS Selectors for recipe elements (customize these for your site)
  selectors: {
    title: 'h1, .recipe-title, [class*="title"]',
    prepTime: '[class*="prep"], [data-prep], .prep-time',
    cookTime: '[class*="cook"], [data-cook], .cook-time',
    servings: '[class*="serving"], [data-serving], .servings',
    notes: '.notes, .description, [class*="description"]',
    ingredientsList: '.ingredients ul, [class*="ingredient"] ul, .recipe-ingredients ul',
    ingredientItem: 'li',
    instructionsList: '.instructions ol, .instructions ul, [class*="instruction"] ol, [class*="instruction"] ul',
    instructionItem: 'li',
  },
  
  // Delay between requests (be respectful!)
  requestDelay: 1000, // 1 second
};

interface ScrapedRecipe {
  name: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  notes?: string;
  ingredients: Array<{
    name: string;
    quantity: string;
    unit: string;
    notes?: string;
  }>;
  instructions: string[];
  sourceUrl: string;
}

class RecipeScraper {
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private parseTimeString(timeStr: string): number | undefined {
    if (!timeStr) return undefined;
    
    // Extract numbers from time strings like "30 minutes", "1 hour 15 min", etc.
    const hourMatch = timeStr.match(/(\d+)\s*h(?:ours?)?/i);
    const minMatch = timeStr.match(/(\d+)\s*m(?:in(?:utes?)?)?/i);
    
    let totalMinutes = 0;
    if (hourMatch) totalMinutes += parseInt(hourMatch[1]) * 60;
    if (minMatch) totalMinutes += parseInt(minMatch[1]);
    
    return totalMinutes > 0 ? totalMinutes : undefined;
  }

  private parseServings(servingStr: string): number | undefined {
    if (!servingStr) return undefined;
    
    const match = servingStr.match(/(\d+)/);
    return match ? parseInt(match[1]) : undefined;
  }

  private parseIngredient(ingredientText: string): {
    name: string;
    quantity: string;
    unit: string;
    notes?: string;
  } {
    // This is a basic parser - you might need to customize this based on your format
    const text = ingredientText.trim();
    
    // Try to extract quantity and unit from the beginning
    const quantityMatch = text.match(/^(\d+(?:[.,]\d+)?)\s*([a-zA-Z]*)\s+(.*)/);
    
    if (quantityMatch) {
      const [, quantity, unit, name] = quantityMatch;
      return {
        quantity: quantity.replace(',', '.'),
        unit: unit || '(empty)',
        name: name.trim(),
      };
    }
    
    // If no quantity found, treat as whole ingredient
    return {
      quantity: '1',
      unit: '(empty)',
      name: text,
    };
  }

  async scrapeRecipe(url: string): Promise<ScrapedRecipe | null> {
    try {
      console.log(`🔄 Scraping: ${url}`);
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Recipe Scraper)',
        },
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);
      const { selectors } = SCRAPER_CONFIG;

      // Extract recipe data
      const name = $(selectors.title).first().text().trim();
      if (!name) {
        console.warn(`⚠️ No title found for ${url}`);
        return null;
      }

      const prepTime = this.parseTimeString($(selectors.prepTime).first().text());
      const cookTime = this.parseTimeString($(selectors.cookTime).first().text());
      const servings = this.parseServings($(selectors.servings).first().text());
      const notes = $(selectors.notes).first().text().trim() || undefined;

      // Extract ingredients
      const ingredients: ScrapedRecipe['ingredients'] = [];
      $(selectors.ingredientsList).find(selectors.ingredientItem).each((_, element) => {
        const ingredientText = $(element).text().trim();
        if (ingredientText) {
          ingredients.push(this.parseIngredient(ingredientText));
        }
      });

      // Extract instructions
      const instructions: string[] = [];
      $(selectors.instructionsList).find(selectors.instructionItem).each((_, element) => {
        const instruction = $(element).text().trim();
        if (instruction) {
          instructions.push(instruction);
        }
      });

      const recipe: ScrapedRecipe = {
        name,
        prepTime,
        cookTime,
        servings,
        notes,
        ingredients,
        instructions,
        sourceUrl: url,
      };

      console.log(`✅ Scraped: ${name} (${ingredients.length} ingredients, ${instructions.length} steps)`);
      return recipe;

    } catch (error) {
      console.error(`❌ Error scraping ${url}:`, error);
      return null;
    }
  }

  async discoverRecipeUrls(): Promise<string[]> {
    const urls: string[] = [];
    
    // Add manually configured URLs
    urls.push(...SCRAPER_CONFIG.recipeUrls);

    // TODO: Add sitemap scraping if configured
    if (SCRAPER_CONFIG.sitemapUrl) {
      console.log('📡 Scraping sitemap for recipe URLs...');
      // Implementation for sitemap scraping
    }

    // TODO: Add recipe list page scraping if configured
    if (SCRAPER_CONFIG.recipeListUrl) {
      console.log('📡 Scraping recipe list page for URLs...');
      // Implementation for recipe list scraping
    }

    return [...new Set(urls)]; // Remove duplicates
  }

  async scrapeAllRecipes(): Promise<ScrapedRecipe[]> {
    const urls = await this.discoverRecipeUrls();
    console.log(`🎯 Found ${urls.length} recipe URLs to scrape`);

    const recipes: ScrapedRecipe[] = [];
    
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      console.log(`📖 Processing ${i + 1}/${urls.length}: ${url}`);
      
      const recipe = await this.scrapeRecipe(url);
      if (recipe) {
        recipes.push(recipe);
      }

      // Be respectful - add delay between requests
      if (i < urls.length - 1) {
        await this.delay(SCRAPER_CONFIG.requestDelay);
      }
    }

    return recipes;
  }

  convertToSeedFormat(scrapedRecipes: ScrapedRecipe[]) {
    // Load existing seed data to preserve units and ingredients
    const seedDataPath = join(__dirname, '../../../routes/recipes/init/data.json');
    let existingData;
    
    try {
      existingData = JSON.parse(readFileSync(seedDataPath, 'utf-8'));
    } catch {
      existingData = { units: [], ingredients: [], recipes: [] };
    }

    // Collect all unique ingredients and units from scraped recipes
    const allIngredients = new Set(existingData.ingredients || []);
    const allUnits = new Set(existingData.units || []);

    for (const recipe of scrapedRecipes) {
      for (const ingredient of recipe.ingredients) {
        allIngredients.add(ingredient.name);
        if (ingredient.unit && ingredient.unit !== '(empty)') {
          allUnits.add(ingredient.unit);
        }
      }
    }

    // Convert scraped recipes to seed format
    const seedRecipes = scrapedRecipes.map(recipe => ({
      name: recipe.name,
      prepTime: recipe.prepTime || 0,
      cookTime: recipe.cookTime || 0,
      servings: recipe.servings || 4,
      notes: recipe.notes || `Scraped from ${recipe.sourceUrl}`,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
    }));

    return {
      units: Array.from(allUnits).sort(),
      ingredients: Array.from(allIngredients).sort(),
      recipes: [...(existingData.recipes || []), ...seedRecipes],
    };
  }

  async saveScrapedData(recipes: ScrapedRecipe[]) {
    const seedData = this.convertToSeedFormat(recipes);
    const outputPath = join(__dirname, '../../../routes/recipes/init/data.json');
    
    // Create backup of existing data
    try {
      const existing = readFileSync(outputPath, 'utf-8');
      writeFileSync(outputPath + '.backup', existing);
      console.log('💾 Created backup of existing data.json');
    } catch {
      // No existing file to backup
    }

    writeFileSync(outputPath, JSON.stringify(seedData, null, 2));
    console.log(`💾 Saved ${recipes.length} scraped recipes to data.json`);
    console.log(`📊 Total: ${seedData.units.length} units, ${seedData.ingredients.length} ingredients, ${seedData.recipes.length} recipes`);
  }
}

// CLI interface
async function main() {
  console.log('🍽️ Recipe Scraper Starting...\n');

  if (SCRAPER_CONFIG.recipeUrls.length === 0 && !SCRAPER_CONFIG.sitemapUrl && !SCRAPER_CONFIG.recipeListUrl) {
    console.error('❌ No recipe URLs configured! Please update SCRAPER_CONFIG in the script.');
    console.log('\n📝 To get started:');
    console.log('1. Add your old website URLs to SCRAPER_CONFIG.recipeUrls');
    console.log('2. Customize the CSS selectors for your site structure');
    console.log('3. Run the scraper again');
    process.exit(1);
  }

  const scraper = new RecipeScraper();
  
  try {
    const recipes = await scraper.scrapeAllRecipes();
    
    if (recipes.length === 0) {
      console.log('⚠️ No recipes were successfully scraped.');
      process.exit(1);
    }

    console.log(`\n🎉 Successfully scraped ${recipes.length} recipes!`);
    
    // Show preview of first recipe
    if (recipes[0]) {
      const first = recipes[0];
      console.log('\n📖 Preview of first recipe:');
      console.log(`   Name: ${first.name}`);
      console.log(`   Ingredients: ${first.ingredients.length}`);
      console.log(`   Instructions: ${first.instructions.length}`);
    }

    await scraper.saveScrapedData(recipes);
    console.log('\n✅ Scraping completed successfully!');
    console.log('🚀 You can now run "npm run db:seed" to load the recipes into your database.');

  } catch (error) {
    console.error('💥 Scraping failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
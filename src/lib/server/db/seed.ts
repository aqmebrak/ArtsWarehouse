import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { reset } from 'drizzle-seed';
import * as schema from './schema.js';
import { 
	ingredients, 
	units, 
	recipes, 
	recipeIngredients, 
	instructions 
} from './schema.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
	throw new Error('DATABASE_URL is not set in environment variables');
}

// Create database connection
const sql = postgres(process.env.DATABASE_URL);
const db = drizzle(sql);

// Get the directory of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load seed data
const seedDataPath = join(__dirname, '../../../routes/recipes/init/data.json');
const seedData: {
	units: string[];
	ingredients: string[];
	recipes: Array<{
		name: string;
		prepTime: number;
		cookTime: number;
		servings: number;
		notes: string;
		ingredients: Array<{
			name: string;
			quantity: string;
			unit: string;
			notes?: string;
		}>;
		instructions: string[];
	}>;
} = JSON.parse(readFileSync(seedDataPath, 'utf-8'));

export async function seedDatabase() {
	try {
		console.log('🔄 Resetting database...');
		// Reset all tables
		await reset(db, schema);

		console.log('📦 Loading seed data...');

		console.log('🥄 Seeding units...');
		// Insert units first
		const insertedUnits = await db
			.insert(units)
			.values(seedData.units.map((name) => ({ name })))
			.returning();

		console.log('🥬 Seeding ingredients...');
		// Insert ingredients
		const insertedIngredients = await db
			.insert(ingredients)
			.values(seedData.ingredients.map((name) => ({ name })))
			.returning();

		console.log('📖 Seeding recipes...');
		// Create lookup maps for faster access
		const unitMap = new Map(insertedUnits.map(unit => [unit.name, unit.id]));
		const ingredientMap = new Map(insertedIngredients.map(ingredient => [ingredient.name, ingredient.id]));

		// Insert recipes with all their relationships
		for (const recipeData of seedData.recipes) {
			console.log(`📝 Creating recipe: ${recipeData.name}`);
			
			// Insert the recipe
			const [insertedRecipe] = await db
				.insert(recipes)
				.values({
					name: recipeData.name,
					prepTime: recipeData.prepTime,
					cookTime: recipeData.cookTime,
					servings: recipeData.servings,
					notes: recipeData.notes
				})
				.returning();

			// Insert recipe ingredients
			const recipeIngredientsData = recipeData.ingredients
				.map(ingredient => {
					const ingredientId = ingredientMap.get(ingredient.name);
					const unitId = unitMap.get(ingredient.unit);
					
					if (!ingredientId) {
						console.warn(`⚠️ Ingredient not found: ${ingredient.name}`);
						return null;
					}
					
					return {
						recipeId: insertedRecipe.id,
						ingredientId,
						unitId: unitId || null,
						quantity: ingredient.quantity,
						notes: ingredient.notes || null
					};
				})
				.filter((item): item is NonNullable<typeof item> => item !== null);

			if (recipeIngredientsData.length > 0) {
				await db.insert(recipeIngredients).values(recipeIngredientsData);
			}

			// Insert instructions
			const instructionsData = recipeData.instructions.map((instruction, index) => ({
				recipeId: insertedRecipe.id,
				stepOrder: index + 1,
				description: instruction
			}));

			await db.insert(instructions).values(instructionsData);
		}

		console.log('✅ Database seeded successfully!');
		console.log(`📊 Seeded: ${insertedUnits.length} units, ${insertedIngredients.length} ingredients, ${seedData.recipes.length} recipes`);
		
	} catch (error) {
		console.error('❌ Error seeding database:', error);
		throw error;
	}
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
	try {
		await seedDatabase();
		console.log('🎉 Seeding completed successfully!');
	} catch (error) {
		console.error('💥 Seeding failed:', error);
		process.exit(1);
	} finally {
		await sql.end();
		process.exit(0);
	}
}
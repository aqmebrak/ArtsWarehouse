import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
	throw new Error('DATABASE_URL is not set in environment variables');
}

// Create database connection
const sql = postgres(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

export async function verifyDatabase() {
	try {
		console.log('🔍 Verifying database seeding...\n');

		// Get all recipes with their full details
		const allRecipes = await db.query.recipes.findMany({
			with: {
				instructions: {
					orderBy: (instructions, { asc }) => [asc(instructions.stepOrder)]
				},
				recipeIngredients: {
					with: {
						ingredient: true,
						unit: true
					}
				}
			}
		});

		console.log(`📊 Found ${allRecipes.length} recipes in database:\n`);

		for (const recipe of allRecipes) {
			console.log(`📖 ${recipe.name}`);
			console.log(`   ⏱️  Prep: ${recipe.prepTime}min, Cook: ${recipe.cookTime}min, Serves: ${recipe.servings}`);
			
			if (recipe.notes) {
				console.log(`   📝 ${recipe.notes}`);
			}

			console.log(`   🥄 Ingredients (${recipe.recipeIngredients.length}):`);
			for (const ri of recipe.recipeIngredients) {
				const unit = ri.unit?.name || '';
				const notes = ri.notes ? ` (${ri.notes})` : '';
				const ingredientName = ri.ingredient?.name || 'Unknown ingredient';
				console.log(`      • ${ri.quantity} ${unit} ${ingredientName}${notes}`);
			}

			console.log(`   📋 Instructions (${recipe.instructions.length}):`);
			for (const instruction of recipe.instructions) {
				console.log(`      ${instruction.stepOrder}. ${instruction.description}`);
			}
			console.log('');
		}

		// Show summary statistics
		const unitCount = await db.select().from(schema.units);
		const ingredientCount = await db.select().from(schema.ingredients);
		const recipeCount = await db.select().from(schema.recipes);
		const instructionCount = await db.select().from(schema.instructions);
		const recipeIngredientCount = await db.select().from(schema.recipeIngredients);

		console.log('📈 Database Summary:');
		console.log(`   • ${unitCount.length} units`);
		console.log(`   • ${ingredientCount.length} ingredients`);
		console.log(`   • ${recipeCount.length} recipes`);
		console.log(`   • ${instructionCount.length} instructions`);
		console.log(`   • ${recipeIngredientCount.length} recipe-ingredient relationships`);

		console.log('\n✅ Database verification complete!');

	} catch (error) {
		console.error('❌ Error verifying database:', error);
		throw error;
	}
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
	try {
		await verifyDatabase();
	} catch (error) {
		console.error('💥 Verification failed:', error);
		process.exit(1);
	} finally {
		await sql.end();
		process.exit(0);
	}
}
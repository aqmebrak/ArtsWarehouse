import { db } from '$lib/server/db';
import { reset } from 'drizzle-seed';
import type { Actions } from './$types';
import * as schema from '$lib/server/db/schema';
import { 
	ingredients, 
	units, 
	recipes, 
	recipeIngredients, 
	instructions 
} from '$lib/server/db/schema';

export const actions = {
	default: async () => {
		try {
			console.log('🔄 Resetting database...');
			// Reset all tables
			await reset(db, schema);

			console.log('📦 Loading seed data...');
			const data = await import('./data.json');

			console.log('🥄 Seeding units...');
			// Insert units first
			const insertedUnits = await db
				.insert(units)
				.values(data.units.map((name) => ({ name })))
				.returning();

			console.log('🥬 Seeding ingredients...');
			// Insert ingredients
			const insertedIngredients = await db
				.insert(ingredients)
				.values(data.ingredients.map((name) => ({ name })))
				.returning();

			console.log('📖 Seeding recipes...');
			// Create lookup maps for faster access
			const unitMap = new Map(insertedUnits.map(unit => [unit.name, unit.id]));
			const ingredientMap = new Map(insertedIngredients.map(ingredient => [ingredient.name, ingredient.id]));

			// Insert recipes with all their relationships
			for (const recipeData of data.recipes) {
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
			console.log(`📊 Seeded: ${insertedUnits.length} units, ${insertedIngredients.length} ingredients, ${data.recipes.length} recipes`);
			
		} catch (error) {
			console.error('❌ Error seeding database:', error);
			throw error;
		}
	}
} satisfies Actions;

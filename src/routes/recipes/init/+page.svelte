<div class="mx-auto max-w-2xl p-6">
	<h1 class="mb-6 text-3xl font-bold">Database Initialization</h1>

	<div class="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
		<h2 class="mb-2 text-lg font-semibold text-yellow-800">⚠️ Warning</h2>
		<p class="text-yellow-700">
			This will completely reset your database and seed it with initial data including:
		</p>
		<ul class="mt-2 list-inside list-disc text-yellow-700">
			<li><strong>Units:</strong> mL, g, kg, cup, etc.</li>
			<li><strong>Ingredients:</strong> ~120 common ingredients</li>
			<li>
				<strong>Sample Recipes:</strong> 3 complete recipes with ingredients and instructions
			</li>
		</ul>
		<p class="mt-2 font-medium text-yellow-700">All existing data will be lost!</p>
	</div>

	<form method="POST" class="space-y-4">
		<button
			type="submit"
			class="w-full rounded-lg bg-red-600 px-6 py-3 font-bold text-white transition-colors hover:bg-red-700"
		>
			🔄 Initialize Database
		</button>
	</form>

	<div class="mt-6 text-sm text-gray-600">
		<p>This process will:</p>
		<ol class="mt-2 list-inside list-decimal space-y-1">
			<li>Reset all tables (users, recipes, ingredients, units, etc.)</li>
			<li>Insert basic units and ingredients</li>
			<li>Create sample recipes with proper relationships</li>
			<li>Insert cooking instructions for each recipe</li>
		</ol>
	</div>
</div>

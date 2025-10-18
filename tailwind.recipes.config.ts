import type { Config } from 'tailwindcss';

const config: Config = {
	content: ['./src/routes/recipes/**/*.{svelte,ts}', './src/lib/**/*.{svelte,ts}'],
	darkMode: 'class',
	theme: {
		extend: {
			fontFamily: {
				sans: ['SF Pro', 'Inter', 'sans-serif']
			}
		}
	},
	plugins: []
};

export default config;

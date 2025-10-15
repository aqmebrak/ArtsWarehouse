import type { Config } from 'tailwindcss';

const config: Config = {
	content: ['./src/routes/tellurichymn/**/*.{svelte,ts}', './src/lib/**/*.{svelte,ts}'],
	darkMode: 'class',
	theme: {
		extend: {
			fontFamily: {
				mono: ['Source Code Pro', 'Fira Code', 'monospace']
			}
		}
	},
	plugins: []
};

export default config;

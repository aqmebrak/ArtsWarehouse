import type { Config } from 'tailwindcss';

const config: Config = {
	content: ['./src/routes/audio-training/**/*.{svelte,ts}', './src/lib/**/*.{svelte,ts}'],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				'at-surface': '#0b1120',
				'at-accent': '#7c3aed',
				'at-muted': '#312e81'
			},
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif']
			}
		}
	},
	plugins: []
};

export default config;

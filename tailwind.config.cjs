/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				primary: '#322659',
				secondary: '#6B46C1',
				lavenderWeb: '#e7e6f7ff',
				queenPink: '#e3d0d8ff',
				heliotropeGray: '#aea3b0ff',
				periwinkleCrayola: '#c6d2edff',
				plumpPurple: '#6b46c1ff',
				plumpPurpleLight: 'rgba(107, 70, 193, 0.5)',
				russianViolet: '#322659ff'
			}
		}
	},
	plugins: []
};

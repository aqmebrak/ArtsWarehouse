const config = {
	mode: 'jit',
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			colors: {
				primary: '#322659',
				secondary: '#6B46C1',
			}
		}
	},

	plugins: []
};

module.exports = config;

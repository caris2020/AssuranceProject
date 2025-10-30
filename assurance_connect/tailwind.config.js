/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
	theme: {
		extend: {
			colors: {
				brand: {
					50: '#F2F7FF',
					100: '#E6F0FF',
					200: '#BFD6FF',
					300: '#99BDFF',
					400: '#4D8CFF',
					500: '#0B5FFF',
					600: '#0847CC',
					700: '#0637A0',
					800: '#04266F',
					900: '#021943',
				},
				accent: {
					50: '#FFFBE6',
					100: '#FFF7D6',
					200: '#FFE89A',
					300: '#FFD965',
					400: '#FFCA2E',
					500: '#FFC107',
					600: '#E0AA06',
					700: '#CC9A06',
					800: '#8C6A04',
					900: '#5C4603',
				}
			}
		}
	},
	darkMode: 'class',
}



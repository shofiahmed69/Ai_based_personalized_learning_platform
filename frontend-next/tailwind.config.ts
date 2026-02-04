import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        page: 'rgb(3 7 18)',
        surface: 'rgb(17 24 39)',
      },
    },
  },
  plugins: [],
};

export default config;

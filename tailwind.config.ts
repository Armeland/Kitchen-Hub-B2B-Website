import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        moss: '#053F27',
        cream: '#F3F0DD',
        seaweed: '#08170B',
        // Secondary Colors
        jade: '#19785C',
        mint: '#5ABD99',
      },
      fontFamily: {
        jost: ['var(--font-jost)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config

import typographyPlugin from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '100%',
            h3: {
              fontWeight: '700',
              marginTop: '1.5em',
              marginBottom: '0.75em',
            },
            h4: {
              fontWeight: '600',
              marginTop: '1.25em',
              marginBottom: '0.5em',
            },
            p: {
              marginTop: '0.5em',
              marginBottom: '0.75em',
            },
            table: {
              fontSize: '0.875em',
              width: '100%',
            },
            code: {
              backgroundColor: '#f3f4f6',
              borderRadius: '0.25rem',
              paddingLeft: '0.25rem',
              paddingRight: '0.25rem',
              paddingTop: '0.125rem',
              paddingBottom: '0.125rem',
            },
            'code::before': {
              content: 'none',
            },
            'code::after': {
              content: 'none',
            },
            pre: {
              backgroundColor: '#f3f4f6',
              borderRadius: '0.375rem',
              padding: '1rem',
            }
          }
        }
      }
    },
  },
  plugins: [
    typographyPlugin
  ],
}
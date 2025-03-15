
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'bebas': ['"Bebas Neue"', 'sans-serif'],
			},
			colors: {
				border: 'hsl(215 20% 30% / 0.4)', /* Lightened from 25% to 30% */
				input: 'hsl(215 20% 30% / 0.4)', /* Lightened from 25% to 30% */
				ring: 'hsl(var(--ring))',
				background: 'hsl(220 20% 15%)', /* Lightened from 10% to 15% */
				foreground: 'hsl(210 10% 90%)',
				primary: {
					DEFAULT: 'hsl(210 100% 55%)',
					foreground: 'hsl(0 0% 100%)'
				},
				secondary: {
					DEFAULT: 'hsl(220 20% 20%)', /* Slightly adjusted */
					foreground: 'hsl(210 10% 90%)'
				},
				destructive: {
					DEFAULT: 'hsl(0 80% 60%)',
					foreground: 'hsl(0 0% 100%)'
				},
				muted: {
					DEFAULT: 'hsl(220 20% 25%)', /* Adjusted to maintain visual hierarchy */
					foreground: 'hsl(210 10% 70%)'
				},
				accent: {
					DEFAULT: 'hsl(220 20% 25%)', /* Adjusted to maintain visual hierarchy */
					foreground: 'hsl(210 10% 90%)'
				},
				popover: {
					DEFAULT: 'hsl(220 20% 17%)', /* Adjusted for new background */
					foreground: 'hsl(210 10% 90%)'
				},
				card: {
					DEFAULT: 'hsl(220 20% 19% / 0.6)', /* Adjusted to maintain contrast with background */
					foreground: 'hsl(210 10% 90%)'
				},
				sidebar: {
					DEFAULT: 'hsl(220 20% 17%)', /* Lightened slightly */
					foreground: 'hsl(210 10% 90%)',
					primary: 'hsl(210 100% 55%)',
					'primary-foreground': 'hsl(0 0% 100%)',
					accent: 'hsl(220 20% 23%)', /* Lightened slightly */
					'accent-foreground': 'hsl(210 10% 90%)',
					border: 'hsl(215 20% 30% / 0.4)', /* Lightened slightly */
					ring: 'hsl(210 100% 55%)'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				fadeIn: {
					from: { opacity: '0' },
					to: { opacity: '1' }
				},
				fadeOut: {
					from: { opacity: '1' },
					to: { opacity: '0' }
				},
				slideInFromRight: {
					from: { transform: 'translateX(100%)' },
					to: { transform: 'translateX(0)' }
				},
				slideOutToRight: {
					from: { transform: 'translateX(0)' },
					to: { transform: 'translateX(100%)' }
				},
				slideInFromLeft: {
					from: { transform: 'translateX(-100%)' },
					to: { transform: 'translateX(0)' }
				},
				slideOutToLeft: {
					from: { transform: 'translateX(0)' },
					to: { transform: 'translateX(-100%)' }
				},
				slideInFromTop: {
					from: { transform: 'translateY(-100%)' },
					to: { transform: 'translateY(0)' }
				},
				slideOutToTop: {
					from: { transform: 'translateY(0)' },
					to: { transform: 'translateY(-100%)' }
				},
				slideInFromBottom: {
					from: { transform: 'translateY(100%)' },
					to: { transform: 'translateY(0)' }
				},
				slideOutToBottom: {
					from: { transform: 'translateY(0)' },
					to: { transform: 'translateY(100%)' }
				},
				scaleIn: {
					from: { transform: 'scale(0.95)', opacity: '0' },
					to: { transform: 'scale(1)', opacity: '1' }
				},
				scaleOut: {
					from: { transform: 'scale(1)', opacity: '1' },
					to: { transform: 'scale(0.95)', opacity: '0' }
				},
				float: {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-8px)' }
				},
				pulse: {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.5' }
				},
				shimmer: {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fadeIn 0.5s ease-out',
				'fade-out': 'fadeOut 0.5s ease-out',
				'slide-in-right': 'slideInFromRight 0.4s ease-out',
				'slide-out-right': 'slideOutToRight 0.4s ease-out',
				'slide-in-left': 'slideInFromLeft 0.4s ease-out',
				'slide-out-left': 'slideOutToLeft 0.4s ease-out',
				'slide-in-top': 'slideInFromTop 0.4s ease-out',
				'slide-out-top': 'slideOutToTop 0.4s ease-out',
				'slide-in-bottom': 'slideInFromBottom 0.4s ease-out',
				'slide-out-bottom': 'slideOutToBottom 0.4s ease-out',
				'scale-in': 'scaleIn 0.3s ease-out',
				'scale-out': 'scaleOut 0.3s ease-out',
				'float': 'float 5s ease-in-out infinite',
				'pulse': 'pulse 2s ease-in-out infinite',
				'shimmer': 'shimmer 2s linear infinite'
			},
			backdropBlur: {
				xs: '2px',
			},
			boxShadow: {
				'subtle': '0 4px 10px -2px rgba(0, 0, 0, 0.05)',
				'glass': '0 8px 32px rgba(0, 0, 0, 0.1)',
				'neon': '0 0 10px rgba(66, 153, 225, 0.5)',
			},
			animationDelay: {
				'1000': '1000ms',
				'2000': '2000ms',
			},
		}
	},
	plugins: [
		require("tailwindcss-animate"),
		function({ addUtilities, theme }) {
			const newUtilities = {};
			Object.entries(theme('animationDelay')).forEach(([key, value]) => {
				newUtilities[`.animation-delay-${key}`] = { animationDelay: value };
			});
			addUtilities(newUtilities);
		}
	],
} satisfies Config;

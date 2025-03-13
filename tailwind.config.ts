
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
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
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

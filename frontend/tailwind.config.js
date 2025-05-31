/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      boxShadow: {
        'neo': '4px 4px 0 0 #000',
        'neo-lg': '8px 8px 0 0 #000',
      },
      borderWidth: { 
        '3': '3px',
        '4': '4px', 
        '5': '5px',
        '6': '6px'
      },
      keyframes: {
        "slide-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "slide-up-full": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "collapsible-down": {
          from: { height: "0" },
          to: { height: "var(--radix-collapsible-content-height)" },
        },
        "collapsible-up": {
          from: { height: "var(--radix-collapsible-content-height)" },
          to: { height: "0" },
        },
        "wiggle": {
          "0%, 100%": { transform: "rotate(-1deg)" },
          "50%": { transform: "rotate(2deg)" },
        },
      },
      animation: {
        "slide-up": "slide-up 0.3s ease-out",
        "slide-up-full": "slide-up-full 0.3s ease-out",
        "collapsible-down": "collapsible-down 0.2s ease-out",
        "collapsible-up": "collapsible-up 0.2s ease-out",
        "wiggle": "wiggle 8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

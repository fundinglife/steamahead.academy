/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        ocean: {
          50: "#eefaff",
          100: "#d7f2fb",
          500: "#0798d1",
          700: "#056e9a",
          900: "#15323f"
        },
        leaf: {
          500: "#62b233",
          700: "#438522"
        }
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

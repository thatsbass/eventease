import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

const config = defineConfig({
  theme: {
    tokens: {
      fonts: {
        heading: { value: "system-ui, sans-serif" },
        body: { value: "system-ui, sans-serif" },
      },
      colors: {
        primary: { value: "#885df6" },
        primarySoft: { value: "rgba(136, 93, 246, 0.08)" },
        primarySoftHover: { value: "#713cf735" },
        primaryHover: { value: "#885df645" },
        mobile: {
          dark: { value: "#19253E" },
        },
        text: {
          dark: { value: "#000000" },
          muted: { value: "#8d695e" },
          subtle: { value: "#5c4a45" },
        },
        accent: {
          gray: { value: "#E7E8EB" },
        },
        surface: {
          dark: { value: "#1a1a1a" },
          soft: { value: "#f7f7f7" },
          hover: { value: "#f0f0f0" },
        },
        neutral: {
          600: { value: "#6b6b6b" },
        },
        navy: {
          50: { value: "#E8EAF0" },
          100: { value: "#C5CAD9" },
          200: { value: "#9EA7C0" },
          300: { value: "#7784A7" },
          400: { value: "#596A94" },
          500: { value: "#3B5081" },
          600: { value: "#354979" },
          700: { value: "#2D406E" },
          800: { value: "#263764" },
          900: { value: "#1A2744" },
        },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)

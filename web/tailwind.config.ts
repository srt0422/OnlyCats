import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#cb0c9f',
          focus: '#ad0a87',
          content: '#ffffff',
        },
        secondary: {
          DEFAULT: '#8392ab',
          focus: '#96a2b8',
        },
        success: {
          DEFAULT: '#82d616',
          focus: '#95dc39',
        },
        info: {
          DEFAULT: '#17c1e8',
          focus: '#3acaeb',
        },
        warning: {
          DEFAULT: '#fbcf33',
          focus: '#fcd652',
        },
        danger: {
          DEFAULT: '#ea0606',
          focus: '#ff3d3d',
        },
        light: {
          DEFAULT: '#e9ecef',
          focus: '#e9ecef',
        },
        dark: {
          DEFAULT: '#344767',
          focus: '#344767',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(310deg, #7928ca, #ff0080)',
        'gradient-secondary': 'linear-gradient(310deg, #627594, #a8b8d8)',
        'gradient-success': 'linear-gradient(310deg, #17ad37, #98ec2d)',
        'gradient-info': 'linear-gradient(310deg, #2152ff, #21d4fd)',
        'gradient-warning': 'linear-gradient(310deg, #f53939, #fbcf33)',
        'gradient-danger': 'linear-gradient(310deg, #ea0606, #ff667c)',
        'gradient-light': 'linear-gradient(310deg, #ced4da, #ebeff4)',
        'gradient-dark': 'linear-gradient(310deg, #141727, #3a416f)',
      },
      boxShadow: {
        'soft-xxs': '0 1px 5px 1px #ddd',
        'soft-xs': '0 3px 5px -1px rgba(0,0,0,.09),0 2px 3px -1px rgba(0,0,0,.07)',
        'soft-sm': '0 .25rem .375rem -.0625rem hsla(0,0%,8%,.12),0 .125rem .25rem -.0625rem hsla(0,0%,8%,.07)',
        'soft-md': '0 4px 7px -1px rgba(0,0,0,.11),0 2px 4px -1px rgba(0,0,0,.07)',
        'soft-lg': '0 20px 27px 0 rgba(0,0,0,.05)',
        'soft-xl': '0 8px 26px -4px hsla(0,0%,8%,.15),0 8px 9px -5px hsla(0,0%,8%,.06)',
      },
    },
  },
  plugins: [],
};
export default config;

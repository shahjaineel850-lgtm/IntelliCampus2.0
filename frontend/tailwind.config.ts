import type { Config } from 'tailwindcss';
const config: Config = { content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'], theme: { extend: { colors: { ink: '#17233B', teal: '#0B6B69', mint: '#B8F0D2', coral: '#F07865', saffron: '#E5B44C', mist: '#F5F7F4', slate: '#64748B', border: '#DCE4E1' }, boxShadow: { soft: '0 8px 28px rgba(23,35,59,.06)' } } }, plugins: [] };
export default config;

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The built panel is served by the API server at /panel.
// In development (npm run dev), API calls are passed through to the local server.
const api = process.env.API_URL || 'http://localhost:4000';
const proxied = ['/auth', '/admin', '/health'];

export default defineConfig({
  base: '/panel/',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: Object.fromEntries(proxied.map((p) => [p, { target: api, changeOrigin: true }])),
  },
});

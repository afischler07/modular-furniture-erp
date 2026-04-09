import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/modular-furniture-erp/',  // GitHub Pages Repo-Name
  server: {
    port: 5173
  }
});

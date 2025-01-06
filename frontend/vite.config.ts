import { defineConfig } from 'vite';
import path from "path";
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    port: 5173,
    hmr: {
      path: 'ws',
      clientPort: 8000, // this should match your nginx port
    }
  }
})

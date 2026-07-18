import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const src = "C:\\Users\\Muhammad Jawad M R\\.gemini\\antigravity-ide\\brain\\f28a1c0d-be97-454f-9e7e-c3922cce7985\\media__1784385056617.png";
const dest = path.join(__dirname, 'public', 'logo.png');

try {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log('Logo copied successfully via Vite config!');
  } else {
    console.error('Source logo file does not exist at:', src);
  }
} catch (err) {
  console.error('Failed to copy logo in Vite config:', err);
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});

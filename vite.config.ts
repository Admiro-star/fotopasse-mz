import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// FotoPasse MZ — configurado para correr bem em browsers Android
// e preparado para futura embalagem com Capacitor (ver README secção "APK").
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // permite testar no telemóvel via IP local
  },
  build: {
    target: 'es2018',
    sourcemap: false,
  },
});

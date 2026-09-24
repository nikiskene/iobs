import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command, mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env };
  if (command === 'build' && (!env.VITE_SUPABASE_URL ||
      !(env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY))) {
    throw new Error('Build blocked: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY or VITE_SUPABASE_PUBLISHABLE_KEY in the hosting build environment.');
  }
  return {
    plugins: [react()],
    optimizeDeps: { exclude: ['lucide-react'] },
  };
});

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const supabaseUrl = env.SUPABASE_URL || process.env.SUPABASE_URL || ''
  const supabaseAnonKey = env.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''

  return {
    plugins: [react()],
    server: {
      port: 3000,
      open: true,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      'import.meta.env.SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
    },
  }
})

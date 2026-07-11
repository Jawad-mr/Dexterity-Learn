import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Auto-copy the uploaded user logo on build/dev execution
try {
  const source = "C:\\Users\\Muhammad Jawad M R\\.gemini\\antigravity-ide\\brain\\5ca871ac-613a-4292-b364-b46f2aedc1a9\\media__1783783019205.png"
  const targetDir = path.resolve('./public')
  
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true })
  }
  
  const target = path.join(targetDir, 'logo.png')
  if (fs.existsSync(source)) {
    fs.copyFileSync(source, target)
    console.log('--- AUTO LOGO COPY SUCCESSFUL ---')
  }
} catch (err) {
  console.error('Failed to copy logo in config:', err)
}

export default defineConfig({
  plugins: [react()],
})

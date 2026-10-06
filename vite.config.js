import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    target: 'es2020',
    // shaders/js ships its full component registry (~2.5 MB raw / ~0.7 MB gzip).
    // It is lazy-loaded only when WebGPU is present, so fallback devices never download it.
    chunkSizeWarningLimit: 3000,
  },
})

// Presets for the Shaders vanilla-JS API (`createShader(canvas, { components })`).
// Component names and props come from the shaders@4.0.0 source
// (packages/core/src/shaders/<Name>/index.ts) and the official llms-full.txt reference.
//
// Direction (Julián): LOW-CONTRAST section backgrounds that never compete with text.
// Reference: his favorites in /workspace/shader-gallery — "Plasma Veins" (muted organic
// magenta flow) and "Scanline Fog" (soft CRT fog, cold phosphor), and their quiet Lote 2
// cousins "Soft Vein Glow" (#07060c #1a1020 #2a1830 #4a1a3a #7a3a5a) and
// "Mist Scanfield" (#06080c #0c1014 #1a2830 #3a5060 #8aa8b8).
// Ignara hub palette: #050708 · #0e1a19 · #1b191c · #ff4f28 (accent, UI only) · #dfc7a4 · #f0eee9

export const effects = {
  hero: {
    index: '01',
    name: 'Plasma',
    support: 'FilmGrain',
    ref: 'Plasma Veins',
    why: 'Flujo orgánico magenta, apagado y lento, como Plasma Veins en versión Soft Vein Glow; el grano fino repite el material del wordmark.',
    preset: {
      components: [
        {
          type: 'FilmGrain',
          id: 'hero-grain',
          props: { strength: 0.12, bias: 2, animated: false },
          children: [
            {
              type: 'Plasma',
              id: 'hero-plasma',
              props: {
                // Two-color mode: muted vein magenta (Soft Vein Glow) into near-black.
                // Note: in our tests multi-stop `stops` flattened Plasma to a single tone.
                colorA: '#5a2048',
                colorB: '#07060c',
                density: 2,
                speed: 0.6,
                intensity: 1.5,
                warp: 0.5,
                contrast: 1,
                balance: 50,
              },
            },
          ],
        },
      ],
    },
    show: { 'hero-plasma': ['colorA', 'colorB', 'density', 'speed', 'intensity', 'warp'], 'hero-grain': ['strength'] },
    still: { 'hero-plasma': { speed: 0 } },
  },

  books: {
    index: '02',
    name: 'Fog',
    support: 'CRTScreen',
    ref: 'Scanline Fog',
    why: 'Niebla fría de fósforo con scanlines suaves, como Scanline Fog bajado a Mist Scanfield; responde muy poco al dedo.',
    preset: {
      components: [
        {
          type: 'CRTScreen',
          id: 'books-crt',
          props: {
            pixelSize: 128,
            colorShift: 0,
            scanlineIntensity: 0.2,
            scanlineFrequency: 320,
            brightness: 1,
            contrast: 1,
            vignetteIntensity: 0.5,
            vignetteRadius: 0.6,
          },
          children: [
            {
              type: 'Fog',
              id: 'books-fog',
              props: {
                colorA: '#2a4a5c',
                colorB: '#06080c',
                speed: 0.5,
                turbulence: 0.6,
                detail: 12,
                blending: 0.6,
                mouseInfluence: 0.05,
                mouseRadius: 0.15,
                seed: 4,
              },
            },
          ],
        },
      ],
    },
    show: {
      'books-fog': ['colorA', 'colorB', 'speed', 'turbulence', 'blending', 'mouseInfluence'],
      'books-crt': ['scanlineIntensity', 'scanlineFrequency', 'colorShift', 'vignetteIntensity'],
    },
    still: { 'books-fog': { speed: 0, turbulence: 0 } },
  },

  doors: {
    index: '03',
    name: 'Godrays',
    support: 'Glitch',
    ref: 'Scanline Fog + Soft Tear',
    why: 'Haces dorados de sello casi a ras del fondo, con un glitch mínimo (rgbShift bajo, sin barras de color) que solo se nota si miras.',
    preset: {
      components: [
        {
          type: 'Glitch',
          id: 'doors-glitch',
          props: {
            intensity: 0.06,
            speed: 0.4,
            rgbShift: 1.5,
            blockDensity: 6,
            colorBarIntensity: 0,
            mirrorAmount: 0,
            scanlineIntensity: 0.1,
          },
          children: [
            {
              type: 'Godrays',
              id: 'doors-rays',
              props: {
                center: { x: 0.5, y: 0 },
                density: 0.2,
                intensity: 0.14,
                spotty: 0.2,
                speed: 0.15,
                rayColor: '#5a5048',
                backgroundColor: '#0d0c0e',
              },
            },
          ],
        },
      ],
    },
    show: {
      'doors-rays': ['rayColor', 'backgroundColor', 'density', 'intensity', 'speed'],
      'doors-glitch': ['intensity', 'rgbShift', 'colorBarIntensity', 'mirrorAmount'],
    },
    still: { 'doors-rays': { speed: 0 }, 'doors-glitch': { intensity: 0 } },
  },

  family: {
    index: '04',
    name: 'FloatingParticles',
    support: 'MeshGradient',
    ref: 'Soft Vein Glow',
    why: 'Pocas motas tenues que suben sobre un degradado vino casi negro: compañía, no espectáculo.',
    preset: {
      components: [
        {
          type: 'MeshGradient',
          id: 'family-mesh',
          props: {
            stops: [
              { color: '#07060c', position: 0 },
              { color: '#0e1a19', position: 0.5 },
              { color: '#2a1830', position: 1 },
            ],
            count: 4,
            smoothness: 3,
            swirl: 0.1,
            drift: 0.25,
            speed: 0.2,
            seed: 12,
          },
        },
        {
          type: 'FloatingParticles',
          id: 'family-motes',
          props: {
            particleColor: '#7a3a5a',
            shape: 'glow',
            count: 260,
            particleSize: 1.6,
            softness: 0.8,
            speed: 0.08,
            angle: 90,
            angleVariance: 25,
            randomness: 0.4,
            twinkle: 0.4,
            opacity: 0.7,
          },
        },
      ],
    },
    show: {
      'family-motes': ['particleColor', 'count', 'particleSize', 'speed', 'twinkle', 'opacity'],
      'family-mesh': ['stops', 'speed'],
    },
    still: { 'family-mesh': { speed: 0 }, 'family-motes': { speed: 0, twinkle: 0 } },
  },
}

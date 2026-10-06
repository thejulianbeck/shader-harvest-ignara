# Ignara Universe · demo de fondos con Shaders

Demo phone-first de **fondos de sección de bajo contraste** para el hub de Ignara Universe, hecha con la biblioteca abierta [Shaders](https://github.com/shader-effects-inc/shaders) (WebGPU).

**En vivo:** https://thejulianbeck.github.io/shader-harvest-ignara/

## Dirección

Fondos quietos que no compiten con el texto, en la línea de *Plasma Veins* y *Scanline Fog* (y sus versiones suaves *Soft Vein Glow* y *Mist Scanfield*) de la [shader-gallery](https://thejulianbeck.github.io/shader-gallery/), con la paleta del hub (`#050708`, `#0e1a19`, `#1b191c`, `#dfc7a4`, `#f0eee9`; el acento `#ff4f28` solo en la interfaz).

| Sección | Componentes | Referencia |
| --- | --- | --- |
| 01 Hero | `Plasma` dentro de `FilmGrain` | Plasma Veins / Soft Vein Glow |
| 02 Nuestros libros | `Fog` dentro de `CRTScreen` | Scanline Fog / Mist Scanfield |
| 03 Las siete puertas | `Godrays` dentro de `Glitch` (casi imperceptible) | sello dorado, glitch mínimo |
| 04 Únete a la familia | `MeshGradient` + `FloatingParticles` | Soft Vein Glow |

Los presets están en [`src/effects.js`](src/effects.js). La «ficha» de cada sección muestra el componente y los parámetros, y se genera a partir de esos mismos presets.

## Stack

- Vanilla JS con `createShader` de `shaders/js` (shaders@4.0.0) y build de Vite a archivos estáticos.
- **Fallback:** si no existe `navigator.gpu`, la biblioteca no se descarga y se ven degradados CSS con la misma paleta, junto con una nota discreta. Si sí existe, se consulta `getWebGPUSupport()` de la biblioteca antes de montar, y cada sección pasa a su fondo estático cuando `onError` informa una falla terminal.
- `prefers-reduced-motion`: los fondos se montan con velocidad 0 y se pausan. En el pie hay un botón para pausar o reanudar.
- Telemetría de Shaders desactivada (`disableTelemetry: true`).
- La biblioteca carga su registro completo de componentes: unos 715 KB gzip, en un chunk diferido que solo se descarga cuando hay WebGPU.

```bash
npm install
npm run dev      # local
npm run build    # genera dist/ (publicado en la rama gh-pages)
```

## Créditos y licencia

- Efectos: **Shaders** © Shader Effects, Inc., con [licencia MIT](https://github.com/shader-effects-inc/shaders/blob/main/LICENSE) (aviso completo en [`THIRD_PARTY_LICENSES.md`](THIRD_PARTY_LICENSES.md)).
- Wordmark y textos de Ignara: © Julián. Los textos de prueba se tomaron del hub y no son canon.

import './styles.css'
import { effects } from './effects.js'

const root = document.documentElement
const statusText = document.querySelector('.gpu-status-text')
const motionBtn = document.getElementById('motion-toggle')
const reduceMotionMQ = window.matchMedia('(prefers-reduced-motion: reduce)')

// Debug/verification hook (read-only use).
const debug = (window.__ignara = { gpu: 'loading', reason: null, stages: {}, errors: [] })

/* ---------- Info blocks: name, why, params rendered from the SAME presets the GPU gets ---------- */
const isColor = (v) => typeof v === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)
const fmt = (v) => {
  if (isColor(v)) return `<span class="chip"><i style="--c:${v}"></i>${v}</span>`
  if (Array.isArray(v) && v.every((s) => s && isColor(s.color))) return v.map((s) => fmt(s.color)).join('')
  if (v && typeof v === 'object' && 'x' in v && 'y' in v) return `{ x: ${v.x}, y: ${v.y} }`
  if (typeof v === 'string') return `'${v}'`
  return String(v)
}
function findComponent(list, id) {
  for (const c of list) {
    if (c.id === id) return c
    const hit = c.children && findComponent(c.children, id)
    if (hit) return hit
  }
  return null
}
document.querySelectorAll('[data-info]').forEach((el) => {
  const fx = effects[el.dataset.info]
  el.querySelector('summary').innerHTML =
    `Fondo ${fx.index} · <span class="nm">${fx.name}</span>${fx.support ? ` + ${fx.support}` : ''} · ficha`
  el.querySelector('.spec-why').textContent = `${fx.why} (Referencia: ${fx.ref}.)`
  el.querySelector('.params').innerHTML = Object.entries(fx.show)
    .map(([id, keys]) => {
      const comp = findComponent(fx.preset.components, id)
      const rows = keys.map((k) => `<dt>${k}</dt><dd>${fmt(comp.props[k])}</dd>`).join('')
      return `<div class="params-group"><p class="params-title">${comp.type}</p><dl>${rows}</dl></div>`
    })
    .join('')
})

/* ---------- Fallback handling ---------- */
const stages = [...document.querySelectorAll('.stage[data-effect]')]
const setStage = (stage, state) => {
  stage.dataset.state = state
  debug.stages[stage.dataset.effect] = state
}
function goFallback(reason) {
  root.dataset.gpu = 'fallback'
  debug.gpu = 'fallback'
  debug.reason = reason
  stages.forEach((s) => setStage(s, 'fallback'))
  statusText.textContent =
    reason === 'unsupported'
      ? 'Vista estática · este navegador no tiene WebGPU'
      : 'Vista estática · WebGPU no está disponible aquí'
  motionBtn.hidden = true
  const note = document.querySelector('.fb-note')
  if (note && reason !== 'unsupported') note.textContent = 'Vista estática: WebGPU no está disponible aquí.'
}

/* ---------- Mount ---------- */
const instances = []
let paused = false

function stillProps(fx) {
  return fx.still || {}
}
function applyStill(fx, instance, still) {
  for (const [id, props] of Object.entries(stillProps(fx))) {
    if (still) instance.update(id, props)
    else {
      const comp = findComponent(fx.preset.components, id)
      const original = Object.fromEntries(Object.keys(props).map((k) => [k, comp.props[k]]))
      instance.update(id, original)
    }
  }
}

function presetFor(fx, still) {
  // Deep-clone and, for reduced motion, freeze animation props before mounting.
  const preset = structuredClone(fx.preset)
  if (still) {
    for (const [id, props] of Object.entries(stillProps(fx))) {
      Object.assign(findComponent(preset.components, id).props, props)
    }
  }
  return preset
}

async function boot() {
  // 1) Cheap synchronous check first: without navigator.gpu we never download the library.
  if (!('gpu' in navigator) || !navigator.gpu) return goFallback('unsupported')

  let lib
  try {
    lib = await import('shaders/js')
  } catch (e) {
    debug.errors.push(String(e))
    return goFallback('load-failed')
  }

  // 2) The library's own probe (asks for an adapter, cached for the page).
  const support = await lib.getWebGPUSupport()
  if (!support.supported) return goFallback(support.reason || 'no-adapter')

  root.dataset.gpu = 'live'
  debug.gpu = 'live'
  statusText.textContent = 'WebGPU · en vivo'

  const still = reduceMotionMQ.matches
  motionBtn.hidden = false
  if (still) {
    paused = true
    motionBtn.textContent = 'Animar fondos'
    motionBtn.setAttribute('aria-pressed', 'true')
    statusText.textContent = 'WebGPU · movimiento reducido'
  }

  await Promise.all(
    stages.map(async (stage) => {
      const fx = effects[stage.dataset.effect]
      const canvas = stage.querySelector('canvas')
      let instance = null
      try {
        instance = await lib.createShader(canvas, presetFor(fx, still), {
          disableTelemetry: true,
          onReady: () => {
            if (stage.dataset.state !== 'fallback') setStage(stage, 'live')
            // Reduced motion / paused: keep the first frame, stop the loop.
            if (paused && instance) instance.pause()
          },
          // Terminal failures: swap this stage to its static CSS fallback.
          onError: (reason) => {
            debug.errors.push(`${stage.dataset.effect}: ${reason}`)
            const terminal = instance ? instance.getFailureReason() : reason
            if (terminal) setStage(stage, 'fallback')
          },
        })
        instances.push({ fx, instance, stage })
        if (instance.getFailureReason()) setStage(stage, 'fallback')
      } catch (e) {
        debug.errors.push(`${stage.dataset.effect}: ${e && e.message ? e.message : e}`)
        setStage(stage, 'fallback')
      }
    }),
  )

  if (stages.every((s) => s.dataset.state === 'fallback')) goFallback(debug.errors[0] || 'init-failed')
}

/* ---------- Motion toggle (+ follows the OS setting live) ---------- */
function setStill(still) {
  paused = still
  instances.forEach(({ fx, instance }) => {
    applyStill(fx, instance, still)
    // Let one frame with the frozen props render before stopping the loop.
    if (still) setTimeout(() => paused && instance.pause(), 120)
    else instance.resume()
  })
  motionBtn.textContent = still ? 'Animar fondos' : 'Pausar movimiento'
  motionBtn.setAttribute('aria-pressed', String(still))
  if (root.dataset.gpu === 'live') statusText.textContent = still ? 'WebGPU · en pausa' : 'WebGPU · en vivo'
}
motionBtn.addEventListener('click', () => setStill(!paused))
reduceMotionMQ.addEventListener?.('change', (e) => setStill(e.matches))

boot().catch((e) => {
  debug.errors.push(String(e))
  goFallback('init-failed')
})

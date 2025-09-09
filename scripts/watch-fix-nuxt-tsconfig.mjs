import { readFileSync, writeFileSync, existsSync, watch } from 'node:fs'
import { resolve } from 'node:path'

const targets = [
  '.nuxt/tsconfig.json',
  '.nuxt/tsconfig.server.json'
]

function ensureValidModule(tsconfigPath) {
  try {
    if (!existsSync(tsconfigPath)) return
    const raw = readFileSync(tsconfigPath, 'utf-8')
    const json = JSON.parse(raw)
    json.compilerOptions = json.compilerOptions || {}
    const desired = 'esnext'
    if (json.compilerOptions.module !== desired && json.compilerOptions.module !== desired.toUpperCase()) {
      json.compilerOptions.module = desired
      writeFileSync(tsconfigPath, JSON.stringify(json, null, 2))
      console.log(`[watch-fix] ${tsconfigPath}: module -> ${desired}`)
    }
  } catch (e) {
    console.warn('[watch-fix] error fixing', tsconfigPath, e?.message)
  }
}

for (const rel of targets) {
  const p = resolve(process.cwd(), rel)
  ensureValidModule(p)
  try {
    watch(resolve(process.cwd(), rel.split('/')[0]), { recursive: true }, (event, filename) => {
      if (!filename) return
      if (filename.endsWith('tsconfig.json') || filename.endsWith('tsconfig.server.json')) {
        ensureValidModule(p)
      }
    })
  } catch (e) {
    // fallback: periodic check
    setInterval(() => ensureValidModule(p), 1500)
  }
}

console.log('[watch-fix] watching .nuxt tsconfig changes')



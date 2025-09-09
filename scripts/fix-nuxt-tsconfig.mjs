import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const targets = [
  '.nuxt/tsconfig.json',
  '.nuxt/tsconfig.server.json'
]

try {
  let changed = 0
  for (const relPath of targets) {
    const tsconfigPath = resolve(process.cwd(), relPath)
    if (!existsSync(tsconfigPath)) {
      console.log(`[fix-nuxt-tsconfig] ${relPath} no existe aún, saltando`)
      continue
    }

    const raw = readFileSync(tsconfigPath, 'utf-8')
    const json = JSON.parse(raw)
    json.compilerOptions = json.compilerOptions || {}

    // Forzar explícitamente a ES2022 para evitar incompatibilidades del TS Server
    json.compilerOptions.module = 'es2022'
    writeFileSync(tsconfigPath, JSON.stringify(json, null, 2))
    console.log(`[fix-nuxt-tsconfig] ${relPath}: fijado compilerOptions.module = "es2022"`)
    changed++
  }

  if (changed === 0) {
    // no-op
  }
} catch (err) {
  console.error('[fix-nuxt-tsconfig] Error:', err)
  process.exit(0)
}



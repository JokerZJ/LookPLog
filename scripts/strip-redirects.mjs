import { unlinkSync, existsSync } from 'node:fs'
import { join } from 'node:path'

/** Cloudflare Workers 静态资源部署禁止 /* -> /index.html 的 _redirects（会报 100324） */
const target = join(process.cwd(), 'dist', '_redirects')
if (existsSync(target)) {
  unlinkSync(target)
  console.log('Removed dist/_redirects (incompatible with Cloudflare Workers assets)')
}

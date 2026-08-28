/**
 * Cloudflare Worker：静态资源未命中时回退到 index.html（React Router SPA）
 * 已存在的 js/css/图片等由 Assets 直接提供，不会进入本脚本。
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    // 带扩展名的路径视为静态资源缺失，保持 404
    const last = url.pathname.split('/').pop() ?? ''
    if (last.includes('.')) {
      return env.ASSETS.fetch(request)
    }
    return env.ASSETS.fetch(new URL('/index.html', url.origin))
  },
}

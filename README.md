# LookPlog

衣橱 / 穿搭记录 Web App（React + Vite + Supabase）。

## 本地开发

1. 复制环境变量：`cp .env.example .env`，填入 Supabase URL 与 anon key  
2. 按 `supabase/` 下 SQL 初始化数据库（新库用 `schema.sql`，已有库按 v2→v5 执行 migration）  
3. 安装并启动：

```bash
npm install
npm run dev
```

## 免费发布（手机可用）

见 **[DEPLOY.md](./DEPLOY.md)**：支持 Vercel / Cloudflare Pages / Netlify 一键部署，手机浏览器打开或「添加到主屏幕」使用。

# LookPlog 免费发布指南（手机可用）

本项目是 Vite 静态站点 + Supabase 后端，可用 **Vercel** 或 **Cloudflare Pages** 免费托管。

## 发布前准备

1. 代码推到 GitHub（不要提交 `.env`）
2. 确认本地能构建成功：

```bash
npm run build
```

3. 准备两个环境变量（来自 Supabase → Project Settings → API）：

| 变量名 | 说明 |
|--------|------|
| `VITE_SUPABASE_URL` | Project URL |
| `VITE_SUPABASE_ANON_KEY` | anon / public key |

---

## 方案 A：Vercel（推荐，步骤最少）

1. 打开 [vercel.com](https://vercel.com) ，用 GitHub 登录
2. **Add New Project** → 导入本仓库
3. Framework Preset 选 **Vite**（一般会自动识别）
4. 在 **Environment Variables** 填入：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. 点击 **Deploy**
6. 部署完成后得到类似：`https://lookplog-xxx.vercel.app`

项目根目录已有 `vercel.json`，负责 SPA 路由回退。

---

## 方案 B：Cloudflare Pages

1. 打开 [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages**
2. 连接 GitHub 仓库
3. 构建设置：
   - Build command: `npm run build`
   - Build output directory: `dist`
4. 在 **Environment variables** 添加同上两个 `VITE_*` 变量
5. Save and Deploy

`public/_redirects` 与 `wrangler.toml` 已配置好 SPA 回退。

---

## 方案 C：Netlify（可选）

1. [app.netlify.com](https://app.netlify.com) 导入仓库
2. Build command: `npm run build`，Publish directory: `dist`
3. 添加两个 `VITE_*` 环境变量后部署

同样使用 `public/_redirects` 做 SPA 回退。

---

## 配置 Supabase（必做，否则登录可能失败）

1. 打开 Supabase Dashboard → **Authentication** → **URL Configuration**
2. **Site URL** 改成你的线上地址，例如：
   `https://lookplog-xxx.vercel.app`
3. **Redirect URLs** 增加：
   - `https://lookplog-xxx.vercel.app/**`
   - 本地开发可保留：`http://localhost:5173/**`

若使用了 Storage / RLS，确认相关策略已按 `supabase/` 下 SQL 执行完毕（含 v2–v5 migration）。

---

## 手机上使用

1. 用手机浏览器打开线上 HTTPS 地址
2. **iPhone（Safari）**：分享 → **添加到主屏幕**
3. **Android（Chrome）**：菜单 → **添加到主屏幕** / **安装应用**

之后可像 App 一样从桌面图标打开。

---

## 常见问题

**页面空白 / 白屏**  
检查托管平台是否配置了 `VITE_SUPABASE_URL` 与 `VITE_SUPABASE_ANON_KEY`，改完后需重新 Deploy。

**能打开但不能登录**  
检查 Supabase 的 Site URL / Redirect URLs 是否包含线上域名。

**刷新子路由 404**  
确认已使用本仓库的 `vercel.json` 或 `public/_redirects`；Cloudflare / Netlify 需以 `dist` 为输出目录重新部署。

**改代码后不更新**  
推送到已连接的 Git 分支后，平台会自动重新构建；也可在控制台手动 Redeploy。

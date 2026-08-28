# LookPlog 免费发布指南（手机可用）

本项目是 Vite 静态站点 + Supabase 后端。

> **国内访问建议优先用 Cloudflare Pages**（`*.pages.dev`）。  
> Vercel（`*.vercel.app`）在国内常出现「无法访问此网站」。

## 发布前准备

1. 代码已推到 GitHub（不要提交 `.env`）
2. 本地确认构建成功：`npm run build`
3. 准备 Supabase 环境变量（Dashboard → Project Settings → API）：

| 变量名 | 说明 |
|--------|------|
| `VITE_SUPABASE_URL` | Project URL |
| `VITE_SUPABASE_ANON_KEY` | anon / public key |

项目已包含：
- `wrangler.toml`（Cloudflare：`dist` + SPA 回退）
- `netlify.toml`（Netlify SPA 回退，可选）
- `vercel.json`（Vercel SPA 回退）

> 不要在 Cloudflare 项目里使用 `public/_redirects` 的 `/* /index.html 200`，  
> 会与 Workers 静态资源部署冲突并报 `Infinite loop detected`（code 100324）。

---

## 方案 A：Cloudflare Pages（推荐，国内更易打开）

### 1. 登录并创建 Pages 项目

1. 打开 [https://dash.cloudflare.com](https://dash.cloudflare.com)
2. 注册 / 登录（可用邮箱，或用 Google 等）
3. 左侧进入 **Workers & Pages**（有的界面叫 **Compute (Workers)** → **Workers & Pages**）
4. 点 **Create** → 选 **Pages** → **Connect to Git**

### 2. 连接 GitHub

1. 选择 **GitHub**，授权 Cloudflare 访问仓库
2. 选中本项目仓库（如 `lookPlog` / `look-p-log`）
3. 点 **Begin setup**

若看不到仓库：在 GitHub → Settings → Applications → Cloudflare Pages 里打开仓库权限。

### 3. 构建设置

| 项 | 填写 |
|----|------|
| **Project name** | 随意，如 `lookplog`（决定 `xxx.pages.dev` 域名） |
| **Production branch** | `master` 或 `main`（与你 GitHub 默认分支一致） |
| **Framework preset** | `Vite`（没有就选 None） |
| **Build command** | `npm run build` |
| **Deploy command** | `npx wrangler deploy`（**不要留空**，留空会报 Invalid request body） |
| **Root directory** | **留空** 或 `.`（**不要填 `/`**） |
| **Build output / assets** | 由仓库 `wrangler.toml` 的 `[assets] directory = "./dist"` 指定 |

> 若 Deploying 报错 `Missing entry-point ... assets directory`：  
> 把最新 `wrangler.toml` push 到 GitHub 后再 Retry。  
> 临时也可把 Deploy command 写成：`npx wrangler deploy --assets=./dist` |

### 4. 环境变量（必填）

在同一页找到 **Environment variables**（或 Deploy 后再进 Settings → Environment variables）：

1. `VITE_SUPABASE_URL` = 你的 Supabase Project URL  
2. `VITE_SUPABASE_ANON_KEY` = 你的 anon public key  

建议 **Production** 和 **Preview** 都加上。

> Vite 的环境变量在**构建时**写入前端包。改变量后必须重新部署一次。

### 5. 部署

点 **Save and Deploy**，等 1～3 分钟。成功后地址类似：

`https://lookplog.pages.dev`

（具体以 Cloudflare 页面显示为准）

### 6. 配置 Supabase（必做）

1. Supabase → **Authentication** → **URL Configuration**
2. **Site URL** 改为：`https://你的项目名.pages.dev`
3. **Redirect URLs** 增加：
   - `https://你的项目名.pages.dev/**`
   - `http://localhost:5173/**`（本地开发）
4. Save

### 7. 手机使用

用手机浏览器打开 `https://xxx.pages.dev`，可「添加到主屏幕」。

---

## 方案 B：Vercel（国外网络更方便）

见历史说明。国内若打不开 `*.vercel.app`，请改用方案 A。

---

## 方案 C：Netlify（可选）

1. [app.netlify.com](https://app.netlify.com) 导入仓库  
2. Build: `npm run build`，Publish: `dist`  
3. 添加两个 `VITE_*` 环境变量后部署  

---

## 常见问题

**国内仍打不开**  
换 4G/5G 试；或给 Cloudflare Pages 绑定国内可解析的自定义域名。

**白屏 / 接口报错**  
检查两个 `VITE_*` 是否已配置，改完后 **Retry deployment**。

**能打开但不能登录**  
检查 Supabase Site URL / Redirect URLs 是否已换成 `.pages.dev` 域名。

**刷新子路由 404**  
确认 `public/_redirects` 已在仓库中且重新部署成功。

**改代码不更新**  
`git push` 后 Cloudflare 会自动构建；也可在 Deployments 里手动 Retry。

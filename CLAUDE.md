# VibeBridge Image Lab

## 项目定位

这是 VibeBridge 的官方图片生成工作台前端，第一版用户自行填写 VibeBridge/New API Key 使用图片模型。它不是独立钱包、独立登录系统或云端图片托管服务。

## 安全规则

- 不把上游 API Key、New API admin token、支付密钥、operator bearer token 写入代码、文档、构建产物或日志。
- 默认 API URL 只能指向 `https://api.vibebridge.top/v1` 或本地开发代理。
- 默认 API Key 必须为空。
- 不开启公开 API 代理；代理模式必须另写设计并单独验收。
- 用户图片历史和 API Key 只按前端本地存储处理，不承诺云端保存。

## 部署（2026-07-16 起：只用 wrangler 直传，不走 Git 自动部署）

```bash
npm run build
npx wrangler pages deploy dist --project-name vibebridge-image-lab --branch master --commit-dirty=true
```

- 线上域名：`https://image.vibebridge.top` / `https://vibebridge-image-lab.pages.dev`，Pages 项目 `vibebridge-image-lab`，生产分支 `master`（直传时 `--branch master` 必须带，否则不会成为生产部署）。
- **为什么禁用了 Git 自动部署**：该 Pages 项目的 Git 集成曾被错误连接到另一个仓库 `lemonw603-sys/vibebridge`（中转站项目），且构建命令为空——导致那个仓库每次 push 都会把仓库根目录当静态站部署，抢占生产并把本站打成 404（2026-07 上旬实际发生，全站 404 一周+）。API 无法改绑仓库，2026-07-16 已把该项目的 `deployments_enabled` 全部关掉止血。
- **如果要恢复 Git 自动部署**：必须去 Cloudflare Dashboard → Pages → vibebridge-image-lab → Settings → Builds & deployments，把 Git 仓库改绑到 `lemonw603-sys/vibebridge-image-lab`（分支 `master`，build `npm run build`，输出 `dist`），确认后再重新开启 deployments。改绑前不要重新打开自动部署。

## 验证命令

```bash
npm run build
npm test
```

如果做 UI 或部署改动，必须用浏览器打开本地预览或线上预览确认页面可用。

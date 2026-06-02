# VibeBridge Image Lab

VibeBridge Image Lab 是 VibeBridge 的官方图片生成工作台，基于 MIT 开源项目 `CookSleep/gpt_image_playground` 改造。

## 使用模型

- 用户填写自己的 VibeBridge / New API Key。
- 默认 API URL：`https://api.vibebridge.top/v1`。
- Key、额度、模型白名单、价格和调用日志由 New API 负责。
- 图片历史、设置和用户填写的 API Key 保存在浏览器本地。

## M1 边界

第一版只做商业化轻集成：

- 不做 Image Lab 登录。
- 不做独立钱包或充值。
- 不做云端图库或长期图片托管。
- 不启用公开 API 代理。
- 不绕过 VibeBridge / New API 请求真实上游。

## 安全规则

- 默认 API Key 必须为空。
- 不把上游 API Key、New API admin token、支付密钥、operator bearer token 写入代码、文档、构建产物或日志。
- 不在公共电脑或共享设备上保存 API Key。
- 代理模式必须另写设计并单独验收，不能通过 Docker/Nginx 环境变量临时打开。
- 提交 Issue、PR、日志、截图和浏览器导出前，必须移除 API Key、token、账号 ID 和私有 URL。
- 公开仓库或发布版本前，必须按 `docs/public-release-checklist.md` 完成检查。

## 本地开发

```bash
npm install
npm run build
npm test
```

本地预览：

```bash
npm run preview -- --host 127.0.0.1
```

浏览器检查：

- 页面标题显示 VibeBridge Image Lab。
- 默认 API URL 是 `https://api.vibebridge.top/v1`。
- API Key 默认为空。
- 设置页提醒共享设备风险。

## 部署

M1 目标是 Cloudflare Pages 静态部署：

```text
Build command: npm run build
Build output directory: dist
Custom domain: image.vibebridge.top
Proxy mode: off
Default API URL: https://api.vibebridge.top/v1
```

公开部署、DNS、Cloudflare Pages 项目创建和域名绑定都需要 Lemon 明确确认后才能执行。

## 参与贡献与安全

- 贡献流程见 `CONTRIBUTING.md`。
- 漏洞报告和敏感信息处理规则见 `SECURITY.md`。
- Bug 与功能建议请使用 `.github/ISSUE_TEMPLATE/` 中的模板，并避免粘贴密钥或真实账号数据。

## 上游与许可证

本项目基于 `CookSleep/gpt_image_playground`，保留原 MIT License。后续同步上游时，必须重新检查默认 API、代理开关、安全文档和密钥暴露风险。

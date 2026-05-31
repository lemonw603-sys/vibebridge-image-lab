# VibeBridge Image Lab

## 项目定位

这是 VibeBridge 的官方图片生成工作台前端，第一版用户自行填写 VibeBridge/New API Key 使用图片模型。它不是独立钱包、独立登录系统或云端图片托管服务。

## 安全规则

- 不把上游 API Key、New API admin token、支付密钥、operator bearer token 写入代码、文档、构建产物或日志。
- 默认 API URL 只能指向 `https://api.vibebridge.top/v1` 或本地开发代理。
- 默认 API Key 必须为空。
- 不开启公开 API 代理；代理模式必须另写设计并单独验收。
- 用户图片历史和 API Key 只按前端本地存储处理，不承诺云端保存。

## 验证命令

```bash
npm run build
npm test
```

如果做 UI 或部署改动，必须用浏览器打开本地预览或线上预览确认页面可用。

# 🚀 Better Prompt - 部署前检查清单

## 📋 部署前必检项目

### ✅ 文件结构检查
- [ ] `index.html` 存在且完整
- [ ] `css/` 目录包含所有样式文件
- [ ] `js/` 目录包含所有功能文件
- [ ] `assets/` 目录包含所有资源文件
- [ ] `vercel.json` 配置文件已创建

### 🔧 代码质量检查
- [ ] 所有文件路径使用相对路径
- [ ] 没有硬编码的绝对路径
- [ ] 外部CDN资源链接正常
- [ ] 所有JavaScript模块正确导入

### 🌐 功能测试
- [ ] 本地打开 `index.html` 功能正常
- [ ] API Key设置功能工作正常
- [ ] 提示词优化功能可用
- [ ] 主题切换正常
- [ ] 历史记录功能正常

### 📂 Git 准备
- [ ] 所有更改已提交到Git
- [ ] 分支名称正确（建议使用 `main` 或 `master`）
- [ ] 代码已推送到GitHub仓库
- [ ] 仓库为public（Vercel免费版要求）

### 🚀 Vercel 账号准备
- [ ] 已注册Vercel账号
- [ ] 已连接GitHub账号
- [ ] 了解基本部署流程

## 🎯 部署完成后
- [ ] 获取实际部署URL
- [ ] 更新 `popup.js` 中的 `webAppUrl`
- [ ] 重新打包插件
- [ ] 测试插件跳转功能

## 🆘 常见问题预防

### 路径问题
确保所有资源使用相对路径：
```html
✅ 正确: <link rel="stylesheet" href="css/styles.css">
❌ 错误: <link rel="stylesheet" href="/css/styles.css">
❌ 错误: <link rel="stylesheet" href="file:///path/css/styles.css">
```

### API密钥安全
Better Prompt 使用前端存储API密钥，这是安全的，因为：
- 密钥存储在用户本地浏览器
- 不会发送到任何服务器
- 用户完全控制自己的密钥

### 跨域问题
确保API调用配置正确：
- Gemini API默认支持跨域
- 如使用其他API，检查CORS设置

---

## 📞 需要帮助？
如果遇到问题，请检查：
1. 浏览器控制台错误信息
2. Vercel部署日志
3. 网络请求状态

准备好了就开始部署吧！🚀 
# Better Prompt - Vercel 部署指南

## 🚀 快速部署到 Vercel

### 前提条件
- GitHub 账号
- Vercel 账号（推荐使用 GitHub 登录）

### 📂 准备工作

1. **确保代码已推送到 GitHub**
   ```bash
   git add .
   git commit -m "feat: 准备 Vercel 部署"
   git push origin main
   ```

### 🌐 Vercel 部署步骤

#### 方法一：通过 Vercel 网站部署（推荐）

1. **访问 Vercel**
   - 打开 [vercel.com](https://vercel.com)
   - 点击 "Sign up" 或 "Login"
   - 选择 "Continue with GitHub"

2. **导入项目**
   - 登录后点击 "Add New Project"
   - 在 GitHub 仓库列表中找到 `better-prompt`
   - 点击 "Import"

3. **配置部署**
   - Project Name: `better-prompt` (或自定义)
   - Framework Preset: 选择 "Other" 或 "Static"
   - Root Directory: 保持默认 (项目根目录)
   - Build Command: 留空（静态网站无需构建）
   - Output Directory: 留空
   - Install Command: 留空

4. **开始部署**
   - 点击 "Deploy"
   - 等待 1-2 分钟，部署完成
   - 获得类似 `https://better-prompt-xxx.vercel.app` 的域名

#### 方法二：通过 Vercel CLI 部署

1. **安装 Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **登录并部署**
   ```bash
   vercel login
   vercel --prod
   ```

### 🔧 部署后配置

#### 1. 自定义域名（可选）
- 在 Vercel 项目设置中添加自定义域名
- 配置 DNS 记录指向 Vercel

#### 2. 环境变量（如需要）
- 在 Vercel 项目设置中添加环境变量
- 目前 Better Prompt 为前端项目，不需要服务器端环境变量

### 📱 更新插件跳转

部署完成后，需要更新插件中的跳转链接：

1. **获取部署 URL**
   - 复制 Vercel 提供的 `https://your-project.vercel.app` 链接

2. **更新插件代码**
   ```javascript
   // 在 popup.js 中更新 openWebApplication 方法
   openWebApplication() {
       const webAppUrl = 'https://your-project.vercel.app';
       chrome.tabs.create({
           url: webAppUrl,
           active: true
       });
       window.close();
   }
   ```

### 🔄 自动更新流程

每次您推送代码到 GitHub，Vercel 会自动：
1. 检测到新的提交
2. 自动重新部署
3. 更新线上版本

### 📊 监控和分析

Vercel 提供：
- **Analytics**: 访问量统计
- **Functions**: 查看函数执行情况
- **Logs**: 部署和运行日志
- **Speed Insights**: 性能分析

### 🛠️ 常见问题

#### Q1: 部署失败怎么办？
- 检查 `vercel.json` 配置
- 确保所有文件路径正确
- 查看 Vercel 部署日志

#### Q2: 样式或功能不正常？
- 检查浏览器控制台错误
- 确认所有资源路径为相对路径
- 验证 CDN 资源是否正常加载

#### Q3: 如何回滚到之前版本？
- 在 Vercel Dashboard 中选择 "Deployments"
- 找到目标版本，点击 "Promote to Production"

### 📞 支持资源

- [Vercel 官方文档](https://vercel.com/docs)
- [Vercel 部署指南](https://vercel.com/docs/concepts/deployments/overview)
- [GitHub 集成说明](https://vercel.com/docs/concepts/git/vercel-for-github)

---

## 🎉 部署完成后

1. ✅ 测试 web 应用所有功能
2. ✅ 更新插件跳转链接
3. ✅ 测试插件到 web 应用的跳转
4. ✅ 分享您的 Better Prompt 应用！

**部署 URL 示例**: `https://better-prompt-xxx.vercel.app` 
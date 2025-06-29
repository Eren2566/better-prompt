# Better Prompt - AI提示词优化器

一个强大的AI提示词优化工具，提供**Web应用版本**和**浏览器插件版本**，帮助您在任何地方创建更有效的提示词。

> 🆕 **v2.0** 新增浏览器插件版本，支持在任意网页输入框中一键优化提示词！

## 📦 版本说明

### 🌐 Web应用版本
- 功能完整的独立Web应用
- 支持多AI提供商和高级功能
- 适合深度使用和批量处理

### 🔌 浏览器插件版本（推荐）
- Chrome浏览器扩展
- 在任意网页输入框中快速优化
- 轻量级设计，专注核心功能
- 自定义快捷键触发

## ✨ 插件功能特性

### ⚡ 快速触发
- **自定义快捷键** - 支持7种不同的触发方式
  - 连击三下：空格、回车、Tab、分号(;)
  - 组合键：Ctrl+空格、Alt+空格、Ctrl+回车
- **智能检测** - 自动识别各种输入框类型
- **即时优化** - 无需切换页面，原地优化

### 🎯 专业优化
- **三种优化模板** - 默认、精简、扩展
- **双模型支持** - Gemini 2.5 Flash（速度）/ Pro（质量）
- **优化强度调节** - 轻柔、中等、深度三档
- **思考模式** - 可视化AI推理过程

### 🎨 精美界面
- **现代化设计** - 渐变背景，卡片式布局
- **响应式交互** - 悬停动效，状态反馈
- **直观设置** - 一目了然的配置选项
- **状态指示** - 实时显示连接状态

## 🚀 快速开始 - 浏览器插件

### 1. 安装插件

#### 方法一：开发者模式安装
1. 下载项目源码到本地
2. 打开Chrome浏览器，进入 `chrome://extensions/`
3. 开启右上角"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目根目录
6. 插件安装完成！

#### 方法二：生成图标（可选）
1. 打开 `assets/icons/generate-plugin-icons.html`
2. 点击"下载所有图标"按钮
3. 将文件重命名为 `icon16.png`、`icon48.png`、`icon128.png`
4. 放置到 `assets/icons/` 目录

### 2. 配置API Key

1. 点击浏览器工具栏中的插件图标
2. 在弹出窗口中输入Gemini API Key
3. 点击"保存"按钮
4. 看到绿色状态点表示配置成功

#### 获取Gemini API Key
1. 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 点击"Create API Key"
3. 复制生成的密钥

### 3. 自定义设置

#### 优化模板选择
- **默认** - 平衡优化策略，适合通用场景
- **精简** - 压缩为高密度提示词
- **扩展** - 结构化详细优化

#### 模型配置
- **Gemini 2.5 Flash** - 响应速度快，适合快速优化
- **Gemini 2.5 Pro** - 优化质量高，适合重要内容

#### 快捷键设置
选择最适合您的触发方式：
- `连击三下空格` - 默认方式，不干扰输入
- `Ctrl+空格` - 最快速的触发方式
- `连击三下回车` - 适合多行输入场景
- 其他选项根据个人喜好选择

### 4. 开始使用

1. 在任意网页的输入框中输入粗糙的提示词
2. 使用设置的快捷键触发优化（如连击三下空格）
3. 等待AI处理，优化结果会自动替换原文
4. 享受高质量的优化提示词！

#### 支持的输入框类型
- 文本输入框 (`<input type="text">`)
- 文本域 (`<textarea>`)
- 富文本编辑器 (contentEditable)
- 各种在线编辑器（Quill、Draft.js、ProseMirror等）

## 📖 使用场景

### 💬 聊天对话优化
在ChatGPT、Claude、Gemini等AI对话平台：
```
原始输入：帮我写个营销方案
优化后：作为资深营销策划专家，请为我制定一份针对年轻消费群体的数字营销方案。请包含：1）目标受众分析，2）核心卖点提炼，3）渠道选择策略，4）预算分配建议，5）效果评估指标。方案应具有可操作性和创新性。
```

### 📝 写作辅助
在各种在线编辑器中：
```
原始输入：写个产品介绍
优化后：请撰写一份专业的产品介绍文案，要求：1）突出产品核心优势和差异化特色，2）使用感性和理性并重的表达方式，3）结构清晰，包含产品概述、功能特点、使用场景、客户价值四个部分，4）语言生动有吸引力，长度控制在300-500字。
```

### 🔍 搜索查询优化
在搜索引擎和知识库：
```
原始输入：Python数据分析
优化后：Python数据分析入门到进阶完整教程，包含pandas、numpy、matplotlib数据处理可视化实战案例，适合初学者零基础学习数据科学
```

## 🏗️ 项目架构

```
better-prompt/
├── 📁 Web应用版本
│   ├── index.html              # 主页面
│   ├── css/
│   │   ├── styles.css          # 主要样式
│   │   └── themes.css          # 主题变量
│   └── js/
│       ├── app.js              # 主应用逻辑
│       └── modules/            # 功能模块
│
├── 🔌 浏览器插件版本
│   ├── manifest.json           # 插件配置文件
│   ├── popup.html              # 插件弹窗页面
│   ├── popup.js                # 弹窗逻辑
│   ├── content.js              # 内容脚本（核心功能）
│   └── assets/
│       └── icons/              # 插件图标
│
└── 📚 文档
    ├── README.md               # 项目说明
    └── TASKS.md                # 开发任务清单
```

### 插件核心文件说明

#### 📄 manifest.json
- Chrome扩展配置文件
- 定义权限、图标、脚本等

#### 🎨 popup.html + popup.js  
- 插件设置界面
- API配置、模板选择、快捷键设置

#### ⚡ content.js
- 核心功能脚本
- 键盘事件监听、输入框检测、API调用

## ⚙️ 插件配置选项

### API设置
| 选项 | 说明 | 默认值 |
|------|------|--------|
| API Key | Gemini API密钥 | 无 |
| 连接状态 | 显示API连接状态 | 红点(未连接) |

### 优化设置
| 选项 | 说明 | 可选值 |
|------|------|--------|
| 优化模板 | 选择优化策略 | 默认/精简/扩展 |
| AI模型 | 选择处理模型 | Flash(速度)/Pro(质量) |
| 优化强度 | 调节优化程度 | 轻柔/中等/深度 |

### 思考模式
| 选项 | 说明 | 默认值 |
|------|------|--------|
| 思考模式 | 显示AI推理过程 | 关闭 |
| 思考深度 | 推理复杂度(0-24576) | 8000 |

### 快捷键设置
| 快捷键 | 类型 | 适用场景 |
|--------|------|----------|
| 连击三下空格 | 默认 | 通用场景，不影响正常输入 |
| Ctrl+空格 | 组合键 | 快速触发，适合频繁使用 |
| 连击三下回车 | 连击 | 多行输入场景 |
| 连击三下Tab | 连击 | 代码编辑器友好 |
| 连击三下分号 | 连击 | 避免冲突 |
| Alt+空格 | 组合键 | 替代方案 |
| Ctrl+回车 | 组合键 | 表单提交替代 |

## 🌐 Web应用版本

如果您需要更强大的功能，可以使用Web应用版本：

### 额外功能
- **多AI提供商** - 支持OpenAI、Anthropic、OpenRouter
- **历史记录管理** - 完整的优化历史追踪
- **批量处理** - 同时优化多个提示词
- **数据导出** - JSON、CSV、Markdown格式
- **自定义模板** - 创建个人优化策略
- **多轮优化** - 连续优化提升质量

### 使用方法
1. 直接打开 `index.html` 文件
2. 或者启动本地服务器：
```bash
# Python
python -m http.server 8000

# Node.js  
npx serve .

# PHP
php -S localhost:8000
```

## 🔧 开发指南

### 插件开发
```javascript
// 添加新的快捷键类型
// 在 content.js 的 checkTriggerKey 方法中：
case 'new-trigger':
    return e.code === 'KeyN' && e.ctrlKey && e.shiftKey;
```

### 添加新模板
```javascript
// 在 popup.js 的 PluginTemplateManager 中：
this.prompts.newTemplate = `新的优化模板内容...`;
```

### 自定义UI
```css
/* 在 popup.html 的 <style> 中添加： */
.new-style {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

## 🔧 故障排除

### Extension context invalidated 错误

如果遇到"Extension context invalidated"错误，这通常是Chrome扩展上下文失效导致的。

**解决步骤**：
1. **重新加载扩展**：
   - 打开 `chrome://extensions/`
   - 找到 Better Prompt 扩展
   - 点击刷新按钮🔄

2. **刷新页面**：
   - 在出现错误的页面按 `F5` 或 `Ctrl+R`

3. **使用调试工具**：
   - 打开浏览器开发者工具（F12）
   - 在控制台中复制粘贴 `debug-helper.js` 的内容并执行
   - 运行 `BetterPromptDebug.fullDiagnosis()` 进行完整诊断

### 使用调试工具

项目包含了一个强大的调试工具 `debug-helper.js`，可以帮助诊断问题：

**可用命令**：
- `BetterPromptDebug.fullDiagnosis()` - 完整诊断
- `BetterPromptDebug.checkContext()` - 检查扩展上下文
- `BetterPromptDebug.testMessage()` - 测试消息通信
- `BetterPromptDebug.checkApiKey()` - 检查API Key配置

### 插件常见问题

#### 连击三次空格没有反应
- ✅ 确保焦点在输入框中（如搜索框、文本框等）
- ✅ 检查快捷键设置是否正确
- ✅ 运行调试工具检查扩展状态

#### 提示"请先配置API Key"
- ✅ 点击扩展图标打开设置面板
- ✅ 输入有效的Google AI API Key
- ✅ 点击"保存API Key"按钮

#### API Key格式无效
- ✅ Google AI API Key格式：`AIza` 开头，总共39个字符
- ✅ 检查是否包含特殊字符或空格

#### 网络连接失败
- ✅ 检查网络连接
- ✅ 确认可以访问 `generativelanguage.googleapis.com`
- ✅ 检查防火墙设置

#### 插件无法加载
- ✅ 检查manifest.json语法
- ✅ 确保开发者模式已开启
- ✅ 重新加载扩展程序

### 错误代码
| 错误信息 | 描述 | 解决方案 |
|----------|------|----------|
| Extension context invalidated | 扩展上下文失效 | 重新加载扩展和页面 |
| 请先配置API Key | API Key未设置 | 在插件设置中配置API Key |
| API Key格式无效 | 密钥格式错误 | 检查密钥格式是否正确 |
| 网络连接失败 | 网络问题 | 检查网络和防火墙设置 |

## 📈 更新日志

### v2.0.0 - 浏览器插件版本 🎉
- ✨ **全新插件版本** - Chrome扩展支持
- ⚡ **自定义快捷键** - 7种触发方式任选
- 🎨 **现代化界面** - 渐变设计，精美交互
- 🤖 **专注Gemini** - 优化的Gemini集成
- 🔧 **智能检测** - 支持各种输入框类型

### v1.5.0 - Web应用增强
- 🤖 多AI提供商支持
- 📊 历史记录管理
- 🎯 自定义模板功能
- 📱 响应式设计优化

### v1.0.0 - 初始版本
- 🎉 基础提示词优化功能
- 🤖 Gemini API集成
- 💾 本地存储支持

## 🤝 贡献

欢迎为Better Prompt贡献代码！

### 贡献方式
1. Fork项目仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

### 开发规范
- 遵循现有代码风格
- 添加适当的注释
- 测试新功能
- 更新相关文档

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 支持与反馈

### 获取帮助
- 📖 查看本文档
- 🔍 搜索现有Issues  
- 💬 创建新Issue
- 📧 联系开发团队

### 反馈渠道
- GitHub Issues - 问题报告和功能建议
- Pull Requests - 代码贡献
- Discussions - 使用交流和讨论

---

<div align="center">

**Better Prompt** - 让AI提示词优化变得简单高效！ 🚀

[🌐 Web版本](.) | [🔌 插件版本](.) | [📖 文档](README.md) | [🤝 贡献](CONTRIBUTING.md)

*现在就开始优化您的AI提示词，体验更智能的对话！*

</div> 
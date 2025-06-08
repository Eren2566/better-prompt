# Better Prompt - AI提示词优化器

一个强大的AI提示词优化工具，支持多个AI提供商，帮助您创建更有效的提示词。

## ✨ 功能特性

### 🤖 多AI提供商支持
- **Gemini API** - Google的先进AI模型
- **OpenAI API** - GPT系列模型
- **Anthropic API** - Claude系列模型

### 📝 智能优化模板
- **默认模板** - 平衡的优化策略
- **精简模板** - 简洁明了的优化
- **扩展模板** - 详细深入的优化
- **自定义模板** - 完全可定制的优化策略

### 📊 历史记录管理
- 完整的优化历史追踪
- 智能搜索和过滤
- 评分和标签系统
- 多格式导出（JSON、CSV、Markdown）
- 详细的统计分析

### 🎨 用户体验
- 响应式设计，支持所有设备
- 深色/浅色主题切换
- 实时字符计数
- 键盘快捷键支持
- 直观的用户界面

### ⚙️ 高级功能
- 多轮优化支持
- 批量处理
- 数据导入/导出
- 本地存储管理
- 错误重试机制

## 🏗️ 项目架构

```
better-prompt/
├── index.html              # 主HTML文件
├── css/
│   ├── styles.css          # 主要样式
│   └── themes.css          # 主题和颜色变量
├── js/
│   ├── app.js              # 主应用逻辑
│   ├── modules/
│   │   ├── apiService.js   # API服务模块
│   │   ├── templateManager.js  # 模板管理模块
│   │   └── historyManager.js   # 历史记录管理模块
│   └── utils/
│       ├── storage.js      # 存储工具
│       └── validators.js   # 验证工具
└── README.md               # 项目文档
```

### 模块说明

#### 🔧 核心模块

**ApiService** (`js/modules/apiService.js`)
- 统一的API调用接口
- 支持多个AI提供商
- 自动重试和错误处理
- 可配置的超时设置

**TemplateManager** (`js/modules/templateManager.js`)
- 预定义优化模板管理
- 自定义模板支持
- 模板验证和导入/导出

**HistoryManager** (`js/modules/historyManager.js`)
- 完整的历史记录CRUD操作
- 高级搜索和过滤功能
- 多格式数据导出
- 统计分析功能

#### 🛠️ 工具模块

**Storage** (`js/utils/storage.js`)
- 本地存储封装
- 数据验证和错误处理
- 存储空间管理

**Validators** (`js/utils/validators.js`)
- API密钥格式验证
- 输入数据验证
- 安全性检查

## 🚀 快速开始

### 1. 获取API密钥

#### Gemini API
1. 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 创建新的API密钥
3. 复制密钥到应用设置中

#### OpenAI API
1. 访问 [OpenAI Platform](https://platform.openai.com/api-keys)
2. 创建新的API密钥
3. 复制密钥到应用设置中

#### Anthropic API
1. 访问 [Anthropic Console](https://console.anthropic.com/)
2. 创建新的API密钥
3. 复制密钥到应用设置中

### 2. 配置应用

1. 打开 `index.html` 文件
2. 点击设置按钮（⚙️）
3. 选择AI提供商并输入API密钥
4. 选择优化模板
5. 配置其他高级选项

### 3. 开始优化

1. 在输入框中输入您的原始提示词
2. 点击"优化提示词"按钮
3. 查看优化结果
4. 可选择保存到历史记录

## 📖 使用指南

### 基本操作

#### 提示词优化
1. **输入原始提示词** - 在左侧文本框输入您的提示词
2. **选择优化模板** - 根据需求选择合适的模板
3. **执行优化** - 点击优化按钮开始处理
4. **查看结果** - 在右侧查看优化后的提示词

#### 历史记录管理
1. **查看历史** - 点击历史按钮查看所有记录
2. **搜索过滤** - 使用搜索框和过滤器查找特定记录
3. **评分标签** - 为记录添加评分和标签
4. **导出数据** - 选择格式导出历史数据

### 高级功能

#### 自定义模板
```javascript
// 模板格式示例
{
  name: "我的模板",
  description: "自定义优化策略",
  prompt: "请优化以下提示词：{input}\n\n要求：\n1. 更加清晰\n2. 更加具体\n3. 更加有效"
}
```

#### 批量处理
1. 准备多个提示词（每行一个）
2. 启用批量模式
3. 选择处理策略
4. 执行批量优化

#### 数据导出格式

**JSON格式**
```json
{
  "id": "unique-id",
  "originalPrompt": "原始提示词",
  "optimizedPrompt": "优化后提示词",
  "template": "使用的模板",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "rating": 5,
  "tags": ["标签1", "标签2"]
}
```

**CSV格式**
```csv
ID,原始提示词,优化提示词,模板,时间,评分,标签
id1,原始内容,优化内容,默认,2024-01-01,5,"标签1,标签2"
```

## ⚙️ 配置选项

### API设置
- **提供商选择** - Gemini/OpenAI/Anthropic
- **API密钥** - 对应提供商的密钥
- **模型选择** - 可用模型列表
- **超时设置** - 请求超时时间
- **重试次数** - 失败重试次数

### 优化设置
- **默认模板** - 启动时使用的模板
- **多轮优化** - 启用连续优化
- **自动保存** - 自动保存优化结果
- **字符限制** - 输入字符数限制

### 界面设置
- **主题模式** - 深色/浅色主题
- **语言设置** - 界面语言
- **字体大小** - 文本显示大小
- **动画效果** - 界面动画开关

## 🔧 开发指南

### 本地开发

1. **克隆项目**
```bash
git clone <repository-url>
cd better-prompt
```

2. **启动本地服务器**
```bash
# 使用Python
python -m http.server 8000

# 或使用Node.js
npx serve .

# 或使用PHP
php -S localhost:8000
```

3. **访问应用**
打开浏览器访问 `http://localhost:8000`

### 代码结构

#### 主应用 (app.js)
```javascript
class BetterPromptApp {
  constructor() {
    this.apiService = new ApiService();
    this.templateManager = new TemplateManager();
    this.historyManager = new HistoryManager();
    // 初始化应用
  }
}
```

#### 模块导入
```javascript
// ES6模块导入
import { ApiService } from './modules/apiService.js';
import { TemplateManager } from './modules/templateManager.js';
import { HistoryManager } from './modules/historyManager.js';
```

### 添加新功能

#### 1. 添加新的AI提供商
```javascript
// 在apiService.js中添加
const PROVIDERS = {
  // 现有提供商...
  newProvider: {
    name: 'New Provider',
    baseUrl: 'https://api.newprovider.com',
    models: ['model-1', 'model-2']
  }
};
```

#### 2. 添加新的优化模板
```javascript
// 在templateManager.js中添加
const DEFAULT_TEMPLATES = {
  // 现有模板...
  newTemplate: {
    name: '新模板',
    description: '新的优化策略',
    prompt: '优化提示词模板...'
  }
};
```

#### 3. 扩展历史记录功能
```javascript
// 在historyManager.js中添加新方法
class HistoryManager {
  // 现有方法...
  
  newFeature(params) {
    // 新功能实现
  }
}
```

### 测试

#### 单元测试示例
```javascript
// 测试API服务
describe('ApiService', () => {
  test('should validate API key', () => {
    const apiService = new ApiService();
    expect(apiService.validateApiKey('gemini', 'valid-key')).toBe(true);
  });
});
```

#### 集成测试
```javascript
// 测试完整流程
describe('Prompt Optimization Flow', () => {
  test('should optimize prompt successfully', async () => {
    const app = new BetterPromptApp();
    const result = await app.optimizePrompt('test prompt');
    expect(result).toBeDefined();
  });
});
```

## 🐛 故障排除

### 常见问题

#### API调用失败
- **检查API密钥** - 确保密钥正确且有效
- **检查网络连接** - 确保能访问API服务
- **查看控制台错误** - 检查浏览器开发者工具

#### 数据丢失
- **检查本地存储** - 确保浏览器支持localStorage
- **清除缓存** - 尝试清除浏览器缓存
- **导出备份** - 定期导出历史数据

#### 界面问题
- **刷新页面** - 尝试硬刷新（Ctrl+F5）
- **检查浏览器兼容性** - 使用现代浏览器
- **禁用扩展** - 暂时禁用浏览器扩展

### 错误代码

| 错误代码 | 描述 | 解决方案 |
|---------|------|----------|
| API_001 | API密钥无效 | 检查并更新API密钥 |
| API_002 | 请求超时 | 增加超时时间或检查网络 |
| STORAGE_001 | 存储空间不足 | 清理历史记录或增加存储 |
| TEMPLATE_001 | 模板格式错误 | 检查模板语法 |

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🤝 贡献

欢迎贡献代码！请遵循以下步骤：

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📞 支持

如果您遇到问题或有建议，请：

1. 查看本文档的故障排除部分
2. 搜索现有的 Issues
3. 创建新的 Issue 描述问题
4. 联系开发团队

## 🔄 更新日志

### v2.0.0 (当前版本)
- ✨ 重构为模块化架构
- ✨ 支持多个AI提供商
- ✨ 增强的历史记录管理
- ✨ 改进的错误处理
- ✨ 新的导出功能

### v1.0.0
- 🎉 初始版本发布
- 🤖 Gemini API支持
- 📝 基础优化模板
- 💾 本地存储功能

---

**Better Prompt** - 让AI提示词优化变得简单高效！ 🚀 
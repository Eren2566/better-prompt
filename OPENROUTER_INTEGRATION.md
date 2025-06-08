# OpenRouter 集成说明

## 概述

Better Prompt 现已支持 OpenRouter 作为第四个 AI 提供商，与 Google Gemini、OpenAI 和 Anthropic 并列。OpenRouter 提供了访问多种 AI 模型的统一接口，包括免费和付费模型。

## 新增功能

### 1. OpenRouter 提供商支持
- **默认模型**: 
  - `deepseek/deepseek-r1-0528:free` - DeepSeek R1 (推理模型)
  - `deepseek/deepseek-chat-v3-0324:free` - DeepSeek Chat V3 (对话模型)
- **API 端点**: `https://openrouter.ai/api/v1`
- **注册地址**: `https://openrouter.ai/`

### 2. 自定义模型支持
OpenRouter 是唯一支持自定义模型的提供商，用户可以：
- 添加任何 OpenRouter 平台支持的模型
- 输入格式：`提供商/模型名称`（如：`anthropic/claude-3-sonnet`）
- 自动生成友好的显示名称
- 动态更新模型列表

### 3. API Key 验证
- **格式**: `sk-or-v1-` 开头，后跟 64 位字符
- **验证模式**: `/^sk-or-v1-[a-zA-Z0-9]{64}$/`
- 自动检测和验证 API Key 格式

## 使用方法

### 1. 获取 API Key
1. 访问 [OpenRouter](https://openrouter.ai/)
2. 注册账户并登录
3. 在设置页面生成 API Key
4. API Key 格式为：`sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 2. 配置 API Key
1. 在 Better Prompt 中点击设置按钮（⚙️）
2. 在 API Key 配置模态框中选择 "OpenRouter"
3. 输入您的 API Key
4. 点击"保存 API Key"

### 3. 使用默认模型
选择 OpenRouter 提供商后，可以直接使用两个预配置的免费模型：
- **DeepSeek R1**: 适合推理和复杂问题解决
- **DeepSeek Chat V3**: 适合日常对话和文本生成

### 4. 添加自定义模型
1. 选择 OpenRouter 提供商
2. 在模型选择器下方会出现"添加自定义模型"区域
3. 输入模型 ID（如：`anthropic/claude-3-sonnet`）
4. 点击"添加"按钮
5. 新模型将出现在模型选择器中

## 支持的模型示例

### 免费模型
- `deepseek/deepseek-r1-0528:free`
- `deepseek/deepseek-chat-v3-0324:free`
- `meta-llama/llama-3.2-3b-instruct:free`
- `microsoft/phi-3-mini-128k-instruct:free`

### 付费模型
- `anthropic/claude-3-5-sonnet`
- `openai/gpt-4o`
- `google/gemini-pro-1.5`
- `meta-llama/llama-3.1-405b-instruct`

## 技术实现

### 1. API 调用
```javascript
// OpenRouter API 调用示例
const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Better Prompt'
    },
    body: JSON.stringify({
        model: 'deepseek/deepseek-r1-0528:free',
        messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: userPrompt }
        ],
        temperature: 0.5,
        max_tokens: 4000
    })
});
```

### 2. 自定义模型管理
```javascript
// 添加自定义模型
apiService.addCustomModel('anthropic/claude-3-sonnet', 'Anthropic Claude 3 Sonnet');

// 移除自定义模型
apiService.removeCustomModel('anthropic/claude-3-sonnet');

// 检查是否支持自定义模型
const supportsCustom = apiService.supportsCustomModels(); // true for OpenRouter
```

### 3. API Key 验证
```javascript
// 验证 OpenRouter API Key
const isValid = Validators.validateApiKey('sk-or-v1-...', 'openrouter');

// 自动检测提供商
const provider = Validators.detectApiProvider('sk-or-v1-...'); // 'openrouter'
```

## 配置文件更新

### API_PROVIDERS 配置
```javascript
openrouter: {
    name: 'OpenRouter',
    models: [
        { id: 'deepseek/deepseek-r1-0528:free', name: 'DeepSeek R1 (推理)' },
        { id: 'deepseek/deepseek-chat-v3-0324:free', name: 'DeepSeek Chat V3 (对话)' }
    ],
    endpoint: 'https://openrouter.ai/api/v1',
    signupUrl: 'https://openrouter.ai/',
    supportsCustomModels: true
}
```

### Validators 更新
```javascript
static API_KEY_PATTERNS = {
    // ... 其他提供商
    openrouter: /^sk-or-v1-[a-zA-Z0-9]{64}$/
};
```

## 注意事项

1. **免费模型限制**: 免费模型可能有使用限制和速率限制
2. **API Key 安全**: API Key 仅存储在本地浏览器中，不会发送到任何服务器
3. **模型可用性**: 某些模型可能需要付费或有地区限制
4. **自定义模型**: 添加的自定义模型会保存在当前会话中，刷新页面后需要重新添加

## 测试

使用 `test-openrouter.html` 文件可以测试 OpenRouter 集成的各个功能：
1. 提供商配置测试
2. API Key 验证测试
3. 自定义模型添加测试
4. API 调用配置测试

## 故障排除

### 常见问题
1. **API Key 验证失败**: 确保 API Key 以 `sk-or-v1-` 开头且长度正确
2. **模型不可用**: 检查模型 ID 是否正确，某些模型可能需要付费
3. **请求失败**: 检查网络连接和 API Key 余额
4. **自定义模型不显示**: 确保当前选择的是 OpenRouter 提供商

### 调试步骤
1. 打开浏览器开发者工具
2. 查看控制台错误信息
3. 检查网络请求状态
4. 验证 API Key 格式和有效性

## 更新日志

### v1.0.0 (当前版本)
- ✅ 添加 OpenRouter 作为第四个 AI 提供商
- ✅ 支持两个默认免费模型（DeepSeek R1 和 Chat V3）
- ✅ 实现自定义模型添加功能
- ✅ 添加 OpenRouter API Key 验证
- ✅ 集成到现有的 UI 和工作流程
- ✅ 创建测试页面和文档 
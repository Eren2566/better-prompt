import { Validators } from '../utils/validators.js';

/**
 * API 提供商配置
 */
const API_PROVIDERS = {
    gemini: {
        name: 'Google Gemini',
        models: [
            { id: 'gemini-2.5-flash-preview-05-20', name: 'Gemini 2.5 Flash (速度)' },
            { id: 'gemini-2.5-pro-preview-06-05', name: 'Gemini 2.5 Pro (质量)' }
        ],
        endpoint: 'https://generativelanguage.googleapis.com/v1beta',
        signupUrl: 'https://makersuite.google.com/'
    },
    openai: {
        name: 'OpenAI',
        models: [
            { id: 'gpt-4o', name: 'GPT-4o (最强)' },
            { id: 'gpt-4o-mini', name: 'GPT-4o Mini (快速)' },
            { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo (经济)' }
        ],
        endpoint: 'https://api.openai.com/v1',
        signupUrl: 'https://platform.openai.com/'
    },
    anthropic: {
        name: 'Anthropic',
        models: [
            { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet (平衡)' },
            { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku (快速)' }
        ],
        endpoint: 'https://api.anthropic.com/v1',
        signupUrl: 'https://console.anthropic.com/'
    },
    openrouter: {
        name: 'OpenRouter',
        models: [
            { id: 'deepseek/deepseek-r1-0528:free', name: 'DeepSeek-R1-0528' },
            { id: 'deepseek/deepseek-chat-v3-0324:free', name: 'DeepSeek-V3-0324' }
        ],
        endpoint: 'https://openrouter.ai/api/v1',
        signupUrl: 'https://openrouter.ai/',
        supportsCustomModels: true
    }
};

/**
 * API 服务类
 */
export class ApiService {
    constructor() {
        this.currentProvider = 'gemini';
        this.apiKeys = new Map();
        this.requestTimeout = 30000;
        this.maxRetries = 3;
    }

    /**
     * 获取所有提供商信息
     * @returns {Object} 提供商配置
     */
    getProviders() {
        return API_PROVIDERS;
    }

    /**
     * 设置当前提供商
     * @param {string} provider - 提供商名称
     */
    setProvider(provider) {
        if (API_PROVIDERS[provider]) {
            this.currentProvider = provider;
        }
    }

    /**
     * 设置 API Key
     * @param {string} provider - 提供商名称
     * @param {string} apiKey - API Key
     * @returns {boolean} 设置是否成功
     */
    setApiKey(provider, apiKey) {
        if (!Validators.validateApiKey(apiKey, provider)) {
            throw new Error('无效的 API Key 格式');
        }
        this.apiKeys.set(provider, apiKey);
        return true;
    }

    /**
     * 获取当前提供商的 API Key
     * @returns {string|null} API Key
     */
    getCurrentApiKey() {
        return this.apiKeys.get(this.currentProvider) || null;
    }

    /**
     * 设置请求配置
     * @param {Object} config - 配置对象
     */
    setConfig(config) {
        if (config.timeout) this.requestTimeout = config.timeout * 1000;
        if (config.maxRetries) this.maxRetries = config.maxRetries;
    }

    /**
     * 带重试的 API 调用
     * @param {Function} apiCall - API 调用函数
     * @param {number} maxRetries - 最大重试次数
     * @returns {Promise} API 响应
     */
    async callWithRetry(apiCall, maxRetries = this.maxRetries) {
        let lastError;
        
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await apiCall();
            } catch (error) {
                lastError = error;
                
                // 如果是认证错误或格式错误，不重试
                if (error.status === 401 || error.status === 400) {
                    throw error;
                }
                
                // 等待一段时间后重试
                if (i < maxRetries - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
                }
            }
        }
        
        throw lastError;
    }

    /**
     * 优化提示词
     * @param {string} originalPrompt - 原始提示词
     * @param {Object} options - 优化选项
     * @returns {Promise<string>} 优化后的提示词
     */
    async optimizePrompt(originalPrompt, options = {}) {
        const {
            template = '',
            model = '',
            temperature = 0.5,
            strength = 'medium',
            multiRound = null,
            thinkingMode = false,
            thinkingBudget = 0
        } = options;

        // 验证输入
        const validation = Validators.validateText(originalPrompt, { maxLength: 50000 });
        if (!validation.isValid) {
            throw new Error(validation.errors.join(', '));
        }

        const apiKey = this.getCurrentApiKey();
        if (!apiKey) {
            throw new Error('请先配置 API Key');
        }

        // 构建系统指令
        let systemInstruction = template;
        if (strength) {
            systemInstruction += this.getStrengthInstruction(strength);
        }
        if (multiRound) {
            systemInstruction += `\n请进行 ${multiRound.rounds} 轮迭代优化，优化深度为 "${multiRound.depth}"。`;
        }

        // 根据提供商选择不同的调用方法
        switch (this.currentProvider) {
            case 'gemini':
                return await this.callGemini(originalPrompt, systemInstruction, model, temperature, thinkingBudget);
            case 'openai':
                return await this.callOpenAI(originalPrompt, systemInstruction, model, temperature);
            case 'anthropic':
                return await this.callAnthropic(originalPrompt, systemInstruction, model, temperature);
            case 'openrouter':
                return await this.callOpenRouter(originalPrompt, systemInstruction, model, temperature);
            default:
                throw new Error(`不支持的提供商: ${this.currentProvider}`);
        }
    }

    /**
     * 调用 Gemini API
     */
    async callGemini(originalPrompt, systemInstruction, model, temperature, thinkingBudget = 0) {
        const apiKey = this.getCurrentApiKey();
        const fullPrompt = `${systemInstruction}\n\n原始用户提示词:\n"""\n${originalPrompt}\n"""\n\n优化后的提示词:`;
        
        const url = `${API_PROVIDERS.gemini.endpoint}/models/${model}:generateContent?key=${apiKey}`;
        const generationConfig = { temperature };
        
        // 为Gemini 2.5 Flash添加思考模式配置
        if (model === 'gemini-2.5-flash-preview-05-20') {
            generationConfig.thinking_config = {
                thinking_budget: thinkingBudget
            };
        }
        
        const payload = {
            contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
            generationConfig
        };

        return await this.callWithRetry(async () => {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: AbortSignal.timeout(this.requestTimeout)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API 请求失败 (${response.status}): ${errorData?.error?.message || '未知错误'}`);
            }

            const result = await response.json();
            
            if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
                return result.candidates[0].content.parts[0].text;
            } else if (result.promptFeedback?.blockReason) {
                throw new Error(`请求被阻止: ${result.promptFeedback.blockReason}`);
            } else {
                throw new Error('未能获取有效的优化结果');
            }
        });
    }

    /**
     * 调用 OpenAI API
     */
    async callOpenAI(originalPrompt, systemInstruction, model, temperature) {
        const apiKey = this.getCurrentApiKey();
        
        const url = `${API_PROVIDERS.openai.endpoint}/chat/completions`;
        const payload = {
            model,
            messages: [
                { role: "system", content: systemInstruction },
                { role: "user", content: `原始提示词: ${originalPrompt}` }
            ],
            temperature,
            max_tokens: 4000
        };

        return await this.callWithRetry(async () => {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(payload),
                signal: AbortSignal.timeout(this.requestTimeout)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API 请求失败 (${response.status}): ${errorData?.error?.message || '未知错误'}`);
            }

            const result = await response.json();
            
            if (result.choices?.[0]?.message?.content) {
                return result.choices[0].message.content;
            } else {
                throw new Error('未能获取有效的优化结果');
            }
        });
    }

    /**
     * 调用 Anthropic API
     */
    async callAnthropic(originalPrompt, systemInstruction, model, temperature) {
        const apiKey = this.getCurrentApiKey();
        
        const url = `${API_PROVIDERS.anthropic.endpoint}/messages`;
        const payload = {
            model,
            system: systemInstruction,
            messages: [
                { role: "user", content: `原始提示词: ${originalPrompt}` }
            ],
            temperature,
            max_tokens: 4000
        };

        return await this.callWithRetry(async () => {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify(payload),
                signal: AbortSignal.timeout(this.requestTimeout)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API 请求失败 (${response.status}): ${errorData?.error?.message || '未知错误'}`);
            }

            const result = await response.json();
            
            if (result.content?.[0]?.text) {
                return result.content[0].text;
            } else {
                throw new Error('未能获取有效的优化结果');
            }
        });
    }

    /**
     * 调用 OpenRouter API
     */
    async callOpenRouter(originalPrompt, systemInstruction, model, temperature) {
        const apiKey = this.getCurrentApiKey();
        
        const url = `${API_PROVIDERS.openrouter.endpoint}/chat/completions`;
        const payload = {
            model,
            messages: [
                { role: "system", content: systemInstruction },
                { role: "user", content: `原始提示词: ${originalPrompt}` }
            ],
            temperature,
            max_tokens: 4000
        };

        return await this.callWithRetry(async () => {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'Better Prompt'
                },
                body: JSON.stringify(payload),
                signal: AbortSignal.timeout(this.requestTimeout)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API 请求失败 (${response.status}): ${errorData?.error?.message || '未知错误'}`);
            }

            const result = await response.json();
            
            if (result.choices?.[0]?.message?.content) {
                return result.choices[0].message.content;
            } else {
                throw new Error('未能获取有效的优化结果');
            }
        });
    }

    /**
     * 添加自定义模型到 OpenRouter
     * @param {string} modelId - 模型ID
     * @param {string} modelName - 模型显示名称
     */
    addCustomModel(modelId, modelName) {
        if (this.currentProvider === 'openrouter') {
            const provider = API_PROVIDERS.openrouter;
            const existingModel = provider.models.find(m => m.id === modelId);
            if (!existingModel) {
                provider.models.push({ id: modelId, name: modelName });
            }
        }
    }

    /**
     * 移除自定义模型
     * @param {string} modelId - 模型ID
     */
    removeCustomModel(modelId) {
        if (this.currentProvider === 'openrouter') {
            const provider = API_PROVIDERS.openrouter;
            const defaultModels = ['deepseek/deepseek-r1-0528:free', 'deepseek/deepseek-chat-v3-0324:free'];
            if (!defaultModels.includes(modelId)) {
                provider.models = provider.models.filter(m => m.id !== modelId);
            }
        }
    }

    /**
     * 获取当前提供商是否支持自定义模型
     * @returns {boolean}
     */
    supportsCustomModels() {
        return API_PROVIDERS[this.currentProvider]?.supportsCustomModels || false;
    }

    /**
     * 获取优化强度对应的具体指令
     * @param {string} strength - 强度级别
     * @returns {string} 具体的优化指令
     */
    getStrengthInstruction(strength) {
        const strengthMap = {
            light: `

【优化强度：轻柔模式】
- 保持原始提示词的核心意图和主要结构
- 仅进行必要的语言润色和逻辑梳理
- 不添加额外的功能要求或约束条件
- 保留用户的原始表达风格和语气
- 优化幅度控制在20-30%以内`,

            medium: `

【优化强度：中等模式】
- 在保持核心意图的基础上，适度重构提示词结构
- 补充必要的上下文信息和约束条件
- 优化语言表达的准确性和清晰度
- 可以适当调整表达方式以提高效果
- 优化幅度控制在40-60%`,

            strong: `

【优化强度：深度优化】
- 可以大幅重构提示词的结构和表达方式
- 主动添加最佳实践的约束条件和输出要求
- 补充完整的角色定义、思维框架等元素
- 根据任务类型添加相应的专业指导
- 优化幅度可达70%以上，但需确保不偏离原始目标`
        };
        
        return strengthMap[strength] || strengthMap.medium;
    }
} 
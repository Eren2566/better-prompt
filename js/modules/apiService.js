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
            thinkingMode = false
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
            systemInstruction += `\n\n请根据 "${strength}" 强度进行优化。`;
        }
        if (multiRound) {
            systemInstruction += `\n请进行 ${multiRound.rounds} 轮迭代优化，优化深度为 "${multiRound.depth}"。`;
        }

        // 根据提供商选择不同的调用方法
        switch (this.currentProvider) {
            case 'gemini':
                return await this.callGemini(originalPrompt, systemInstruction, model, temperature, thinkingMode);
            case 'openai':
                return await this.callOpenAI(originalPrompt, systemInstruction, model, temperature, thinkingMode);
            case 'anthropic':
                return await this.callAnthropic(originalPrompt, systemInstruction, model, temperature, thinkingMode);
            default:
                throw new Error(`不支持的提供商: ${this.currentProvider}`);
        }
    }

    /**
     * 调用 Gemini API
     */
    async callGemini(originalPrompt, systemInstruction, model, temperature, thinkingMode = false) {
        const apiKey = this.getCurrentApiKey();
        const fullPrompt = `${systemInstruction}\n\n原始用户提示词:\n"""\n${originalPrompt}\n"""\n\n优化后的提示词:`;
        
        const url = `${API_PROVIDERS.gemini.endpoint}/models/${model}:generateContent?key=${apiKey}`;
        const payload = {
            contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
            generationConfig: { 
                temperature,
                ...(thinkingMode && { 
                    // 启用思考模式的配置
                    candidateCount: 1,
                    maxOutputTokens: 8192,
                    topP: 0.95,
                    topK: 64
                })
            }
        };

        // 如果是思考模式，添加系统指令来促进深度思考
        if (thinkingMode) {
            payload.systemInstruction = {
                parts: [{
                    text: "请深入分析和思考用户的提示词，从多个角度考虑优化方案。首先分析原提示词的目标、结构、潜在问题，然后提供一个经过深度思考的优化版本。"
                }]
            };
        }

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
    async callOpenAI(originalPrompt, systemInstruction, model, temperature, thinkingMode = false) {
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
    async callAnthropic(originalPrompt, systemInstruction, model, temperature, thinkingMode = false) {
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
} 
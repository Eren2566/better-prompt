/**
 * 验证工具类
 */
export class Validators {
    /**
     * API Key 验证模式
     */
    static API_KEY_PATTERNS = {
        gemini: /^AI[a-zA-Z0-9_-]{35,40}$/,
        openai: /^sk-[a-zA-Z0-9]{48}$/,
        anthropic: /^sk-ant-[a-zA-Z0-9_-]+$/,
        openrouter: /^sk-or-v1-[a-zA-Z0-9]{64}$/
    };

    /**
     * 验证 API Key 格式
     * @param {string} apiKey - API Key
     * @param {string} provider - 提供商类型
     * @returns {boolean} 是否有效
     */
    static validateApiKey(apiKey, provider = null) {
        if (!apiKey || typeof apiKey !== 'string') {
            return false;
        }

        // 如果指定了提供商，验证特定格式
        if (provider && this.API_KEY_PATTERNS[provider]) {
            return this.API_KEY_PATTERNS[provider].test(apiKey);
        }

        // 否则检查是否匹配任意一种格式
        return Object.values(this.API_KEY_PATTERNS).some(pattern => pattern.test(apiKey));
    }

    /**
     * 检测 API Key 所属提供商
     * @param {string} apiKey - API Key
     * @returns {string|null} 提供商名称或 null
     */
    static detectApiProvider(apiKey) {
        if (!apiKey) return null;

        for (const [provider, pattern] of Object.entries(this.API_KEY_PATTERNS)) {
            if (pattern.test(apiKey)) {
                return provider;
            }
        }
        return null;
    }

    /**
     * 验证文本输入
     * @param {string} text - 输入文本
     * @param {Object} options - 验证选项
     * @returns {Object} 验证结果
     */
    static validateText(text, options = {}) {
        const {
            minLength = 1,
            maxLength = 10000,
            required = true,
            allowEmpty = false
        } = options;

        const result = {
            isValid: true,
            errors: []
        };

        if (required && (!text || text.trim().length === 0)) {
            if (!allowEmpty) {
                result.isValid = false;
                result.errors.push('文本不能为空');
            }
        }

        if (text && text.length < minLength) {
            result.isValid = false;
            result.errors.push(`文本长度不能少于 ${minLength} 个字符`);
        }

        if (text && text.length > maxLength) {
            result.isValid = false;
            result.errors.push(`文本长度不能超过 ${maxLength} 个字符`);
        }

        return result;
    }

    /**
     * 验证数值范围
     * @param {number} value - 数值
     * @param {number} min - 最小值
     * @param {number} max - 最大值
     * @returns {boolean} 是否在范围内
     */
    static validateRange(value, min, max) {
        return typeof value === 'number' && value >= min && value <= max;
    }

    /**
     * 验证温度参数
     * @param {number} temperature - 温度值
     * @returns {boolean} 是否有效
     */
    static validateTemperature(temperature) {
        return this.validateRange(temperature, 0, 1);
    }

    /**
     * 验证电子邮件格式
     * @param {string} email - 邮箱地址
     * @returns {boolean} 是否有效
     */
    static validateEmail(email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    }

    /**
     * 验证URL格式
     * @param {string} url - URL地址
     * @returns {boolean} 是否有效
     */
    static validateUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
} 
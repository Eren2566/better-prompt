import { StorageManager } from '../utils/storage.js';

/**
 * 优化模板管理器
 */
export class TemplateManager {
    constructor() {
        this.activeTemplate = 'default';
        this.customPrompt = '';
        this.loadFromStorage();
    }

    /**
     * 预定义优化模板
     */
    prompts = {
        default: `作为 Prompt 优化专家，请基于以下「用户原始输入」重写生成一个高质量、目标明确的 Prompt。核心要求:
1. **深度理解与提炼**: 精准捕捉用户的核心意图与深层需求，去除模糊或冗余表述。
2. **明确任务目标**: 清晰定义 AI 需要完成的具体任务。
3. **补充关键上下文**: 添加必要的背景信息、假设或约束条件，确保 AI 准确理解任务环境。
4. **定义期望输出**: 明确说明期望的输出格式、风格、口吻或结构。
5. **语言精练、逻辑严谨**: 使用准确、无歧义的语言，确保逻辑清晰。
6. **保持原始意图**: 不得扭曲或添加与用户原意无关的信息。
直接输出优化后的 Prompt 内容本身，不要包含任何额外的问候、解释、标题或标记(如"Prompt:")。
Important: Output must start immediately with the rewritten prompt content. Do **NOT** add greetings, explanations, titles, or any extra words before or after the prompt.
Always respond in 中文。`,

        simple: `请将以下「用户原始输入」压缩为一到两句、信息密度极高的AI Prompt。要求:
1. **直击本质**: 仅保留最核心的任务指令和关键约束。
2. **极致精简**: 删除所有非必要的描述、解释、示例和情感色彩。
3. **清晰无歧义**: 确保浓缩后的指令依然准确、易于理解。
只输出最终浓缩后的 Prompt 文本，不附加任何解释。`,

        extended: `请基于以下「用户原始输入」，进行深度分析和结构化重构，生成一份包含以下核心要素的详细 Prompt:
1. **核心目标(Core Objective)**: 明确指出本次任务最根本的目的。
2. **角色与背景 (Role & Context)**: 设定 AI 的角色(如果需要)，并提供完成任务所必需的最小背景信息。
3. **关键指令与步骤(Key Instructions & Steps)**: 按逻辑顺序列出具体的执行要求或思考步骤。
4. **输入信息 (Input Data/Information)**: 说明需要处理的输入类型或具体内容(如有)。
5. **输出要求(Output Requirements)**: 详细定义期望输出的具体格式、结构、风格、语气、长度限制和评估标准。
6. **约束与偏好(Constraints & Preferences)**: 明确任务的限制条件、禁止项或用户的特殊偏好。
确保各要素条理清晰、信息完备且相互关联，能指导 AI精准高效地完成任务。
Important: Output must start immediately with the rewritten prompt content (beginning with "核心目标"). Do **NOT** add greetings, explanations, titles, section numbers (like 1.) unless part of the prompt itself. Use Markdown headers (e.g., ## 核心目标) for structure if appropriate for the target AI, otherwise use clear text labels followed by content.
Always respond in 中文。`
    };

    /**
     * 从存储加载设置
     */
    loadFromStorage() {
        this.activeTemplate = StorageManager.get('activeTemplate', 'default');
        this.customPrompt = StorageManager.get('customPrompt', '');
    }

    /**
     * 保存设置到存储
     */
    saveToStorage() {
        StorageManager.set('activeTemplate', this.activeTemplate);
        StorageManager.set('customPrompt', this.customPrompt);
    }

    /**
     * 设置当前活跃模板
     * @param {string} templateName - 模板名称
     */
    setActive(templateName) {
        if (this.prompts[templateName] || templateName === 'custom') {
            this.activeTemplate = templateName;
            this.saveToStorage();
        }
    }

    /**
     * 获取当前活跃模板名称
     * @returns {string} 模板名称
     */
    getActive() {
        return this.activeTemplate;
    }

    /**
     * 获取当前活跃模板内容
     * @returns {string} 模板内容
     */
    getActiveTemplateContent() {
        // 如果当前选择的是默认模板，但是有自定义指令，则使用自定义指令
        if (this.activeTemplate === 'default' && this.customPrompt && this.customPrompt.trim() !== '') {
            return this.customPrompt;
        }
        
        if (this.activeTemplate === 'custom' && this.customPrompt) {
            return this.customPrompt;
        }
        return this.prompts[this.activeTemplate] || this.prompts.default;
    }

    /**
     * 设置自定义模板
     * @param {string} customPrompt - 自定义提示词模板
     */
    setCustomPrompt(customPrompt) {
        this.customPrompt = customPrompt;
        this.saveToStorage();
    }

    /**
     * 获取自定义模板
     * @returns {string} 自定义模板内容
     */
    getCustomPrompt() {
        return this.customPrompt;
    }

    /**
     * 获取所有可用模板
     * @returns {Object} 模板映射
     */
    getAllTemplates() {
        const templates = { ...this.prompts };
        if (this.customPrompt) {
            templates.custom = this.customPrompt;
        }
        return templates;
    }

    /**
     * 获取模板标签映射
     * @returns {Object} 标签映射
     */
    getTemplateLabels() {
        return {
            default: '默认优化',
            simple: '精简模式',
            extended: '扩展模块',
            custom: '自定义模板'
        };
    }

    /**
     * 验证模板内容
     * @param {string} template - 模板内容
     * @returns {Object} 验证结果
     */
    validateTemplate(template) {
        const result = {
            isValid: true,
            errors: [],
            warnings: []
        };

        if (!template || template.trim().length === 0) {
            result.isValid = false;
            result.errors.push('模板内容不能为空');
        }

        if (template && template.length < 50) {
            result.warnings.push('模板内容可能过于简短');
        }

        if (template && template.length > 5000) {
            result.warnings.push('模板内容可能过长，建议精简');
        }

        // 检查是否包含基本的优化指导
        const hasInstruction = /优化|重写|改进|提升/.test(template);
        if (!hasInstruction) {
            result.warnings.push('模板似乎缺少明确的优化指导');
        }

        return result;
    }

    /**
     * 重置到默认模板
     */
    resetToDefault() {
        this.activeTemplate = 'default';
        this.customPrompt = '';
        this.saveToStorage();
    }

    /**
     * 导出模板配置
     * @returns {Object} 模板配置
     */
    exportConfig() {
        return {
            activeTemplate: this.activeTemplate,
            customPrompt: this.customPrompt,
            exportDate: new Date().toISOString()
        };
    }

    /**
     * 导入模板配置
     * @param {Object} config - 配置对象
     */
    importConfig(config) {
        if (config.activeTemplate) {
            this.activeTemplate = config.activeTemplate;
        }
        if (config.customPrompt) {
            this.customPrompt = config.customPrompt;
        }
        this.saveToStorage();
    }
} 
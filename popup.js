// Task: 插件popup逻辑 - 基于现有app.js代码实现设置功能

/**
 * Chrome扩展存储管理器 - 适配现有StorageManager
 */
class ExtensionStorageManager {
    static async get(key, defaultValue = null) {
        try {
            const result = await chrome.storage.local.get([key]);
            return result[key] !== undefined ? JSON.parse(result[key]) : defaultValue;
        } catch (error) {
            console.warn(`获取存储数据失败: ${key}`, error);
            return defaultValue;
        }
    }

    static async set(key, value) {
        try {
            await chrome.storage.local.set({ [key]: JSON.stringify(value) });
        } catch (error) {
            console.error(`设置存储数据失败: ${key}`, error);
        }
    }

    static async remove(key) {
        try {
            await chrome.storage.local.remove([key]);
        } catch (error) {
            console.error(`删除存储数据失败: ${key}`, error);
        }
    }
}

/**
 * 模板管理器 - 基于现有TemplateManager代码
 */
class PluginTemplateManager {
    constructor() {
        this.activeTemplate = 'default';
        // 从现有templateManager.js复制的模板定义
        this.prompts = {
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
    }

    async loadFromStorage() {
        this.activeTemplate = await ExtensionStorageManager.get('activeTemplate', 'default');
    }

    async saveToStorage() {
        await ExtensionStorageManager.set('activeTemplate', this.activeTemplate);
    }

    setActive(templateName) {
        if (this.prompts[templateName]) {
            this.activeTemplate = templateName;
            this.saveToStorage();
        }
    }

    getActive() {
        return this.activeTemplate;
    }

    getActiveTemplateContent() {
        return this.prompts[this.activeTemplate] || this.prompts.default;
    }
}

/**
 * 插件设置管理器
 */
class PluginSettingsManager {
    constructor() {
        this.templateManager = new PluginTemplateManager();
        this.elements = this.initializeElements();
        this.settings = {
            apiKey: '',
            model: 'gemini-2.5-pro-preview-06-05',
            strength: 'medium',
            temperature: 0.5,
            thinkingMode: false,
            thinkingBudget: 8000,
            triggerKey: 'space3'
        };
        
        this.init();
    }

    initializeElements() {
        return {
            // API相关
            apiKeyInput: document.getElementById('apiKeyInput'),
            saveApiKeyBtn: document.getElementById('saveApiKeyBtn'),
            apiStatus: document.getElementById('apiStatus'),
            statusMessage: document.getElementById('statusMessage'),
            
            // 模板相关
            templateButtons: document.querySelectorAll('.template-btn'),
            
            // 设置相关
            modelSelect: document.getElementById('modelSelect'),
            strengthSelect: document.getElementById('strengthSelect'),
            thinkingModeToggle: document.getElementById('thinkingModeToggle'),
            thinkingDepthContainer: document.getElementById('thinkingDepthContainer'),
            thinkingBudgetSlider: document.getElementById('thinkingBudgetSlider'),
            thinkingBudgetValue: document.getElementById('thinkingBudgetValue'),
            
            // 快捷键相关
            triggerKeySelect: document.getElementById('triggerKeySelect'),
            triggerDescription: document.getElementById('triggerDescription'),
            triggerKeyHint: document.getElementById('triggerKeyHint'),
            
            // 跳转按钮
            openWebAppBtn: document.getElementById('openWebAppBtn')
        };
    }

    async init() {
        await this.loadSettings();
        this.initializeEventListeners();
        this.updateUI();
    }

    // 基于app.js的事件监听器初始化
    initializeEventListeners() {
        // API Key保存
        this.elements.saveApiKeyBtn?.addEventListener('click', () => this.saveApiKey());
        
        // 模板选择 - 基于app.js的handleTemplateSelection
        this.elements.templateButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleTemplateSelection(e));
        });
        
        // 模型选择
        this.elements.modelSelect?.addEventListener('change', () => this.saveSettings());
        
        // 优化强度选择
        this.elements.strengthSelect?.addEventListener('change', () => this.saveSettings());
        
        // 思考模式开关 - 基于app.js的思考模式处理
        this.elements.thinkingModeToggle?.addEventListener('change', () => {
            this.updateThinkingDepthVisibility();
            this.saveSettings();
        });
        
        // 思考深度滑块 - 基于app.js的思考深度处理
        this.elements.thinkingBudgetSlider?.addEventListener('input', () => {
            this.updateThinkingBudgetDisplay();
            this.saveSettings();
        });
        
        // 快捷键选择
        this.elements.triggerKeySelect?.addEventListener('change', () => {
            this.updateTriggerDescription();
            this.saveSettings();
        });
        
        // 跳转到完整版应用
        this.elements.openWebAppBtn?.addEventListener('click', () => {
            this.openWebApplication();
        });
    }
    
    // 打开完整版Web应用
    openWebApplication() {
        // 完整版Web应用的部署URL
        // 🚨 部署后请将此URL替换为您的实际Vercel部署地址
        // const webAppUrl = 'https://www.youware.com/project/5m746mel5w?enter_from=upload';
        const webAppUrl = 'https://better-prompt7.vercel.app/';
        
        // 在新标签页中打开完整版应用
        chrome.tabs.create({
            url: webAppUrl,
            active: true
        });
        
        // 关闭当前popup
        window.close();
    }

    // 基于app.js的模板选择处理
    handleTemplateSelection(e) {
        const templateName = e.currentTarget.dataset.template;
        
        // 更新UI状态
        this.elements.templateButtons.forEach(btn => btn.classList.remove('active'));
        e.currentTarget.classList.add('active');
        
        // 更新模板管理器
        this.templateManager.setActive(templateName);
        
        this.saveSettings();
    }

    // 基于app.js的思考深度可见性更新
    updateThinkingDepthVisibility() {
        const isThinkingEnabled = this.elements.thinkingModeToggle?.checked;
        if (this.elements.thinkingDepthContainer) {
            this.elements.thinkingDepthContainer.classList.toggle('hidden', !isThinkingEnabled);
        }
    }

    // 基于app.js的思考深度显示更新
    updateThinkingBudgetDisplay() {
        const value = this.elements.thinkingBudgetSlider?.value || 0;
        if (this.elements.thinkingBudgetValue) {
            this.elements.thinkingBudgetValue.textContent = value;
        }
    }

    // 更新快捷键描述
    updateTriggerDescription() {
        const triggerKey = this.elements.triggerKeySelect?.value || 'space3';
        const descriptions = {
            'space3': '在输入框中连击三下空格键即可触发提示词优化',
            'enter3': '在输入框中连击三下回车键即可触发提示词优化',
            'tab3': '在输入框中连击三下Tab键即可触发提示词优化',
            'semicolon3': '在输入框中连击三下分号键(;)即可触发提示词优化',
            'ctrl+space': '在输入框中按下Ctrl+空格键即可触发提示词优化',
            'alt+space': '在输入框中按下Alt+空格键即可触发提示词优化',
            'ctrl+enter': '在输入框中按下Ctrl+回车键即可触发提示词优化'
        };
        
        const hints = {
            'space3': '连击三下空格键',
            'enter3': '连击三下回车键',
            'tab3': '连击三下Tab键',
            'semicolon3': '连击三下分号键(;)',
            'ctrl+space': '按Ctrl+空格键',
            'alt+space': '按Alt+空格键',
            'ctrl+enter': '按Ctrl+回车键'
        };
        
        if (this.elements.triggerDescription) {
            this.elements.triggerDescription.textContent = descriptions[triggerKey] || descriptions['space3'];
        }
        
        if (this.elements.triggerKeyHint) {
            this.elements.triggerKeyHint.textContent = hints[triggerKey] || hints['space3'];
        }
    }

    async saveApiKey() {
        const apiKey = this.elements.apiKeyInput?.value?.trim();
        
        if (!apiKey) {
            this.showStatus('请输入API Key', 'error');
            return;
        }

        // 基于app.js的API Key验证逻辑
        if (!this.validateApiKey(apiKey)) {
            this.showStatus('API Key格式无效', 'error');
            return;
        }

        try {
            await ExtensionStorageManager.set('apiKey_gemini', apiKey);
            this.settings.apiKey = apiKey;
            this.updateApiStatus(true);
            this.showStatus('API Key保存成功', 'success');
        } catch (error) {
            console.error('保存API Key失败:', error);
            this.showStatus('保存失败', 'error');
        }
    }

    // 基于validators.js的API Key验证
    validateApiKey(apiKey) {
        if (!apiKey || typeof apiKey !== 'string') return false;
        // Gemini API Key格式验证
        return /^AIza[0-9A-Za-z_-]{35}$/.test(apiKey.trim());
    }

    async loadSettings() {
        try {
            // 加载API Key
            this.settings.apiKey = await ExtensionStorageManager.get('apiKey_gemini', '');
            
            // 加载其他设置 - 基于app.js的loadSettings方法
            this.settings.model = await ExtensionStorageManager.get('selectedModel', 'gemini-2.5-pro-preview-06-05');
            this.settings.strength = await ExtensionStorageManager.get('optimizationStrength', 'medium');
            this.settings.temperature = await ExtensionStorageManager.get('temperature', 0.5);
            this.settings.thinkingMode = await ExtensionStorageManager.get('thinkingMode', false);
            this.settings.thinkingBudget = await ExtensionStorageManager.get('thinkingBudget', 8000);
            this.settings.triggerKey = await ExtensionStorageManager.get('triggerKey', 'space3');
            
            // 加载模板设置
            await this.templateManager.loadFromStorage();
            
        } catch (error) {
            console.error('加载设置失败:', error);
        }
    }

    async saveSettings() {
        try {
            // 保存当前UI状态到设置
            this.settings.model = this.elements.modelSelect?.value || this.settings.model;
            this.settings.strength = this.elements.strengthSelect?.value || this.settings.strength;
            this.settings.thinkingMode = this.elements.thinkingModeToggle?.checked || false;
            this.settings.thinkingBudget = parseInt(this.elements.thinkingBudgetSlider?.value) || 8000;
            this.settings.triggerKey = this.elements.triggerKeySelect?.value || this.settings.triggerKey;
            
            // 保存到存储 - 使用与app.js相同的键名
            await ExtensionStorageManager.set('selectedModel', this.settings.model);
            await ExtensionStorageManager.set('optimizationStrength', this.settings.strength);
            await ExtensionStorageManager.set('thinkingMode', this.settings.thinkingMode);
            await ExtensionStorageManager.set('thinkingBudget', this.settings.thinkingBudget);
            await ExtensionStorageManager.set('triggerKey', this.settings.triggerKey);
            
            // 保存模板设置
            await this.templateManager.saveToStorage();
            
            console.log('设置已保存:', this.settings);
        } catch (error) {
            console.error('保存设置失败:', error);
        }
    }

    updateUI() {
        // 更新API Key输入框
        if (this.elements.apiKeyInput && this.settings.apiKey) {
            this.elements.apiKeyInput.value = this.settings.apiKey;
        }
        
        // 更新API状态
        this.updateApiStatus(!!this.settings.apiKey);
        
        // 更新模型选择
        if (this.elements.modelSelect) {
            this.elements.modelSelect.value = this.settings.model;
        }
        
        // 更新优化强度
        if (this.elements.strengthSelect) {
            this.elements.strengthSelect.value = this.settings.strength;
        }
        
        // 更新思考模式
        if (this.elements.thinkingModeToggle) {
            this.elements.thinkingModeToggle.checked = this.settings.thinkingMode;
        }
        
        // 更新思考深度
        if (this.elements.thinkingBudgetSlider) {
            this.elements.thinkingBudgetSlider.value = this.settings.thinkingBudget;
        }
        
        // 更新快捷键选择
        if (this.elements.triggerKeySelect) {
            this.elements.triggerKeySelect.value = this.settings.triggerKey;
        }
        
        // 更新模板按钮状态
        this.updateTemplateButtons();
        
        // 更新思考模式相关UI
        this.updateThinkingDepthVisibility();
        this.updateThinkingBudgetDisplay();
        
        // 更新快捷键描述
        this.updateTriggerDescription();
    }

    updateTemplateButtons() {
        const activeTemplate = this.templateManager.getActive();
        this.elements.templateButtons.forEach(button => {
            const isActive = button.dataset.template === activeTemplate;
            button.classList.toggle('active', isActive);
        });
    }

    updateApiStatus(isConnected) {
        if (this.elements.apiStatus) {
            this.elements.apiStatus.className = `status-indicator ${isConnected ? 'status-connected' : 'status-disconnected'}`;
        }
        
        if (this.elements.statusMessage) {
            this.elements.statusMessage.textContent = isConnected ? 
                '配置完成，可以开始使用' : '请配置API Key开始使用';
        }
    }

    showStatus(message, type = 'info') {
        if (this.elements.statusMessage) {
            this.elements.statusMessage.textContent = message;
            this.elements.statusMessage.className = `text-sm ${
                type === 'error' ? 'text-red-600' : 
                type === 'success' ? 'text-green-600' : 'text-gray-600'
            }`;
        }
        
        // 3秒后恢复默认状态
        setTimeout(() => {
            this.updateApiStatus(!!this.settings.apiKey);
        }, 3000);
    }

    // 获取当前设置用于content script
    async getSettings() {
        await this.loadSettings();
        return {
            apiKey: this.settings.apiKey,
            model: this.settings.model,
            strength: this.settings.strength,
            temperature: this.settings.temperature,
            thinkingMode: this.settings.thinkingMode,
            thinkingBudget: this.settings.thinkingBudget,
            triggerKey: this.settings.triggerKey,
            template: this.templateManager.getActiveTemplateContent()
        };
    }
}

// 初始化插件设置管理器
document.addEventListener('DOMContentLoaded', () => {
    window.pluginSettingsManager = new PluginSettingsManager();
});

// 注意：消息处理现在由background.js处理
// popup.js不再直接处理来自content script的消息 
import { ApiService } from './modules/apiService.js';
import { TemplateManager } from './modules/templateManager.js';
import { HistoryManager } from './modules/historyManager.js';
import { StorageManager } from './utils/storage.js';
import { Validators } from './utils/validators.js';

/**
 * Better Prompt 主应用类
 */
class BetterPromptApp {
    constructor() {
        this.apiService = new ApiService();
        this.templateManager = new TemplateManager();
        this.historyManager = new HistoryManager();
        
        this.elements = this.initializeElements();
        this.state = this.initializeState();
        
        this.init();
    }

    /**
     * 初始化DOM元素引用
     */
    initializeElements() {
        return {
            // 输入相关
            originalPrompt: document.getElementById('originalPrompt'),
            charCount: document.getElementById('charCount'),
            exampleButton: document.getElementById('exampleButton'),
            
            // 控制相关
            optimizeButton: document.getElementById('optimizeButton'),
            refineButton: document.getElementById('refineButton'),
            copyButton: document.getElementById('copyButton'),
            formatButton: document.getElementById('formatButton'),
            saveButton: document.getElementById('saveButton'),
            clearButton: document.getElementById('clearButton'),
            
            // 设置相关
            modelSelect: document.getElementById('modelSelect'),
            temperatureSlider: document.getElementById('temperatureSlider'),
            temperatureValue: document.getElementById('temperatureValue'),
            strengthSelect: document.getElementById('strengthSelect'),
            thinkingMode: document.getElementById('thinkingMode'),
            thinkingToggle: document.getElementById('thinkingToggle'),
            
            // 模板相关
            templateTabs: document.getElementById('templateTabs'),
            
            // 结果相关
            optimizedResult: document.getElementById('optimizedResult'),
            charsResult: document.getElementById('charsResult'),
            statsPanel: document.getElementById('statsPanel'),
            
            // 进度相关
            progressBar: document.getElementById('progressBar'),
            progressInner: document.getElementById('progressInner'),
            
            // 模态框相关
            apiKeyModal: document.getElementById('apiKeyModal'),
            apiKeyButton: document.getElementById('apiKeyButton'),
            apiStatus: document.getElementById('apiStatus'),
            providerSelect: document.getElementById('providerSelect'),
            providerLink: document.getElementById('providerLink'),
            apiKeyInput: document.getElementById('apiKeyInput'),
            saveApiKeyButton: document.getElementById('saveApiKeyButton'),
            closeApiKeyModalButton: document.getElementById('closeApiKeyModalButton'),
            cancelApiKeyButton: document.getElementById('cancelApiKeyButton'),
            
            // 历史记录相关
            historyModal: document.getElementById('historyModal'),
            historyToggle: document.getElementById('historyToggle'),
            historyList: document.getElementById('historyList'),
            historyBadge: document.getElementById('historyBadge'),
            exportHistoryButton: document.getElementById('exportHistoryButton'),
            importHistoryButton: document.getElementById('importHistoryButton'),
            importFileInput: document.getElementById('importFileInput'),
            clearHistoryButton: document.getElementById('clearHistoryButton'),
            closeHistoryButton: document.getElementById('closeHistoryButton'),
            closeHistoryModalButton: document.getElementById('closeHistoryModalButton'),
            
            // 高级设置相关
            advancedSettingsModal: document.getElementById('advancedSettingsModal'),
            advancedSettingsButton: document.getElementById('advancedSettingsButton'),
            closeSettingsModalButton: document.getElementById('closeSettingsModalButton'),
            saveSettingsButton: document.getElementById('saveSettingsButton'),
            customPrompt: document.getElementById('customPrompt'),
            saveCustomPrompt: document.getElementById('saveCustomPrompt'),
            enableMultiRound: document.getElementById('enableMultiRound'),
            roundCount: document.getElementById('roundCount'),
            roundCountValue: document.getElementById('roundCountValue'),
            optimizationDepth: document.getElementById('optimizationDepth'),
            maxRetries: document.getElementById('maxRetries'),
            timeout: document.getElementById('timeout'),
            
            // 主题相关
            themeToggle: document.getElementById('themeToggle'),
            
            // 通知相关
            toast: document.getElementById('toast'),
            toastMessage: document.getElementById('toastMessage')
        };
    }

    /**
     * 初始化应用状态
     */
    initializeState() {
        return {
            isOptimizing: false,
            currentProvider: StorageManager.get('currentProvider', 'gemini'),
            thinkingMode: StorageManager.get('thinkingMode', false),
            multiRoundSettings: StorageManager.get('multiRoundSettings', {
                enabled: false,
                rounds: 3,
                depth: 'moderate'
            }),
            errorHandlingSettings: StorageManager.get('errorHandlingSettings', {
                maxRetries: 3,
                timeout: 30
            })
        };
    }

    /**
     * 初始化应用
     */
    init() {
        this.initializeTheme();
        this.initializeApiProvider();
        this.initializeEventListeners();
        this.updateUI();
        this.loadSettings();
        
        // 设置焦点
        if (this.elements.originalPrompt) {
            this.elements.originalPrompt.focus();
        }
        
        console.log('Better Prompt 应用已初始化');
    }

    /**
     * 初始化主题
     */
    initializeTheme() {
        const savedDarkMode = StorageManager.get('darkMode', null);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const shouldBeDark = savedDarkMode !== null ? savedDarkMode : prefersDark;

        document.body.classList.toggle('dark-mode', shouldBeDark);
        this.updateThemeIcon(shouldBeDark);
    }

    /**
     * 初始化API提供商
     */
    initializeApiProvider() {
        // 加载API Key
        const providers = this.apiService.getProviders();
        for (const [provider, config] of Object.entries(providers)) {
            const apiKey = StorageManager.get(`apiKey_${provider}`, '');
            if (apiKey) {
                try {
                    this.apiService.setApiKey(provider, apiKey);
                } catch (error) {
                    console.warn(`加载 ${provider} API Key 失败:`, error);
                }
            }
        }

        // 设置当前提供商
        this.apiService.setProvider(this.state.currentProvider);
        this.updateProviderUI();
        this.updateApiStatus();
    }

    /**
     * 初始化事件监听器
     */
    initializeEventListeners() {
        // 输入事件
        if (this.elements.originalPrompt) {
            this.elements.originalPrompt.addEventListener('input', () => this.updateCharCount());
        }
        if (this.elements.exampleButton) {
            this.elements.exampleButton.addEventListener('click', () => this.showExample());
        }

        // 控制按钮事件
        if (this.elements.optimizeButton) {
            this.elements.optimizeButton.addEventListener('click', () => this.optimizePrompt());
        }
        if (this.elements.refineButton) {
            this.elements.refineButton.addEventListener('click', () => this.refinePrompt());
        }
        if (this.elements.copyButton) {
            this.elements.copyButton.addEventListener('click', () => this.copyResult());
        }
        if (this.elements.formatButton) {
            this.elements.formatButton.addEventListener('click', () => this.formatResult());
        }
        if (this.elements.saveButton) {
            this.elements.saveButton.addEventListener('click', () => this.saveResult());
        }
        if (this.elements.clearButton) {
            this.elements.clearButton.addEventListener('click', () => this.clearResult());
        }

        // 设置事件
        if (this.elements.temperatureSlider) {
            this.elements.temperatureSlider.addEventListener('input', () => this.updateTemperatureDisplay());
        }
        if (this.elements.modelSelect) {
            this.elements.modelSelect.addEventListener('change', () => this.updateModelSelection());
        }
        if (this.elements.thinkingMode) {
            this.elements.thinkingMode.addEventListener('change', () => this.updateThinkingMode());
        }

        // 模板选择事件
        if (this.elements.templateTabs) {
            this.elements.templateTabs.addEventListener('click', (e) => this.handleTemplateSelection(e));
        }

        // API Key 相关事件
        if (this.elements.apiKeyButton) {
            this.elements.apiKeyButton.addEventListener('click', () => this.openApiKeyModal());
        }
        if (this.elements.providerSelect) {
            this.elements.providerSelect.addEventListener('change', () => this.updateProviderSelection());
        }
        if (this.elements.saveApiKeyButton) {
            this.elements.saveApiKeyButton.addEventListener('click', () => this.saveApiKey());
        }
        if (this.elements.closeApiKeyModalButton) {
            this.elements.closeApiKeyModalButton.addEventListener('click', () => this.closeApiKeyModal());
        }
        if (this.elements.cancelApiKeyButton) {
            this.elements.cancelApiKeyButton.addEventListener('click', () => this.closeApiKeyModal());
        }

        // 历史记录事件
        if (this.elements.historyToggle) {
            this.elements.historyToggle.addEventListener('click', () => this.openHistoryModal());
        }
        if (this.elements.exportHistoryButton) {
            this.elements.exportHistoryButton.addEventListener('click', () => this.exportHistory());
        }
        if (this.elements.importHistoryButton) {
            this.elements.importHistoryButton.addEventListener('click', () => this.importHistory());
        }
        if (this.elements.importFileInput) {
            this.elements.importFileInput.addEventListener('change', (e) => this.handleHistoryImport(e));
        }
        if (this.elements.clearHistoryButton) {
            this.elements.clearHistoryButton.addEventListener('click', () => this.clearHistory());
        }
        if (this.elements.closeHistoryButton) {
            this.elements.closeHistoryButton.addEventListener('click', () => this.closeHistoryModal());
        }
        if (this.elements.closeHistoryModalButton) {
            this.elements.closeHistoryModalButton.addEventListener('click', () => this.closeHistoryModal());
        }

        // 高级设置事件
        if (this.elements.advancedSettingsButton) {
            this.elements.advancedSettingsButton.addEventListener('click', () => this.openAdvancedSettings());
        }
        if (this.elements.saveSettingsButton) {
            this.elements.saveSettingsButton.addEventListener('click', () => this.saveAdvancedSettings());
        }
        if (this.elements.closeSettingsModalButton) {
            this.elements.closeSettingsModalButton.addEventListener('click', () => this.closeAdvancedSettings());
        }
        if (this.elements.saveCustomPrompt) {
            this.elements.saveCustomPrompt.addEventListener('click', () => this.saveCustomPrompt());
        }
        if (this.elements.roundCount) {
            this.elements.roundCount.addEventListener('input', () => this.updateRoundCountDisplay());
        }

        // 主题切换事件
        if (this.elements.themeToggle) {
            this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // 模态框关闭事件
        if (this.elements.apiKeyModal) {
            this.elements.apiKeyModal.addEventListener('click', (e) => {
                if (e.target === this.elements.apiKeyModal) this.closeApiKeyModal();
            });
        }
        if (this.elements.historyModal) {
            this.elements.historyModal.addEventListener('click', (e) => {
                if (e.target === this.elements.historyModal) this.closeHistoryModal();
            });
        }
        if (this.elements.advancedSettingsModal) {
            this.elements.advancedSettingsModal.addEventListener('click', (e) => {
                if (e.target === this.elements.advancedSettingsModal) this.closeAdvancedSettings();
            });
        }

        // 折叠面板事件
        document.querySelectorAll('.accordion-header').forEach(header => {
            header.addEventListener('click', () => {
                header.parentElement.classList.toggle('active');
            });
        });

        // 键盘快捷键
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    /**
     * 更新UI显示
     */
    updateUI() {
        this.updateCharCount();
        this.updateResultStats('');
        this.updateHistoryBadge();
        this.updateTemplateButtons();
        this.updateTemperatureDisplay();
    }

    /**
     * 加载设置
     */
    loadSettings() {
        // 加载高级设置
        if (this.elements.customPrompt) {
            this.elements.customPrompt.value = this.templateManager.getCustomPrompt();
        }
        if (this.elements.enableMultiRound) {
            this.elements.enableMultiRound.checked = this.state.multiRoundSettings.enabled;
        }
        if (this.elements.roundCount) {
            this.elements.roundCount.value = this.state.multiRoundSettings.rounds;
        }
        if (this.elements.optimizationDepth) {
            this.elements.optimizationDepth.value = this.state.multiRoundSettings.depth;
        }
        if (this.elements.maxRetries) {
            this.elements.maxRetries.value = this.state.errorHandlingSettings.maxRetries;
        }
        if (this.elements.timeout) {
            this.elements.timeout.value = this.state.errorHandlingSettings.timeout;
        }
        if (this.elements.thinkingMode) {
            this.elements.thinkingMode.checked = this.state.thinkingMode;
        }
        
        this.updateRoundCountDisplay();
        
        // 应用设置到API服务
        this.apiService.setConfig(this.state.errorHandlingSettings);
    }

    /**
     * 更新字符计数
     */
    updateCharCount() {
        if (!this.elements.originalPrompt || !this.elements.charCount) return;
        
        const count = this.elements.originalPrompt.value.length;
        this.elements.charCount.textContent = count;
    }

    /**
     * 更新结果统计
     */
    updateResultStats(text) {
        if (!this.elements.charsResult || !this.elements.statsPanel) return;
        
        if (!text || !text.trim()) {
            this.elements.charsResult.textContent = '0';
            this.elements.statsPanel.classList.add('invisible');
            return;
        }
        
        this.elements.charsResult.textContent = text.length;
        this.elements.statsPanel.classList.remove('invisible');
    }

    /**
     * 更新历史记录徽章
     */
    updateHistoryBadge() {
        if (!this.elements.historyBadge) return;
        
        const hasHistory = this.historyManager.getAll().length > 0;
        this.elements.historyBadge.classList.toggle('hidden', !hasHistory);
    }

    /**
     * 更新模板按钮状态
     */
    updateTemplateButtons() {
        const activeTemplate = this.templateManager.getActive();
        
        document.querySelectorAll('.template-tab-button').forEach(button => {
            button.classList.remove('active');
        });
        
        const activeButton = document.querySelector(`[data-template="${activeTemplate}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
    }

    /**
     * 更新温度显示
     */
    updateTemperatureDisplay() {
        if (!this.elements.temperatureSlider || !this.elements.temperatureValue) return;
        
        const value = parseFloat(this.elements.temperatureSlider.value);
        let text = '';
        
        if (value <= 0.2) text = '精确';
        else if (value <= 0.4) text = '较精确';
        else if (value <= 0.6) text = '平衡';
        else if (value <= 0.8) text = '较有创意';
        else text = '极富创意';
        
        this.elements.temperatureValue.textContent = text;
    }

    /**
     * 更新轮数显示
     */
    updateRoundCountDisplay() {
        if (!this.elements.roundCount || !this.elements.roundCountValue) return;
        
        this.elements.roundCountValue.textContent = this.elements.roundCount.value;
    }

    /**
     * 更新思考模式
     */
    updateThinkingMode() {
        if (!this.elements.thinkingMode) return;
        
        this.state.thinkingMode = this.elements.thinkingMode.checked;
        StorageManager.set('thinkingMode', this.state.thinkingMode);
        
        // 显示状态提示
        const statusText = this.state.thinkingMode ? '已启用思考模式，响应时间会更长但分析更深入' : '已关闭思考模式';
        this.showToast(statusText);
    }

    /**
     * 更新提供商UI
     */
    updateProviderUI() {
        const providers = this.apiService.getProviders();
        const currentProvider = this.apiService.currentProvider;
        
        // 更新提供商选择器
        if (this.elements.providerSelect) {
            this.elements.providerSelect.value = currentProvider;
        }
        
        // 更新链接
        if (this.elements.providerLink) {
            this.elements.providerLink.href = providers[currentProvider].signupUrl;
        }
        
        // 更新模型选择器
        this.updateModelOptions();
    }

    /**
     * 更新模型选项
     */
    updateModelOptions() {
        if (!this.elements.modelSelect) return;
        
        const providers = this.apiService.getProviders();
        const currentProvider = this.apiService.currentProvider;
        const models = providers[currentProvider].models;
        
        this.elements.modelSelect.innerHTML = '';
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            option.textContent = model.name;
            this.elements.modelSelect.appendChild(option);
        });
        
        // 设置默认选中
        if (models.length > 0) {
            this.elements.modelSelect.value = models[Math.min(1, models.length - 1)].id;
        }
    }

    /**
     * 更新API状态
     */
    updateApiStatus() {
        if (!this.elements.apiStatus) return;
        
        const hasApiKey = !!this.apiService.getCurrentApiKey();
        this.elements.apiStatus.className = 'api-indicator';
        this.elements.apiStatus.classList.add(hasApiKey ? 'active' : 'inactive');
    }

    /**
     * 优化提示词
     */
    async optimizePrompt() {
        if (!this.elements.originalPrompt) return;
        
        const promptText = this.elements.originalPrompt.value.trim();
        
        if (!promptText) {
            this.highlightEmptyInput();
            this.showToast('请输入要优化的提示词', true);
            return;
        }

        const validation = Validators.validateText(promptText, { maxLength: 50000 });
        if (!validation.isValid) {
            this.showToast(validation.errors.join(', '), true);
            return;
        }

        if (!this.apiService.getCurrentApiKey()) {
            this.showToast('请先配置 API Key', true);
            this.openApiKeyModal();
            return;
        }

        this.state.isOptimizing = true;
        this.setLoadingState(true);

        try {
            const options = {
                template: this.templateManager.getActiveTemplateContent(),
                model: this.elements.modelSelect ? this.elements.modelSelect.value : '',
                temperature: this.elements.temperatureSlider ? parseFloat(this.elements.temperatureSlider.value) : 0.5,
                strength: this.elements.strengthSelect ? this.elements.strengthSelect.value : 'medium',
                multiRound: this.state.multiRoundSettings.enabled ? this.state.multiRoundSettings : null,
                thinkingMode: this.state.thinkingMode
            };

            this.updateProgress(20);
            
            const optimizedText = await this.apiService.optimizePrompt(promptText, options);
            
            this.updateProgress(100);
            
            if (this.elements.optimizedResult) {
                // 直接显示优化结果，不自动格式化
                this.elements.optimizedResult.textContent = optimizedText;
            }
            
            this.updateResultStats(optimizedText);
            
            if (this.elements.refineButton) {
                this.elements.refineButton.classList.remove('hidden');
            }

            // 添加到历史记录
            this.historyManager.addEntry(promptText, optimizedText, {
                template: this.templateManager.getActive(),
                model: this.elements.modelSelect ? this.elements.modelSelect.value : '',
                temperature: this.elements.temperatureSlider ? parseFloat(this.elements.temperatureSlider.value) : 0.5,
                strength: this.elements.strengthSelect ? this.elements.strengthSelect.value : 'medium',
                provider: this.apiService.currentProvider,
                thinkingMode: this.state.thinkingMode
            });

            this.updateHistoryBadge();
            this.showToast('提示词优化完成！');

        } catch (error) {
            console.error('优化失败:', error);
            if (this.elements.optimizedResult) {
                this.elements.optimizedResult.textContent = `优化过程中发生错误: ${error.message}`;
            }
            this.showToast(`错误: ${error.message}`, true);
        } finally {
            this.state.isOptimizing = false;
            this.setLoadingState(false);
        }
    }

    /**
     * 设置加载状态
     */
    setLoadingState(isLoading) {
        if (!this.elements.optimizeButton) return;
        
        const spinner = this.elements.optimizeButton.querySelector('.spinner');
        const icon = this.elements.optimizeButton.querySelector('.btn-icon');
        const text = this.elements.optimizeButton.querySelector('span');
        
        if (isLoading) {
            if (spinner) spinner.classList.remove('hidden');
            if (icon) icon.classList.add('hidden');
            if (text) text.textContent = '优化中...';
            this.elements.optimizeButton.disabled = true;
            if (this.elements.progressBar) {
                this.elements.progressBar.style.display = 'block';
            }
        } else {
            if (spinner) spinner.classList.add('hidden');
            if (icon) icon.classList.remove('hidden');
            if (text) text.textContent = '优化提示词';
            this.elements.optimizeButton.disabled = false;
            if (this.elements.progressBar) {
                this.elements.progressBar.style.display = 'none';
            }
            if (this.elements.progressInner) {
                this.elements.progressInner.style.width = '0%';
            }
        }
    }

    /**
     * 更新进度
     */
    updateProgress(percent) {
        if (this.elements.progressInner) {
            this.elements.progressInner.style.width = `${percent}%`;
        }
    }

    /**
     * 显示示例
     */
    showExample() {
        if (!this.elements.originalPrompt) return;
        
        this.elements.originalPrompt.value = "介绍一种创新的市场营销策略，适用于初创科技公司推广其SaaS产品。";
        this.updateCharCount();
        this.showToast("已插入示例提示词");
    }

    /**
     * 再次优化
     */
    refinePrompt() {
        if (!this.elements.optimizedResult || !this.elements.originalPrompt) return;
        
        const currentResult = this.elements.optimizedResult.textContent;
        if (!currentResult.trim()) return;
        
        this.elements.originalPrompt.value = currentResult;
        this.elements.optimizedResult.textContent = '';
        this.updateCharCount();
        this.showToast("再次优化...");
        
        setTimeout(() => this.optimizePrompt(), 100);
    }

    /**
     * 复制结果
     */
    async copyResult() {
        if (!this.elements.optimizedResult) return;
        
        const textToCopy = this.elements.optimizedResult.textContent;
        if (!textToCopy) {
            this.showToast('没有内容可复制');
            return;
        }

        try {
            await navigator.clipboard.writeText(textToCopy);
            this.showToast('结果已复制到剪贴板！');
        } catch (error) {
            // 回退方案
            const tempTextArea = document.createElement('textarea');
            tempTextArea.value = textToCopy;
            document.body.appendChild(tempTextArea);
            tempTextArea.select();
            
            try {
                document.execCommand('copy');
                this.showToast('结果已复制到剪贴板！');
            } catch (execError) {
                this.showToast('复制失败，请手动复制', true);
            }
            
            document.body.removeChild(tempTextArea);
        }
    }

    /**
     * 格式化优化后的文本 - 自动在合适位置换行
     * @param {string} text - 待格式化的文本
     * @returns {string} 格式化后的文本
     */
    formatOptimizedText(text) {
        if (!text || typeof text !== 'string') return '';
        
        // 清理多余空格
        text = text.replace(/\s+/g, ' ').trim();
        
        // 在标点符号后添加适当的换行
        text = text.replace(/([。！？])\s*/g, '$1\n\n'); // 中文句号后换行
        text = text.replace(/([.!?])\s*([A-Z])/g, '$1\n\n$2'); // 英文句号后换行
        text = text.replace(/([；;])\s*/g, '$1\n'); // 分号后换行
        text = text.replace(/([：:])\s*([^\n])/g, '$1\n$2'); // 冒号后可能换行
        
        // 处理列表项格式
        text = text.replace(/(\d+\.|[•\-\*])\s*/g, '\n$1 '); // 数字列表和符号列表
        
        // 处理段落标记
        text = text.replace(/(核心目标|角色与背景|关键指令|输入信息|输出要求|约束与偏好)/g, '\n\n## $1\n');
        
        // 清理多余的换行
        text = text.replace(/\n{3,}/g, '\n\n');
        text = text.replace(/^\n+/, '');
        
        return text;
    }

    /**
     * 格式化结果
     */
    formatResult() {
        if (!this.elements.optimizedResult) return;
        
        let text = this.elements.optimizedResult.textContent || '';
        if (!text.trim()) {
            this.showToast('没有内容可格式化');
            return;
        }
        
        const formattedText = this.formatOptimizedText(text);
        this.elements.optimizedResult.textContent = formattedText;
        this.updateResultStats(formattedText);
        this.showToast('提示词格式已规范化！');
    }

    /**
     * 保存结果
     */
    saveResult() {
        if (!this.elements.originalPrompt || !this.elements.optimizedResult) return;
        
        const original = this.elements.originalPrompt.value;
        const optimized = this.elements.optimizedResult.textContent;
        
        if (!optimized.trim()) {
            this.showToast('没有结果可保存');
            return;
        }
        
        this.historyManager.addEntry(original, optimized, {
            template: this.templateManager.getActive(),
            model: this.elements.modelSelect ? this.elements.modelSelect.value : '',
            temperature: this.elements.temperatureSlider ? parseFloat(this.elements.temperatureSlider.value) : 0.5,
            strength: this.elements.strengthSelect ? this.elements.strengthSelect.value : 'medium',
            provider: this.apiService.currentProvider
        });
        
        this.updateHistoryBadge();
        this.showToast('提示词版本已保存！');
    }

    /**
     * 清除结果
     */
    clearResult() {
        if (this.elements.originalPrompt) {
            this.elements.originalPrompt.value = '';
        }
        if (this.elements.optimizedResult) {
            this.elements.optimizedResult.textContent = '';
        }
        
        this.updateCharCount();
        this.updateResultStats('');
        
        if (this.elements.originalPrompt) {
            this.elements.originalPrompt.focus();
        }
        if (this.elements.refineButton) {
            this.elements.refineButton.classList.add('hidden');
        }
    }

    /**
     * 高亮空输入
     */
    highlightEmptyInput() {
        if (!this.elements.originalPrompt) return;
        
        this.elements.originalPrompt.classList.add('!border-red-500', 'ring-2', 'ring-red-500/30');
        setTimeout(() => {
            this.elements.originalPrompt.classList.remove('!border-red-500', 'ring-2', 'ring-red-500/30');
        }, 2000);
    }

    /**
     * 显示通知
     */
    showToast(message, isError = false) {
        if (!this.elements.toast || !this.elements.toastMessage) return;
        
        this.elements.toastMessage.textContent = message;
        this.elements.toast.className = 'toast';
        if (isError) this.elements.toast.classList.add('error');
        this.elements.toast.classList.add('visible');
        
        clearTimeout(this.toastTimeout);
        this.toastTimeout = setTimeout(() => {
            this.elements.toast.classList.remove('visible');
        }, isError ? 4000 : 3000);
    }

    /**
     * 处理模板选择
     */
    handleTemplateSelection(e) {
        const button = e.target.closest('.template-tab-button');
        if (!button) return;
        
        const templateName = button.dataset.template;
        this.templateManager.setActive(templateName);
        this.updateTemplateButtons();
    }

    /**
     * 切换主题
     */
    toggleTheme() {
        const isDarkMode = document.body.classList.toggle('dark-mode');
        this.updateThemeIcon(isDarkMode);
        StorageManager.set('darkMode', isDarkMode);
    }

    /**
     * 更新主题图标
     */
    updateThemeIcon(isDarkMode) {
        if (!this.elements.themeToggle) return;
        
        const icon = this.elements.themeToggle.querySelector('i');
        if (icon) {
            icon.className = `fa-solid ${isDarkMode ? 'fa-sun' : 'fa-moon'}`;
        }
    }

    /**
     * 打开API Key模态框
     */
    openApiKeyModal() {
        if (!this.elements.apiKeyModal) return;
        
        const currentProvider = this.apiService.currentProvider;
        const apiKey = StorageManager.get(`apiKey_${currentProvider}`, '');
        
        if (this.elements.providerSelect) {
            this.elements.providerSelect.value = currentProvider;
        }
        if (this.elements.apiKeyInput) {
            this.elements.apiKeyInput.value = apiKey;
        }
        
        this.updateProviderSelection();
        this.elements.apiKeyModal.classList.add('active');
        
        setTimeout(() => {
            if (this.elements.apiKeyInput) this.elements.apiKeyInput.focus();
        }, 100);
    }

    /**
     * 关闭API Key模态框
     */
    closeApiKeyModal() {
        if (this.elements.apiKeyModal) {
            this.elements.apiKeyModal.classList.remove('active');
        }
    }

    /**
     * 更新提供商选择
     */
    updateProviderSelection() {
        if (!this.elements.providerSelect || !this.elements.providerLink) return;
        
        const provider = this.elements.providerSelect.value;
        const providers = this.apiService.getProviders();
        
        this.elements.providerLink.href = providers[provider].signupUrl;
        
        // 加载对应的API Key
        const apiKey = StorageManager.get(`apiKey_${provider}`, '');
        if (this.elements.apiKeyInput) {
            this.elements.apiKeyInput.value = apiKey;
        }
    }

    /**
     * 保存API Key
     */
    saveApiKey() {
        if (!this.elements.providerSelect || !this.elements.apiKeyInput) return;
        
        const provider = this.elements.providerSelect.value;
        const apiKey = this.elements.apiKeyInput.value.trim();
        
        if (!apiKey) {
            this.showToast('API Key 不能为空！', true);
            return;
        }

        if (!Validators.validateApiKey(apiKey, provider)) {
            this.showToast('API Key 格式不正确！', true);
            return;
        }

        try {
            this.apiService.setApiKey(provider, apiKey);
            this.apiService.setProvider(provider);
            
            StorageManager.set(`apiKey_${provider}`, apiKey);
            StorageManager.set('currentProvider', provider);
            
            this.state.currentProvider = provider;
            this.updateProviderUI();
            this.updateApiStatus();
            
            this.showToast('API Key 已保存！');
            this.closeApiKeyModal();
        } catch (error) {
            this.showToast(error.message, true);
        }
    }

    /**
     * 打开历史记录模态框
     */
    openHistoryModal() {
        if (!this.elements.historyModal) return;
        
        this.updateHistoryList();
        this.elements.historyModal.classList.add('active');
        if (this.elements.historyBadge) {
            this.elements.historyBadge.classList.add('hidden');
        }
    }

    /**
     * 关闭历史记录模态框
     */
    closeHistoryModal() {
        if (this.elements.historyModal) {
            this.elements.historyModal.classList.remove('active');
        }
    }

    /**
     * 更新历史记录列表
     */
    updateHistoryList() {
        if (!this.elements.historyList) return;
        
        const history = this.historyManager.getAll();
        
        if (history.length === 0) {
            this.elements.historyList.innerHTML = `
                <div class="text-center py-10 text-text-light dark:text-dm-text-secondary">
                    <i class="fa-solid fa-clock-rotate-left text-4xl mb-3 text-cyan-500 dark:text-cyan-400"></i>
                    <p class="text-lg">没有历史记录</p>
                    <p class="text-sm mt-2">所有优化结果将保存在这里</p>
                </div>
            `;
            return;
        }

        const templateLabels = this.templateManager.getTemplateLabels();
        
        const html = history.map((entry, index) => `
            <div class="history-item" data-id="${entry.id}">
                <div class="history-title">
                    <span>${templateLabels[entry.template] || entry.template}</span>
                    <span class="history-date">${entry.timeString}</span>
                </div>
                <div class="history-content">${entry.optimized.length > 100 ? 
                    entry.optimized.substring(0, 100) + '...' : 
                    entry.optimized}</div>
            </div>
        `).join('');

        this.elements.historyList.innerHTML = html;

        // 添加点击事件
        this.elements.historyList.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => {
                const entry = this.historyManager.getById(item.dataset.id);
                if (entry) {
                    if (this.elements.originalPrompt) {
                        this.elements.originalPrompt.value = entry.original;
                    }
                    if (this.elements.optimizedResult) {
                        this.elements.optimizedResult.textContent = entry.optimized;
                    }
                    this.templateManager.setActive(entry.template);
                    
                    // 恢复设置
                    if (entry.model && this.elements.modelSelect) {
                        this.elements.modelSelect.value = entry.model;
                    }
                    if (entry.temperature && this.elements.temperatureSlider) {
                        this.elements.temperatureSlider.value = entry.temperature;
                    }
                    if (entry.strength && this.elements.strengthSelect) {
                        this.elements.strengthSelect.value = entry.strength;
                    }
                    
                    this.updateCharCount();
                    this.updateResultStats(entry.optimized);
                    this.updateTemplateButtons();
                    this.updateTemperatureDisplay();
                    
                    this.closeHistoryModal();
                    this.showToast("历史记录已加载");
                }
            });
        });
    }

    /**
     * 导出历史记录
     */
    exportHistory() {
        const data = this.historyManager.export('json');
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `better-prompt-history-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        this.showToast('历史记录已导出');
    }

    /**
     * 导入历史记录
     */
    importHistory() {
        if (this.elements.importFileInput) {
            this.elements.importFileInput.click();
        }
    }

    /**
     * 处理历史记录导入
     */
    handleHistoryImport(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const result = this.historyManager.import(event.target.result, true);
                if (result.success) {
                    this.updateHistoryList();
                    this.updateHistoryBadge();
                    this.showToast(`成功导入 ${result.count} 条记录`);
                } else {
                    this.showToast(`导入失败: ${result.error}`, true);
                }
            } catch (error) {
                this.showToast('导入文件格式错误', true);
            }
        };
        
        reader.readAsText(file);
        e.target.value = ''; // 清空文件输入
    }

    /**
     * 清除历史记录
     */
    clearHistory() {
        if (confirm('确定要清除所有历史记录吗？此操作无法撤销。')) {
            this.historyManager.clear();
            this.updateHistoryList();
            this.updateHistoryBadge();
            this.showToast("历史记录已清空");
        }
    }

    /**
     * 打开高级设置
     */
    openAdvancedSettings() {
        if (this.elements.advancedSettingsModal) {
            this.elements.advancedSettingsModal.classList.add('active');
        }
    }

    /**
     * 关闭高级设置
     */
    closeAdvancedSettings() {
        if (this.elements.advancedSettingsModal) {
            this.elements.advancedSettingsModal.classList.remove('active');
        }
    }

    /**
     * 保存高级设置
     */
    saveAdvancedSettings() {
        this.state.multiRoundSettings = {
            enabled: this.elements.enableMultiRound ? this.elements.enableMultiRound.checked : false,
            rounds: this.elements.roundCount ? parseInt(this.elements.roundCount.value) : 3,
            depth: this.elements.optimizationDepth ? this.elements.optimizationDepth.value : 'moderate'
        };

        this.state.errorHandlingSettings = {
            maxRetries: this.elements.maxRetries ? parseInt(this.elements.maxRetries.value) : 3,
            timeout: this.elements.timeout ? parseInt(this.elements.timeout.value) : 30
        };

        StorageManager.set('multiRoundSettings', this.state.multiRoundSettings);
        StorageManager.set('errorHandlingSettings', this.state.errorHandlingSettings);

        this.apiService.setConfig(this.state.errorHandlingSettings);
        
        this.showToast('高级设置已保存');
        this.closeAdvancedSettings();
    }

    /**
     * 保存自定义提示词
     */
    saveCustomPrompt() {
        if (!this.elements.customPrompt) return;
        
        const customPrompt = this.elements.customPrompt.value.trim();
        
        const validation = this.templateManager.validateTemplate(customPrompt);
        if (!validation.isValid) {
            this.showToast(validation.errors.join(', '), true);
            return;
        }
        
        this.templateManager.setCustomPrompt(customPrompt);
        this.showToast('自定义优化指令已保存');
        
        if (validation.warnings.length > 0) {
            setTimeout(() => {
                this.showToast(`提示: ${validation.warnings[0]}`);
            }, 2000);
        }
    }

    /**
     * 处理键盘快捷键
     */
    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'Enter':
                    e.preventDefault();
                    if (!this.state.isOptimizing) {
                        this.optimizePrompt();
                    }
                    break;
                case 'h':
                    e.preventDefault();
                    this.openHistoryModal();
                    break;
                case 'd':
                    e.preventDefault();
                    this.toggleTheme();
                    break;
                case 'k':
                    e.preventDefault();
                    this.openApiKeyModal();
                    break;
            }
        }
    }

    /**
     * 更新模型选择
     */
    updateModelSelection() {
        // 可以在这里添加模型选择的特殊处理逻辑
        if (this.elements.modelSelect) {
            console.log('模型已切换到:', this.elements.modelSelect.value);
        }
    }
}

// 应用初始化
document.addEventListener('DOMContentLoaded', () => {
    window.betterPromptApp = new BetterPromptApp();
});

export default BetterPromptApp; 
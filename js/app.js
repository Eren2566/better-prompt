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
            saveButton: document.getElementById('saveButton'),
            clearButton: document.getElementById('clearButton'),
            
            // 设置相关
            modelSelect: document.getElementById('modelSelect'),
            temperatureSlider: document.getElementById('temperatureSlider'),
            temperatureValue: document.getElementById('temperatureValue'),
            strengthSelect: document.getElementById('strengthSelect'),
            thinkingModeContainer: document.getElementById('thinkingModeContainer'),
            thinkingModeToggle: document.getElementById('thinkingModeToggle'),
            thinkingDepthContainer: document.getElementById('thinkingDepthContainer'),
            thinkingBudgetSlider: document.getElementById('thinkingBudgetSlider'),
            thinkingBudgetValue: document.getElementById('thinkingBudgetValue'),
            
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
            toastMessage: document.getElementById('toastMessage'),
            
            // 模板提示框相关
            templateTooltip: document.getElementById('templateTooltip')
        };
    }

    /**
     * 初始化应用状态
     */
    initializeState() {
        return {
            isOptimizing: false,
            currentProvider: StorageManager.get('currentProvider', 'gemini'),
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
        
        // 初始化思考模式显示状态
        if (this.elements.modelSelect) {
            const currentModel = this.elements.modelSelect.value;
            this.updateThinkingModeVisibility(currentModel);
            this.restoreThinkingModeState(currentModel);
        }
        
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
        if (this.elements.optimizedResult) {
            this.elements.optimizedResult.addEventListener('input', () => {
                const text = this.elements.optimizedResult.textContent || '';
                this.updateResultStats(text);
            });
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
        if (this.elements.thinkingModeToggle) {
            this.elements.thinkingModeToggle.addEventListener('change', () => {
                this.updateThinkingDepthVisibility();
                this.saveThinkingModeState();
            });
        }
        if (this.elements.thinkingBudgetSlider) {
            this.elements.thinkingBudgetSlider.addEventListener('input', () => {
                this.updateThinkingBudgetDisplay();
                this.saveThinkingModeState();
            });
        }

        // 模板选择事件
        if (this.elements.templateTabs) {
            this.elements.templateTabs.addEventListener('click', (e) => this.handleTemplateSelection(e));
            // 添加模板悬停事件
            this.elements.templateTabs.addEventListener('mouseenter', (e) => this.handleTemplateHover(e), true);
            this.elements.templateTabs.addEventListener('mouseleave', (e) => this.handleTemplateLeave(e), true);
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
                if (e.target === this.elements.apiKeyModal) {
                    this.closeApiKeyModal();
                    this.hideTemplateTooltip();
                }
            });
        }
        if (this.elements.historyModal) {
            this.elements.historyModal.addEventListener('click', (e) => {
                if (e.target === this.elements.historyModal) {
                    this.closeHistoryModal();
                    this.hideTemplateTooltip();
                }
            });
        }
        if (this.elements.advancedSettingsModal) {
            this.elements.advancedSettingsModal.addEventListener('click', (e) => {
                if (e.target === this.elements.advancedSettingsModal) {
                    this.closeAdvancedSettings();
                    this.hideTemplateTooltip();
                }
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

        // 窗口大小变化事件
        window.addEventListener('resize', () => {
            if (this.elements.optimizedResult) {
                const text = this.elements.optimizedResult.textContent || '';
                this.adjustResultHeight(text);
            }
        });
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
            this.adjustResultHeight('');
            return;
        }
        
        this.elements.charsResult.textContent = text.length;
        this.elements.statsPanel.classList.remove('invisible');
        this.adjustResultHeight(text);
    }

    /**
     * 根据内容动态调整优化结果区域高度
     */
    adjustResultHeight(text) {
        if (!this.elements.optimizedResult) return;
        
        const element = this.elements.optimizedResult;
        
        // 如果没有内容，保持最小高度
        if (!text || !text.trim()) {
            element.style.height = '';
            element.style.overflowY = 'hidden';
            return;
        }
        
        // 检测是否为移动端
        const isMobile = window.innerWidth <= 768;
        
        // 临时设置为auto来计算实际需要的高度
        const originalHeight = element.style.height;
        const originalOverflow = element.style.overflowY;
        element.style.height = 'auto';
        element.style.overflowY = 'hidden';
        
        // 获取内容的实际高度
        const scrollHeight = element.scrollHeight;
        
        // 根据设备类型设置不同的高度限制
        let minHeight, maxHeight;
        if (isMobile) {
            minHeight = 200; // 移动端较小的最小高度
            maxHeight = Math.min(window.innerHeight * 0.5, 300); // 移动端最大高度
        } else {
            minHeight = 300; // 桌面端最小高度
            maxHeight = Math.min(window.innerHeight * 0.7, 800); // 桌面端最大高度
        }
        
        // 计算合适的高度
        let newHeight;
        if (scrollHeight <= minHeight) {
            // 内容较少时，使用最小高度
            newHeight = minHeight;
        } else if (scrollHeight <= maxHeight) {
            // 内容适中时，使用实际高度
            newHeight = scrollHeight + 10; // 添加一点缓冲空间
        } else {
            // 内容过多时，使用最大高度并显示滚动条
            newHeight = maxHeight;
        }
        
        // 应用新高度
        element.style.height = `${newHeight}px`;
        
        // 如果内容超过最大高度，确保滚动条可见
        if (scrollHeight > maxHeight) {
            element.style.overflowY = 'auto';
        } else {
            element.style.overflowY = 'hidden';
        }
        
        // 平滑滚动到顶部（如果内容发生变化）
        if (element.scrollTop > 0) {
            element.scrollTop = 0;
        }
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
                thinkingMode: this.elements.thinkingModeToggle ? this.elements.thinkingModeToggle.checked : false,
                thinkingBudget: this.elements.thinkingBudgetSlider ? parseInt(this.elements.thinkingBudgetSlider.value) : 0
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
                thinkingMode: this.elements.thinkingModeToggle ? this.elements.thinkingModeToggle.checked : false,
                thinkingBudget: this.elements.thinkingBudgetSlider ? parseInt(this.elements.thinkingBudgetSlider.value) : 0
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
        // ESC键隐藏模板提示框
        if (e.key === 'Escape') {
            this.hideTemplateTooltip();
        }
        
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
        if (this.elements.modelSelect) {
            const selectedModel = this.elements.modelSelect.value;
            console.log('模型已切换到:', selectedModel);
            
            // 保存当前思考模式状态
            this.saveThinkingModeState();
            
            // 显示/隐藏思考模式开关
            this.updateThinkingModeVisibility(selectedModel);
            
            // 恢复该模型的思考模式状态
            this.restoreThinkingModeState(selectedModel);
        }
    }

    /**
     * 保存思考模式状态
     */
    saveThinkingModeState() {
        if (!this.elements.modelSelect || !this.elements.thinkingModeToggle || !this.elements.thinkingBudgetSlider) return;
        
        const currentModel = this.elements.modelSelect.value;
        const thinkingState = {
            enabled: this.elements.thinkingModeToggle.checked,
            budget: parseInt(this.elements.thinkingBudgetSlider.value)
        };
        
        StorageManager.set(`thinkingMode_${currentModel}`, thinkingState);
    }

    /**
     * 恢复思考模式状态
     */
    restoreThinkingModeState(model) {
        if (!this.elements.thinkingModeToggle || !this.elements.thinkingBudgetSlider) return;
        
        const savedState = StorageManager.get(`thinkingMode_${model}`, null);
        const isGeminiFlash = model === 'gemini-2.5-flash-preview-05-20';
        const isGeminiPro = model === 'gemini-2.5-pro-preview-06-05';
        
        if (savedState) {
            // 恢复保存的状态
            this.elements.thinkingModeToggle.checked = savedState.enabled;
            this.elements.thinkingBudgetSlider.value = savedState.budget;
            if (this.elements.thinkingBudgetValue) {
                this.elements.thinkingBudgetValue.textContent = savedState.budget;
            }
        } else {
            // 设置默认状态
            this.elements.thinkingModeToggle.checked = false;
            
            if (isGeminiFlash) {
                this.elements.thinkingBudgetSlider.value = 0;
                if (this.elements.thinkingBudgetValue) {
                    this.elements.thinkingBudgetValue.textContent = 0;
                }
            } else if (isGeminiPro) {
                this.elements.thinkingBudgetSlider.value = 128;
                if (this.elements.thinkingBudgetValue) {
                    this.elements.thinkingBudgetValue.textContent = 128;
                }
            }
        }
        
        // 更新思考深度容器的显示状态
        this.updateThinkingDepthVisibility();
    }

    /**
     * 更新思考模式的显示/隐藏
     */
    updateThinkingModeVisibility(model) {
        if (!this.elements.thinkingModeContainer) return;
        
        const isGeminiFlash = model === 'gemini-2.5-flash-preview-05-20';
        const isGeminiPro = model === 'gemini-2.5-pro-preview-06-05';
        const supportsThinking = isGeminiFlash || isGeminiPro;
        
        if (supportsThinking) {
            this.elements.thinkingModeContainer.classList.remove('hidden');
            // 根据模型类型更新滑块配置
            this.updateThinkingSliderConfig(model);
        } else {
            this.elements.thinkingModeContainer.classList.add('hidden');
            // 如果切换到其他模型，重置思考模式状态
            if (this.elements.thinkingModeToggle) {
                this.elements.thinkingModeToggle.checked = false;
            }
            if (this.elements.thinkingDepthContainer) {
                this.elements.thinkingDepthContainer.classList.add('hidden');
            }
        }
    }

    /**
     * 更新思考滑块配置
     */
    updateThinkingSliderConfig(model) {
        if (!this.elements.thinkingBudgetSlider) return;
        
        const isGeminiFlash = model === 'gemini-2.5-flash-preview-05-20';
        const isGeminiPro = model === 'gemini-2.5-pro-preview-06-05';
        const rangeSpan = document.getElementById('thinkingBudgetRange');
        
        if (isGeminiFlash) {
            // Flash模型：最大值24576，最小值0，默认8000
            this.elements.thinkingBudgetSlider.min = 0;
            this.elements.thinkingBudgetSlider.max = 24576;
            this.elements.thinkingBudgetSlider.step = 512;
            // 更新范围显示
            if (rangeSpan) {
                rangeSpan.textContent = '预算范围: 0-24576';
            }
        } else if (isGeminiPro) {
            // Pro模型：最大值32768，最小值128，默认8192
            this.elements.thinkingBudgetSlider.min = 128;
            this.elements.thinkingBudgetSlider.max = 32768;
            this.elements.thinkingBudgetSlider.step = 512;
            // 更新范围显示
            if (rangeSpan) {
                rangeSpan.textContent = '预算范围: 128-32768';
            }
        }
    }

    /**
     * 更新思考深度控制器的显示/隐藏
     */
    updateThinkingDepthVisibility() {
        if (!this.elements.thinkingDepthContainer || !this.elements.thinkingModeToggle || !this.elements.modelSelect) return;
        
        const currentModel = this.elements.modelSelect.value;
        const isGeminiFlash = currentModel === 'gemini-2.5-flash-preview-05-20';
        const isGeminiPro = currentModel === 'gemini-2.5-pro-preview-06-05';
        
        if (this.elements.thinkingModeToggle.checked) {
            this.elements.thinkingDepthContainer.classList.remove('hidden');
            // 根据模型设置默认预算
            if (this.elements.thinkingBudgetSlider) {
                const currentValue = parseInt(this.elements.thinkingBudgetSlider.value);
                let defaultValue;
                
                if (isGeminiFlash) {
                    defaultValue = currentValue === 0 ? 8000 : currentValue;
                } else if (isGeminiPro) {
                    defaultValue = currentValue === 128 ? 8192 : currentValue;
                }
                
                if (defaultValue && currentValue !== defaultValue) {
                    this.elements.thinkingBudgetSlider.value = defaultValue;
                    if (this.elements.thinkingBudgetValue) {
                        this.elements.thinkingBudgetValue.textContent = defaultValue;
                    }
                }
            }
        } else {
            this.elements.thinkingDepthContainer.classList.add('hidden');
            // 关闭思考模式时，根据模型设置不同的预算值
            if (this.elements.thinkingBudgetSlider) {
                let closedValue;
                if (isGeminiFlash) {
                    closedValue = 0;
                } else if (isGeminiPro) {
                    closedValue = 128;
                }
                
                if (closedValue !== undefined) {
                    this.elements.thinkingBudgetSlider.value = closedValue;
                    if (this.elements.thinkingBudgetValue) {
                        this.elements.thinkingBudgetValue.textContent = closedValue;
                    }
                }
            }
        }
    }

    /**
     * 更新思考预算显示
     */
    updateThinkingBudgetDisplay() {
        if (!this.elements.thinkingBudgetSlider || !this.elements.thinkingBudgetValue || !this.elements.modelSelect) return;
        
        const value = parseInt(this.elements.thinkingBudgetSlider.value);
        const currentModel = this.elements.modelSelect.value;
        const isGeminiFlash = currentModel === 'gemini-2.5-flash-preview-05-20';
        const isGeminiPro = currentModel === 'gemini-2.5-pro-preview-06-05';
        
        this.elements.thinkingBudgetValue.textContent = value;
        
        // 只有当用户手动调节滑块时才进行自动开启/关闭逻辑
        // 避免在程序自动设置预算时触发循环逻辑
        if (this.elements.thinkingModeToggle) {
            let shouldClose = false;
            let shouldOpen = false;
            
            if (isGeminiFlash) {
                // Flash模型：预算为0时关闭，大于0时开启
                shouldClose = value === 0;
                shouldOpen = value > 0 && !this.elements.thinkingModeToggle.checked;
            } else if (isGeminiPro) {
                // Pro模型：预算为128时关闭，大于128时开启
                shouldClose = value === 128;
                shouldOpen = value > 128 && !this.elements.thinkingModeToggle.checked;
            }
            
            if (shouldClose) {
                this.elements.thinkingModeToggle.checked = false;
                if (this.elements.thinkingDepthContainer) {
                    this.elements.thinkingDepthContainer.classList.add('hidden');
                }
            } else if (shouldOpen) {
                this.elements.thinkingModeToggle.checked = true;
                if (this.elements.thinkingDepthContainer) {
                    this.elements.thinkingDepthContainer.classList.remove('hidden');
                }
            }
        }
    }

    /**
     * 处理模板悬停事件
     */
    handleTemplateHover(e) {
        const button = e.target.closest('.template-tab-button');
        if (!button) return;
        
        // 清除隐藏定时器
        if (this.tooltipHideTimeout) {
            clearTimeout(this.tooltipHideTimeout);
            this.tooltipHideTimeout = null;
        }
        
        const templateName = button.dataset.template;
        
        // 延迟显示提示框
        this.tooltipShowTimeout = setTimeout(() => {
            this.showTemplateTooltip(templateName, button);
        }, 300); // 300ms延迟，更自然
    }

    /**
     * 处理模板离开事件
     */
    handleTemplateLeave(e) {
        const button = e.target.closest('.template-tab-button');
        if (!button) return;
        
        // 清除显示定时器
        if (this.tooltipShowTimeout) {
            clearTimeout(this.tooltipShowTimeout);
            this.tooltipShowTimeout = null;
        }
        
        // 延迟隐藏，允许用户移动到提示框上
        this.tooltipHideTimeout = setTimeout(() => {
            this.hideTemplateTooltip();
        }, 100);
    }

    /**
     * 显示模板提示框
     */
    showTemplateTooltip(templateName, buttonElement) {
        if (!this.elements.templateTooltip) return;
        
        // 获取完整的模板内容
        const templateContent = this.getTemplateContent(templateName);
        
        if (!templateContent) return;
        
        // 设置提示框内容
        this.elements.templateTooltip.textContent = templateContent;
        
        // 计算位置
        const buttonRect = buttonElement.getBoundingClientRect();
        const tooltipElement = this.elements.templateTooltip;
        
        // 重置类名
        tooltipElement.className = 'template-tooltip';
        
        // 临时显示以获取尺寸
        tooltipElement.style.visibility = 'hidden';
        tooltipElement.classList.add('visible');
        
        const tooltipRect = tooltipElement.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // 计算水平位置（居中对齐）
        let left = buttonRect.left + (buttonRect.width / 2) - (tooltipRect.width / 2);
        
        // 水平边界检查
        if (left < 10) {
            left = 10;
        } else if (left + tooltipRect.width > viewportWidth - 10) {
            left = viewportWidth - tooltipRect.width - 10;
        }
        
        // 计算垂直位置和箭头方向
        let top;
        let arrowClass;
        
        if (buttonRect.top - tooltipRect.height - 12 > 10) {
            // 上方有足够空间，显示在按钮上方
            top = buttonRect.top - tooltipRect.height - 12;
            arrowClass = 'arrow-down';
        } else {
            // 显示在按钮下方
            top = buttonRect.bottom + 12;
            arrowClass = 'arrow-up';
        }
        
        // 设置位置和箭头
        tooltipElement.style.left = `${left}px`;
        tooltipElement.style.top = `${top}px`;
        tooltipElement.classList.add(arrowClass);
        tooltipElement.style.visibility = 'visible';
        
        // 添加提示框的鼠标事件，允许用户在提示框上滚动
        const handleTooltipEnter = () => {
            if (this.tooltipHideTimeout) {
                clearTimeout(this.tooltipHideTimeout);
                this.tooltipHideTimeout = null;
            }
        };
        
        const handleTooltipLeave = () => {
            this.tooltipHideTimeout = setTimeout(() => {
                this.hideTemplateTooltip();
            }, 100);
        };
        
        // 移除之前的事件监听器（如果存在）
        tooltipElement.removeEventListener('mouseenter', this.tooltipEnterHandler);
        tooltipElement.removeEventListener('mouseleave', this.tooltipLeaveHandler);
        
        // 保存事件处理器引用并添加新的监听器
        this.tooltipEnterHandler = handleTooltipEnter;
        this.tooltipLeaveHandler = handleTooltipLeave;
        tooltipElement.addEventListener('mouseenter', this.tooltipEnterHandler);
        tooltipElement.addEventListener('mouseleave', this.tooltipLeaveHandler);
    }

    /**
     * 隐藏模板提示框
     */
    hideTemplateTooltip() {
        if (!this.elements.templateTooltip) return;
        
        this.elements.templateTooltip.classList.remove('visible', 'arrow-up', 'arrow-down');
        
        // 清除所有定时器
        if (this.tooltipHideTimeout) {
            clearTimeout(this.tooltipHideTimeout);
            this.tooltipHideTimeout = null;
        }
        if (this.tooltipShowTimeout) {
            clearTimeout(this.tooltipShowTimeout);
            this.tooltipShowTimeout = null;
        }
    }

    /**
     * 获取模板内容
     */
    getTemplateContent(templateName) {
        if (templateName === 'custom') {
            const customPrompt = this.templateManager.getCustomPrompt();
            return customPrompt || '尚未设置自定义模板。请在高级设置中配置自定义优化指令。';
        }
        
        const templates = this.templateManager.prompts;
        return templates[templateName] || '';
    }
}

// 应用初始化
document.addEventListener('DOMContentLoaded', () => {
    window.betterPromptApp = new BetterPromptApp();
});

export default BetterPromptApp; 
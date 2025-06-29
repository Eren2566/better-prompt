// Task: 内容脚本 - 实现三击空格触发提示词优化

/**
 * Better Prompt Content Script
 * 监听三击空格事件，自动优化提示词
 */
class BetterPromptContentScript {
    constructor() {
        this.keyClickCount = 0;
        this.keyClickTimer = null;
        this.isOptimizing = false;
        this.activeElement = null;
        this.triggerKey = 'space3'; // 默认触发键
        
        // 三击检测的时间窗口（毫秒）
        this.clickTimeWindow = 800;
        
        this.init();
    }

    init() {
        // 检查扩展上下文是否有效
        if (!this.checkExtensionContext()) {
            console.warn('Better Prompt 插件上下文无效，功能可能受限');
            return;
        }
        
        this.addEventListeners();
        console.log('Better Prompt 插件已激活');
    }

    // 检查扩展上下文是否有效
    checkExtensionContext() {
        try {
            // 检查基本的chrome API是否可用
            if (!chrome || !chrome.runtime) {
                return false;
            }
            
            // 尝试访问扩展ID
            const extensionId = chrome.runtime.id;
            if (!extensionId) {
                return false;
            }
            
            return true;
        } catch (error) {
            console.warn('检查扩展上下文时出错:', error);
            return false;
        }
    }

    addEventListeners() {
        // 监听键盘事件
        document.addEventListener('keydown', (e) => this.handleKeyDown(e), true);
        document.addEventListener('keyup', (e) => this.handleKeyUp(e), true);
        
        // 监听焦点变化，记录当前活跃的输入元素
        document.addEventListener('focusin', (e) => this.handleFocusIn(e), true);
        document.addEventListener('focusout', (e) => this.handleFocusOut(e), true);
        
        // 初始化时获取用户设置的触发键
        this.loadTriggerSettings();
    }

    handleFocusIn(e) {
        const element = e.target;
        if (this.isInputElement(element)) {
            this.activeElement = element;
        }
    }

    handleFocusOut(e) {
        // 延迟清除，避免快速切换时的问题
        setTimeout(() => {
            if (this.activeElement === e.target) {
                this.activeElement = null;
            }
        }, 100);
    }

    handleKeyDown(e) {
        const element = e.target;
        
        // 检查是否在可编辑的输入元素中
        if (!this.isInputElement(element)) {
            this.resetKeyClickCount();
            return;
        }

        // 检查是否匹配当前设置的触发键
        if (this.checkTriggerKey(e)) {
            this.processTriggerEvent(e, element);
        } else {
            this.resetKeyClickCount();
        }
    }

    handleKeyUp(e) {
        // 某些快捷键可能需要在keyup时处理
    }

    checkTriggerKey(e) {
        const triggerKey = this.triggerKey;
        
        switch (triggerKey) {
            case 'space3':
                return e.code === 'Space' && !e.ctrlKey && !e.altKey && !e.shiftKey;
            case 'enter3':
                return e.code === 'Enter' && !e.ctrlKey && !e.altKey && !e.shiftKey;
            case 'tab3':
                return e.code === 'Tab' && !e.ctrlKey && !e.altKey && !e.shiftKey;
            case 'semicolon3':
                return e.code === 'Semicolon' && !e.ctrlKey && !e.altKey && !e.shiftKey;
            case 'ctrl+space':
                return e.code === 'Space' && e.ctrlKey && !e.altKey;
            case 'alt+space':
                return e.code === 'Space' && !e.ctrlKey && e.altKey;
            case 'ctrl+enter':
                return e.code === 'Enter' && e.ctrlKey && !e.altKey;
            default:
                return e.code === 'Space' && !e.ctrlKey && !e.altKey && !e.shiftKey;
        }
    }

    processTriggerEvent(e, element) {
        const triggerKey = this.triggerKey;
        
        // 对于组合键，直接触发
        if (triggerKey.includes('+')) {
            e.preventDefault();
            this.handleOptimizationTrigger(element);
            return;
        }
        
        // 对于三击类型的键，计数处理
        this.keyClickCount++;
        
        // 重置计时器
        if (this.keyClickTimer) {
            clearTimeout(this.keyClickTimer);
        }

        // 检查是否达到三击
        if (this.keyClickCount >= 3) {
            e.preventDefault(); // 阻止默认行为
            this.handleOptimizationTrigger(element);
            this.resetKeyClickCount();
            return;
        }

        // 设置重置计时器
        this.keyClickTimer = setTimeout(() => {
            this.resetKeyClickCount();
        }, this.clickTimeWindow);
    }

    resetKeyClickCount() {
        this.keyClickCount = 0;
        if (this.keyClickTimer) {
            clearTimeout(this.keyClickTimer);
            this.keyClickTimer = null;
        }
    }

    isInputElement(element) {
        if (!element) return false;
        
        const tagName = element.tagName.toLowerCase();
        
        // 检查常见的输入元素
        if (tagName === 'textarea') return true;
        if (tagName === 'input' && ['text', 'search', 'email', 'url'].includes(element.type)) return true;
        
        // 检查可编辑的div
        if (element.contentEditable === 'true') return true;
        
        // 检查特定的输入框选择器（常见的富文本编辑器）
        const inputSelectors = [
            '[role="textbox"]',
            '.ql-editor', // Quill编辑器
            '.DraftEditor-root', // Draft.js编辑器
            '.ce-paragraph', // CodeX Editor
            '.ProseMirror', // ProseMirror编辑器
            '[data-slate-editor]' // Slate编辑器
        ];
        
        return inputSelectors.some(selector => {
            try {
                return element.matches && element.matches(selector);
            } catch (e) {
                return false;
            }
        });
    }

    async loadTriggerSettings() {
        try {
            const settings = await this.getExtensionSettings();
            this.triggerKey = settings.triggerKey || 'space3';
        } catch (error) {
            console.warn('获取触发键设置失败，使用默认设置:', error);
            this.triggerKey = 'space3';
        }
    }

    async handleOptimizationTrigger(element) {
        if (this.isOptimizing) {
            console.log('正在优化中，请稍候...');
            return;
        }

        try {
            this.isOptimizing = true;
            
            // 获取当前文本内容
            const originalText = this.getElementText(element);
            
            if (!originalText || originalText.trim().length === 0) {
                this.showNotification('请先输入一些文本', 'warning');
                return;
            }

            if (originalText.trim().length < 10) {
                this.showNotification('文本内容太短，请输入更多内容', 'warning');
                return;
            }

            // 显示优化中的提示
            this.showNotification('正在优化提示词...', 'info');
            
            // 获取设置并优化文本
            const settings = await this.getExtensionSettings();
            
            // 检查API Key配置
            if (!settings.apiKey || settings.apiKey.trim() === '') {
                this.showNotification('请先在插件设置中配置API Key', 'error');
                return;
            }
            
            // 确保使用的模板不为空
            if (!settings.template || settings.template.trim() === '') {
                console.warn('模板内容为空，使用默认模板');
                settings.template = this.getDefaultTemplate();
            }

            const optimizedText = await this.optimizePrompt(originalText, settings);
            
            if (optimizedText && optimizedText !== originalText) {
                // 替换文本内容
                this.setElementText(element, optimizedText);
                this.showNotification('提示词优化完成！', 'success');
            } else {
                this.showNotification('优化失败，请检查网络连接和API Key', 'error');
            }
            
        } catch (error) {
            console.error('优化提示词时出错:', error);
            
            // 详细的错误分类处理
            let errorMessage = '优化失败';
            
            if (error.message) {
                if (error.message.includes('context invalidated')) {
                    errorMessage = '扩展上下文已失效，请重新加载页面';
                } else if (error.message.includes('API Key未配置')) {
                    errorMessage = '请先配置API Key';
                } else if (error.message.includes('网络连接失败')) {
                    errorMessage = '网络连接失败，请检查网络设置';
                } else if (error.message.includes('API请求失败')) {
                    errorMessage = 'API调用失败，请检查API Key或网络';
                } else {
                    errorMessage = '优化失败: ' + error.message;
                }
            }
            
            this.showNotification(errorMessage, 'error');
        } finally {
            this.isOptimizing = false;
        }
    }

    getElementText(element) {
        const tagName = element.tagName.toLowerCase();
        
        if (tagName === 'textarea' || tagName === 'input') {
            return element.value;
        } else if (element.contentEditable === 'true') {
            return element.textContent || element.innerText;
        }
        
        return '';
    }

    setElementText(element, text) {
        const tagName = element.tagName.toLowerCase();
        
        if (tagName === 'textarea' || tagName === 'input') {
            element.value = text;
            
            // 触发change和input事件，确保框架能检测到变化
            element.dispatchEvent(new Event('input', { bubbles: true }));
            element.dispatchEvent(new Event('change', { bubbles: true }));
            
        } else if (element.contentEditable === 'true') {
            element.textContent = text;
            
            // 触发input事件
            element.dispatchEvent(new Event('input', { bubbles: true }));
        }
        
        // 设置光标到末尾
        setTimeout(() => {
            this.setCursorToEnd(element);
        }, 10);
    }

    setCursorToEnd(element) {
        try {
            if (element.tagName.toLowerCase() === 'textarea' || element.tagName.toLowerCase() === 'input') {
                element.selectionStart = element.selectionEnd = element.value.length;
            } else if (element.contentEditable === 'true') {
                const range = document.createRange();
                const selection = window.getSelection();
                range.selectNodeContents(element);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            }
            element.focus();
        } catch (e) {
            console.warn('设置光标位置失败:', e);
        }
    }

    async getExtensionSettings() {
        return new Promise((resolve) => {
            // 检查chrome.runtime是否可用
            if (!chrome || !chrome.runtime || !chrome.runtime.sendMessage) {
                console.warn('Chrome扩展上下文不可用，使用默认设置');
                resolve(this.getDefaultSettings());
                return;
            }

            try {
                chrome.runtime.sendMessage(
                    { action: 'getSettings' },
                    (response) => {
                        // 检查是否有运行时错误
                        if (chrome.runtime.lastError) {
                            console.warn('获取扩展设置失败:', chrome.runtime.lastError.message);
                            // 如果是上下文失效错误，提供特定的错误处理
                            if (chrome.runtime.lastError.message.includes('context invalidated')) {
                                console.log('扩展上下文已失效，请重新加载页面或重新启动扩展');
                            }
                            resolve(this.getDefaultSettings());
                            return;
                        }

                        // 检查响应格式 - background.js返回 { success: true, settings: ... }
                        if (response && response.success && response.settings) {
                            resolve(response.settings);
                        } else if (response && response.settings) {
                            // 兼容旧格式
                            resolve(response.settings);
                        } else {
                            console.warn('未收到有效的设置响应，使用默认设置');
                            if (response && response.error) {
                                console.error('Background错误:', response.error);
                            }
                            resolve(this.getDefaultSettings());
                        }
                    }
                );
            } catch (error) {
                console.warn('发送消息时出错:', error);
                resolve(this.getDefaultSettings());
            }
        });
    }

    // 获取默认设置
    getDefaultSettings() {
        return {
            apiKey: '',
            model: 'gemini-2.5-flash',
            strength: 'medium',
            template: this.getDefaultTemplate(),
            thinkingMode: false,
            thinkingBudget: 8000,
            triggerKey: 'space3'
        };
    }

    // 获取默认模板
    getDefaultTemplate() {
        return `作为 Prompt 优化专家，请基于以下「用户原始输入」重写生成一个高质量、目标明确的 Prompt。核心要求:
1. **深度理解与提炼**: 精准捕捉用户的核心意图与深层需求，去除模糊或冗余表述。
2. **明确任务目标**: 清晰定义 AI 需要完成的具体任务。
3. **补充关键上下文**: 添加必要的背景信息、假设或约束条件，确保 AI 准确理解任务环境。
4. **定义期望输出**: 明确说明期望的输出格式、风格、口吻或结构。
5. **语言精练、逻辑严谨**: 使用准确、无歧义的语言，确保逻辑清晰。
6. **保持原始意图**: 不得扭曲或添加与用户原意无关的信息。
直接输出优化后的 Prompt 内容本身，不要包含任何额外的问候、解释、标题或标记(如"Prompt:")。
Important: Output must start immediately with the rewritten prompt content. Do **NOT** add greetings, explanations, titles, or any extra words before or after the prompt.
Always respond in 中文。`;
    }

    // 基于现有apiService.js的Gemini API调用逻辑
    async optimizePrompt(originalPrompt, settings) {
        const { apiKey, model, template, thinkingMode, thinkingBudget } = settings;
        
        if (!apiKey) {
            throw new Error('API Key未配置');
        }

        // 构建完整的提示词
        const fullPrompt = `${template}\n\n原始用户提示词:\n"""\n${originalPrompt}\n"""\n\n优化后的提示词:`;
        
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        
        const generationConfig = { 
            temperature: 0.5,
            maxOutputTokens: 8192
        };
        
        // 为Gemini 2.5 Flash添加思考模式配置
        if (model === 'gemini-2.5-flash' && thinkingMode && thinkingBudget > 0) {
            generationConfig.thinkingBudget = thinkingBudget;
        }

        const requestBody = {
            contents: [{
                parts: [{
                    text: fullPrompt
                }]
            }],
            generationConfig
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API请求失败: ${response.status} ${errorData.error?.message || ''}`);
            }

            const data = await response.json();
            
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                return data.candidates[0].content.parts[0].text.trim();
            } else {
                throw new Error('API响应格式异常');
            }
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('网络连接失败，请检查网络设置');
            }
            throw error;
        }
    }

    showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = 'better-prompt-notification';
        
        // 设置样式
        const styles = {
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: '10000',
            padding: '12px 16px',
            borderRadius: '8px',
            color: 'white',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            maxWidth: '300px',
            wordWrap: 'break-word',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease-in-out',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        };

        // 根据类型设置背景色和图标
        let backgroundColor, icon;
        switch (type) {
            case 'success':
                backgroundColor = '#10b981';
                icon = '✅';
                break;
            case 'error':
                backgroundColor = '#ef4444';
                icon = '❌';
                break;
            case 'warning':
                backgroundColor = '#f59e0b';
                icon = '⚠️';
                break;
            default:
                backgroundColor = '#3b82f6';
                icon = 'ℹ️';
        }

        styles.backgroundColor = backgroundColor;

        // 应用样式
        Object.assign(notification.style, styles);
        
        // 设置内容
        notification.innerHTML = `${icon} ${message}`;
        
        // 添加到页面
        document.body.appendChild(notification);
        
        // 动画显示
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // 自动消失
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, type === 'error' ? 5000 : 3000);
    }
}

// 确保在页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new BetterPromptContentScript();
    });
} else {
    new BetterPromptContentScript();
} 
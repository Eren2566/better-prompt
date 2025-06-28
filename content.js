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
        this.addEventListeners();
        console.log('Better Prompt 插件已激活');
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
            if (!settings.apiKey) {
                this.showNotification('请先在插件设置中配置API Key', 'error');
                return;
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
            this.showNotification('优化失败: ' + (error.message || '未知错误'), 'error');
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
            chrome.runtime.sendMessage(
                { action: 'getSettings' },
                (response) => {
                    if (response && response.settings) {
                        resolve(response.settings);
                    } else {
                        // 如果无法获取设置，使用默认值
                        resolve({
                            apiKey: '',
                            model: 'gemini-2.5-pro-preview-06-05',
                            strength: 'medium',
                            template: '',
                            thinkingMode: false,
                            thinkingBudget: 8000,
                            triggerKey: 'space3'
                        });
                    }
                }
            );
        });
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
        if (model === 'gemini-2.5-flash-preview-05-20' && thinkingMode && thinkingBudget > 0) {
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
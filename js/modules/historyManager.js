import { StorageManager } from '../utils/storage.js';

/**
 * 历史记录管理器
 */
export class HistoryManager {
    constructor() {
        this.history = [];
        this.maxHistorySize = 50;
        this.loadFromStorage();
    }

    /**
     * 从存储加载历史记录
     */
    loadFromStorage() {
        this.history = StorageManager.get('optHistory', []);
    }

    /**
     * 保存历史记录到存储
     */
    saveToStorage() {
        StorageManager.set('optHistory', this.history);
    }

    /**
     * 添加历史记录条目
     * @param {string} original - 原始提示词
     * @param {string} optimized - 优化后的提示词
     * @param {Object} metadata - 元数据
     */
    addEntry(original, optimized, metadata = {}) {
        if (!optimized || !optimized.trim()) return;

        const entry = {
            id: this.generateId(),
            original: original.trim(),
            optimized: optimized.trim(),
            template: metadata.template || 'default',
            model: metadata.model || '',
            temperature: metadata.temperature || 0.5,
            strength: metadata.strength || 'medium',
            provider: metadata.provider || 'gemini',
            timestamp: new Date().toISOString(),
            timeString: new Date().toLocaleString('zh-CN', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            rating: null,
            tags: metadata.tags || []
        };

        // 添加到历史记录开头
        this.history.unshift(entry);

        // 限制历史记录大小
        if (this.history.length > this.maxHistorySize) {
            this.history = this.history.slice(0, this.maxHistorySize);
        }

        this.saveToStorage();
        return entry;
    }

    /**
     * 获取所有历史记录
     * @returns {Array} 历史记录数组
     */
    getAll() {
        return [...this.history];
    }

    /**
     * 根据ID获取历史记录
     * @param {string} id - 记录ID
     * @returns {Object|null} 历史记录条目
     */
    getById(id) {
        return this.history.find(entry => entry.id === id) || null;
    }

    /**
     * 删除历史记录条目
     * @param {string} id - 记录ID
     * @returns {boolean} 是否删除成功
     */
    deleteEntry(id) {
        const index = this.history.findIndex(entry => entry.id === id);
        if (index !== -1) {
            this.history.splice(index, 1);
            this.saveToStorage();
            return true;
        }
        return false;
    }

    /**
     * 清空所有历史记录
     */
    clear() {
        this.history = [];
        this.saveToStorage();
    }

    /**
     * 搜索历史记录
     * @param {string} query - 搜索关键词
     * @param {Object} filters - 过滤条件
     * @returns {Array} 搜索结果
     */
    search(query = '', filters = {}) {
        let results = [...this.history];

        // 关键词搜索
        if (query.trim()) {
            const keywords = query.toLowerCase().split(/\s+/);
            results = results.filter(entry =>
                keywords.some(keyword =>
                    entry.original.toLowerCase().includes(keyword) ||
                    entry.optimized.toLowerCase().includes(keyword)
                )
            );
        }

        // 过滤条件
        if (filters.template) {
            results = results.filter(entry => entry.template === filters.template);
        }

        if (filters.provider) {
            results = results.filter(entry => entry.provider === filters.provider);
        }

        if (filters.dateRange) {
            const { start, end } = filters.dateRange;
            results = results.filter(entry => {
                const entryDate = new Date(entry.timestamp);
                return entryDate >= start && entryDate <= end;
            });
        }

        if (filters.rating) {
            results = results.filter(entry => entry.rating === filters.rating);
        }

        return results;
    }

    /**
     * 为历史记录条目评分
     * @param {string} id - 记录ID
     * @param {number} rating - 评分 (1-5)
     */
    rateEntry(id, rating) {
        const entry = this.getById(id);
        if (entry && rating >= 1 && rating <= 5) {
            entry.rating = rating;
            this.saveToStorage();
        }
    }

    /**
     * 为历史记录条目添加标签
     * @param {string} id - 记录ID
     * @param {Array} tags - 标签数组
     */
    tagEntry(id, tags) {
        const entry = this.getById(id);
        if (entry) {
            entry.tags = [...new Set(tags)]; // 去重
            this.saveToStorage();
        }
    }

    /**
     * 获取使用统计
     * @returns {Object} 统计信息
     */
    getStatistics() {
        const total = this.history.length;
        if (total === 0) {
            return {
                total: 0,
                templates: {},
                providers: {},
                averageRating: 0,
                recentActivity: []
            };
        }

        // 模板使用统计
        const templates = {};
        this.history.forEach(entry => {
            templates[entry.template] = (templates[entry.template] || 0) + 1;
        });

        // 提供商使用统计
        const providers = {};
        this.history.forEach(entry => {
            providers[entry.provider] = (providers[entry.provider] || 0) + 1;
        });

        // 平均评分
        const ratedEntries = this.history.filter(entry => entry.rating);
        const averageRating = ratedEntries.length > 0
            ? ratedEntries.reduce((sum, entry) => sum + entry.rating, 0) / ratedEntries.length
            : 0;

        // 最近活动（最近7天）
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const recentActivity = this.history.filter(entry =>
            new Date(entry.timestamp) >= weekAgo
        ).length;

        return {
            total,
            templates,
            providers,
            averageRating: Math.round(averageRating * 10) / 10,
            recentActivity
        };
    }

    /**
     * 导出历史记录
     * @param {string} format - 导出格式 ('json', 'csv', 'markdown')
     * @returns {string} 导出内容
     */
    export(format = 'json') {
        const data = {
            history: this.history,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        switch (format) {
            case 'json':
                return JSON.stringify(data, null, 2);

            case 'csv':
                return this.exportToCsv();

            case 'markdown':
                return this.exportToMarkdown();

            default:
                throw new Error(`不支持的导出格式: ${format}`);
        }
    }

    /**
     * 导出为CSV格式
     * @returns {string} CSV内容
     */
    exportToCsv() {
        const headers = ['时间', '模板', '提供商', '原始提示词', '优化结果', '评分'];
        const rows = this.history.map(entry => [
            entry.timeString,
            entry.template,
            entry.provider,
            `"${entry.original.replace(/"/g, '""')}"`,
            `"${entry.optimized.replace(/"/g, '""')}"`,
            entry.rating || ''
        ]);

        return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    }

    /**
     * 导出为Markdown格式
     * @returns {string} Markdown内容
     */
    exportToMarkdown() {
        const title = `# Better Prompt 历史记录\n\n导出时间: ${new Date().toLocaleString('zh-CN')}\n总计: ${this.history.length} 条记录\n\n`;

        const content = this.history.map((entry, index) => {
            const rating = entry.rating ? `⭐ ${entry.rating}/5` : '未评分';
            return `## ${index + 1}. ${entry.timeString} (${entry.template})\n\n**原始提示词:**\n${entry.original}\n\n**优化结果:**\n${entry.optimized}\n\n**评分:** ${rating}\n\n---\n\n`;
        }).join('');

        return title + content;
    }

    /**
     * 导入历史记录
     * @param {string} data - 导入数据
     * @param {boolean} merge - 是否合并现有记录
     */
    import(data, merge = true) {
        try {
            const imported = JSON.parse(data);
            
            if (!imported.history || !Array.isArray(imported.history)) {
                throw new Error('无效的导入数据格式');
            }

            if (merge) {
                // 合并导入，避免重复
                const existingIds = new Set(this.history.map(entry => entry.id));
                const newEntries = imported.history.filter(entry => !existingIds.has(entry.id));
                
                this.history = [...newEntries, ...this.history];
            } else {
                // 替换全部
                this.history = imported.history;
            }

            // 限制大小
            if (this.history.length > this.maxHistorySize) {
                this.history = this.history.slice(0, this.maxHistorySize);
            }

            this.saveToStorage();
            return { success: true, count: imported.history.length };

        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * 生成唯一ID
     * @returns {string} 唯一标识符
     */
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 获取存储使用情况
     * @returns {Object} 存储信息
     */
    getStorageInfo() {
        const size = StorageManager.getStorageSize();
        const historySize = JSON.stringify(this.history).length;

        return {
            totalSize: size,
            historySize,
            percentage: Math.round((historySize / size) * 100),
            entryCount: this.history.length
        };
    }
} 
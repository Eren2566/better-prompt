/**
 * 本地存储工具类
 */
export class StorageManager {
    /**
     * 获取存储的数据
     * @param {string} key - 存储键名
     * @param {*} defaultValue - 默认值
     * @returns {*} 存储的值或默认值
     */
    static get(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (error) {
            console.warn(`获取存储数据失败: ${key}`, error);
            return defaultValue;
        }
    }

    /**
     * 设置存储数据
     * @param {string} key - 存储键名
     * @param {*} value - 要存储的值
     */
    static set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`设置存储数据失败: ${key}`, error);
        }
    }

    /**
     * 删除存储数据
     * @param {string} key - 存储键名
     */
    static remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`删除存储数据失败: ${key}`, error);
        }
    }

    /**
     * 清空所有存储数据
     */
    static clear() {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('清空存储数据失败', error);
        }
    }

    /**
     * 获取存储大小（近似值）
     * @returns {number} 存储大小（字节）
     */
    static getStorageSize() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        return total;
    }

    /**
     * 检查存储是否可用
     * @returns {boolean} 是否可用
     */
    static isAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    }
} 
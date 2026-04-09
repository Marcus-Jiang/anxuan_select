/**
 * 海拓選品 - API 调用层
 *
 * 统一封装所有与 Flask 后端的 HTTP 请求
 *
 * API 接口：
 * - GET  /api/data          - 获取完整数据
 * - POST /api/data          - 保存完整数据
 * - POST /api/upload-image  - 上传图片
 * - POST /api/delete-image  - 删除图片
 * - POST /api/delete-folder - 删除文件夹
 */

/**
 * ==========================================
 * API 管理器
 * ==========================================
 */
const API = {
    // API 基础路径
    baseUrl: '',

    // 请求超时时间（毫秒）
    timeout: 30000,

    /**
     * 初始化 API 配置
     * @param {string} baseUrl - API 基础路径
     */
    init(baseUrl = '') {
        this.baseUrl = baseUrl;
    },

    // ==========================================
    // 通用请求方法
    // ==========================================

    /**
     * 发送 GET 请求
     * @param {string} endpoint - API 端点
     * @returns {Promise<Object>} 响应数据
     */
    async get(endpoint) {
        return this.request(endpoint, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
    },

    /**
     * 发送 POST 请求
     * @param {string} endpoint - API 端点
     * @param {Object} data - 请求数据
     * @returns {Promise<Object>} 响应数据
     */
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    },

    /**
     * 发送 POST 请求（表单数据，用于文件上传）
     * @param {string} endpoint - API 端点
     * @param {FormData} formData - 表单数据
     * @returns {Promise<Object>} 响应数据
     */
    async postForm(endpoint, formData) {
        return this.request(endpoint, {
            method: 'POST',
            body: formData
            // 注意：不设置 Content-Type，让浏览器自动设置（包含 boundary）
        });
    },

    /**
     * 通用请求方法
     * @param {string} endpoint - API 端点
     * @param {Object} options - 请求选项
     * @returns {Promise<Object>} 响应数据
     */
    async request(endpoint, options) {
        const url = this.baseUrl + endpoint;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();

        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('请求超时，请检查网络连接');
            }
            throw error;
        }
    },


    // ==========================================
    // 数据操作 API
    // ==========================================

    /**
     * 获取完整数据
     * 优先从 API 获取，如果失败则从本地 JSON 文件加载
     * @returns {Promise<Object>} data.json 内容
     */
    async getData() {
        try {
            // 尝试从 API 获取
            const result = await this.get('/api/data');
            return result.data || result;
        } catch (error) {
            console.warn('API /api/data 不可用，尝试加载本地 data.json:', error);

            // API 不可用时，降级到本地 JSON
            try {
                const response = await fetch('data.json');
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                const data = await response.json();
                return data;
            } catch (localError) {
                console.error('本地 data.json 也加载失败:', localError);
                throw new Error('无法加载数据，请确保服务器已启动或 data.json 存在');
            }
        }
    },

    /**
     * 保存完整数据到服务器
     * @param {Object} data - 要保存的数据
     * @returns {Promise<Object>} 保存结果 { success: boolean, error?: string }
     */
    async saveData(data) {
        try {
            const result = await this.post('/api/data', data);

            if (result.success) {
                return { success: true };
            } else {
                return { success: false, error: result.error || '保存失败' };
            }
        } catch (error) {
            console.error('保存数据失败:', error);
            return { success: false, error: error.message };
        }
    },


    // ==========================================
    // 图片操作 API
    // ==========================================

    /**
     * 上传图片到指定路径
     * @param {File|Blob} file - 图片文件
     * @param {string} savePath - 保存路径，格式：'images/一级分类/二级分类/三级分类/文件名.png'
     * @returns {Promise<Object>} 上传结果 { success: boolean, path?: string, error?: string }
     */
    async uploadImage(file, savePath) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('path', savePath);

            const result = await this.postForm('/api/upload-image', formData);

            if (result.success) {
                return {
                    success: true,
                    path: result.path || savePath.replace(/\\/g, '/')
                };
            } else {
                return { success: false, error: result.error || '上传失败' };
            }
        } catch (error) {
            console.error('上传图片失败:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * 上传多个图片
     * @param {Array<{file: File|Blob, path: string}>} files - 图片文件数组
     * @returns {Promise<Array<{success: boolean, path?: string, error?: string}>>} 每个文件的上传结果
     */
    async uploadImages(files) {
        const results = [];

        for (const item of files) {
            const result = await this.uploadImage(item.file, item.path);
            results.push(result);

            // 如果需要，可以在这里添加延迟避免请求过快
            if (files.indexOf(item) < files.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        return results;
    },

    /**
     * 删除指定路径的图片
     * @param {string} imagePath - 图片路径
     * @returns {Promise<Object>} 删除结果 { success: boolean, error?: string }
     */
    async deleteImage(imagePath) {
        try {
            const result = await this.post('/api/delete-image', { path: imagePath });
            return result;
        } catch (error) {
            console.error('删除图片失败:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * 删除多个图片
     * @param {Array<string>} imagePaths - 图片路径数组
     * @returns {Promise<Array<Object>>} 每个图片的删除结果
     */
    async deleteImages(imagePaths) {
        const results = [];

        for (const path of imagePaths) {
            const result = await this.deleteImage(path);
            results.push(result);
        }

        return results;
    },


    // ==========================================
    // 文件夹操作 API
    // ==========================================

    /**
     * 删除指定路径的文件夹（递归删除）
     * @param {string} folderPath - 文件夹路径，格式：'images/一级分类'
     * @returns {Promise<Object>} 删除结果 { success: boolean, error?: string }
     */
    async deleteFolder(folderPath) {
        try {
            const result = await this.post('/api/delete-folder', { path: folderPath });
            return result;
        } catch (error) {
            console.error('删除文件夹失败:', error);
            return { success: false, error: error.message };
        }
    }
};

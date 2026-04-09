/**
 * 海拓選品 - 国际化模块
 *
 * 处理中日双语切换功能
 * - 当前语言：'jp' (日语) | 'cn' (中文)
 * - 界面文本和商品名称都支持双语
 */

/**
 * ==========================================
 * 国际化管理器
 * ==========================================
 */
const I18n = {
    // 当前语言，默认为日语
    currentLang: 'jp',

    // 支持的语言列表
    supportedLangs: ['jp', 'cn'],

    /**
     * 初始化国际化模块
     * @param {string} initialLang - 初始语言，默认为 'jp'
     */
    init(initialLang = 'jp') {
        this.currentLang = initialLang;
    },

    /**
     * 设置当前语言
     * @param {string} lang - 目标语言
     */
    setLang(lang) {
        if (this.supportedLangs.includes(lang)) {
            this.currentLang = lang;
        }
    },

    /**
     * 获取翻译后的对象名称
     * 根据当前语言返回对应的名称
     *
     * @param {Object|null} obj - 包含 name_cn 和 name_jp 的对象
     * @returns {string} 对应语言的名称，如果对象为空返回空字符串
     *
     * @example
     * // 假设 currentLang = 'jp'
     * const category = { name_cn: '吹风机', name_jp: 'ドライヤー' };
     * t(category); // 返回 'ドライヤー'
     *
     * // 假设 currentLang = 'cn'
     * t(category); // 返回 '吹风机'
     */
    t(obj) {
        if (!obj) return '';

        if (this.currentLang === 'cn') {
            // 中文模式：优先使用 name_cn
            return obj.name_cn || obj.name || '';
        } else {
            // 日语模式：优先使用 name_jp，然后是 name，最后是 name_cn
            return obj.name_jp || obj.name || obj.name_cn || '';
        }
    },

    /**
     * 获取图片描述
     * 根据当前语言返回对应的图片描述
     *
     * @param {Object|null} img - 包含 description_cn 和 description_jp 的图片对象
     * @returns {string} 对应语言的描述，如果为空返回空字符串
     *
     * @example
     * const image = {
     *   description_cn: '这是吹风机的正面照',
     *   description_jp: 'ドライヤーの正面写真'
     * };
     * tDesc(image); // 根据当前语言返回对应描述
     */
    tDesc(img) {
        if (!img) return '';

        if (this.currentLang === 'cn') {
            return img.description_cn || '';
        } else {
            return img.description_jp || img.description_cn || '';
        }
    },

    /**
     * 获取翻译后的网站标题
     * @returns {string} 对应语言的网站标题
     */
    getSiteTitle() {
        return this.currentLang === 'cn' ? 'Anxuan Selected' : 'Anxuan Selected';
    },

    /**
     * 获取"首页"文本
     * @returns {string} 对应语言的"首页"
     */
    getHomeText() {
        return this.currentLang === 'cn' ? '首页' : 'ホーム';
    },

    /**
     * 获取"全部"文本
     * @returns {string} 对应语言的"全部"
     */
    getAllText() {
        return this.currentLang === 'cn' ? '全部' : 'すべて';
    },

    /**
     * 获取"暂无产品"文本
     * @returns {string} 对应语言的提示
     */
    getNoProductsText() {
        return this.currentLang === 'cn' ? '暂无产品' : '商品がありません';
    },

    /**
     * 获取"暂无图片"文本
     * @returns {string} 对应语言的提示
     */
    getNoImageText() {
        return this.currentLang === 'cn' ? '暂无图片' : '画像がありません';
    },

    /**
     * 获取操作按钮文本
     * @param {string} action - 操作类型：'add', 'edit', 'delete', 'save', 'cancel', 'confirm'
     * @returns {Object} 包含 jp 和 cn 的文本对象
     */
    getActionText(action) {
        const texts = {
            add: { jp: '新增', cn: '新增' },
            edit: { jp: '編集', cn: '编辑' },
            delete: { jp: '削除', cn: '删除' },
            save: { jp: '保存', cn: '保存' },
            cancel: { jp: 'キャンセル', cn: '取消' },
            confirm: { jp: '確認', cn: '确认' }
        };
        return texts[action] || { jp: action, cn: action };
    },

    /**
     * 获取分类级别文本
     * @param {number} level - 分类级别：1, 2, 3
     * @returns {string} 对应语言的分类级别名称
     */
    getLevelText(level) {
        const levels = {
            1: { jp: '一级', cn: '一级' },
            2: { jp: '二级', cn: '二级' },
            3: { jp: '三级', cn: '三级' }
        };
        return levels[level] || { jp: '', cn: '' };
    },

    /**
     * 获取表单占位符文本
     * @param {string} field - 字段名：'productNameCn', 'productNameJp', 'categoryNameCn', 'categoryNameJp'
     * @returns {string} 对应语言的占位符
     */
    getPlaceholder(field) {
        const placeholders = {
            productNameCn: { jp: '中国語商品名を入力', cn: '请输入中文品名' },
            productNameJp: { jp: '日本語商品名を入力', cn: '请输入日文品名' },
            categoryNameCn: { jp: '中国語カテゴリ名を入力', cn: '请输入中文分类名称' },
            categoryNameJp: { jp: '日本語カテゴリ名を入力', cn: '请输入日文分类名称' },
            imageDescCn: { jp: '中国語画像説明を入力（任意）', cn: '请输入中文描述（可选）' },
            imageDescJp: { jp: '日本語画像説明を入力（任意）', cn: '请输入日文描述（可选）' }
        };
        return placeholders[field] || { jp: '', cn: '' };
    },

    /**
     * 获取验证错误消息
     * @param {string} error - 错误类型
     * @returns {string} 对应语言的错误消息
     */
    getValidationMessage(error) {
        const messages = {
            requiredNameCn: { jp: '中国語名は必須です', cn: '请填写中文名称' },
            requiredNameJp: { jp: '日本語名は必須です', cn: '请填写日文名称' },
            requiredCategory: { jp: '少なくとも一级カテゴリを選択してください', cn: '请至少选择一级分类' },
            requiredProductName: { jp: '商品名を入力してください', cn: '请填写产品名称' }
        };
        return messages[error] || { jp: error, cn: error };
    },

    /**
     * 获取成功/失败消息
     * @param {string} type - 消息类型
     * @returns {string} 对应语言的消息
     */
    getResultMessage(type) {
        const messages = {
            categoryAddSuccess: { jp: 'カテゴリを追加しました', cn: '分类添加成功' },
            categoryUpdateSuccess: { jp: 'カテゴリを更新しました', cn: '分类更新成功' },
            categoryDeleteSuccess: { jp: 'カテゴリを削除しました', cn: '分类删除成功' },
            productAddSuccess: { jp: '製品を追加しました', cn: '产品添加成功' },
            productUpdateSuccess: { jp: '製品 更新しました', cn: '产品更新成功' },
            productDeleteSuccess: { jp: '製品を削除しました', cn: '产品删除成功' },
            saveSuccess: { jp: '保存しました', cn: '保存成功' },
            saveFailed: { jp: '保存に失敗しました', cn: '保存失败' },
            loadFailed: { jp: 'データの読み込みに失敗しました', cn: '加载数据失败' }
        };
        return messages[type] || { jp: type, cn: type };
    }
};

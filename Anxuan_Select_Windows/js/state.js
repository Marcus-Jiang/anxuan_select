/**
 * 海拓選品 - 状态管理模块
 *
 * 统一管理应用程序的所有状态
 *
 * 状态分类：
 * 1. 展示页状态 (index.html)
 * 2. 管理页状态 (manage.html)
 * 3. 模态框状态
 * 4. 编辑状态
 */

/**
 * ==========================================
 * 应用状态管理器
 * ==========================================
 */
const AppState = {
    // ==========================================
    // 1. 数据相关状态
    // ==========================================

    // 完整的分类和产品数据（从 data.json 加载）
    data: null,

    // 数据加载状态
    isLoading: false,

    // 数据最后更新时间
    lastUpdated: null,


    // ==========================================
    // 2. 展示页状态 (index.html)
    // ==========================================

    // 当前选中的分类层级
    currentLevel1: null,   // 一级分类
    currentLevel2: null,   // 二级分类
    currentLevel3: null,   // 三级分类

    // 当前语言（会在 I18n 模块中同步）
    currentLang: 'jp',


    // ==========================================
    // 3. 管理页状态 (manage.html)
    // ==========================================

    // 当前选中的分类（用于筛选产品列表）
    selectedCategory: null,

    // 折叠状态：存储被折叠的分类的 name_cn 集合
    collapsedCategories: new Set(),

    // 模态框状态
    modalState: {
        product: {
            isOpen: false,
            mode: 'add',      // 'add' | 'edit'
            product: null     // 编辑时存储产品对象
        },
        category: {
            isOpen: false,
            mode: 'add',      // 'add' | 'edit'
            category: null,
            level: 1,
            parent1: null,
            parent2: null
        },
        deleteConfirm: {
            isOpen: false,
            type: 'product',  // 'product' | 'category'
            item: null
        },
        imageDesc: {
            isOpen: false,
            imageIndex: null,
            image: null
        }
    },

    // 产品编辑相关的临时状态
    editingProduct: {
        // 当前编辑的产品（null 表示新增）
        current: null,
        // 原始产品的分类信息（用于比较是否改变分类）
        originalInfo: null,
        // 模态框中的图片列表
        modalImages: [],
        // 待删除的图片列表（从服务器删除）
        imagesToDelete: []
    },

    // 分类编辑相关的临时状态
    editingCategory: {
        // 当前操作类型
        operation: null,     // 'add' | 'edit'
        // 当前操作的分类级别
        level: null,
        // 父分类引用
        parent1: null,
        parent2: null,
        // 要编辑的分类对象
        category: null
    },


    // ==========================================
    // 4. 删除确认状态
    // ==========================================

    // 待删除的产品信息
    productToDelete: null,

    // 待删除的分类信息
    categoryToDelete: null,


    // ==========================================
    // 5. 方法
    // ==========================================

    /**
     * 初始化状态
     * @param {Object} initialData - 初始数据
     */
    init(initialData = null) {
        this.data = initialData;
        this.isLoading = false;
        this.lastUpdated = null;

        // 展示页状态
        this.currentLevel1 = null;
        this.currentLevel2 = null;
        this.currentLevel3 = null;
        this.currentLang = 'jp';

        // 管理页状态
        this.selectedCategory = null;
        this.resetModalState();
        this.resetEditingState();
        this.resetDeleteState();

        // 如果有初始数据，设置第一个一级分类
        if (this.data && this.data.length > 0) {
            this.currentLevel1 = this.data[0];
        }
    },

    /**
     * 设置数据
     * @param {Object} data - 新数据
     */
    setData(data) {
        this.data = data;
        this.lastUpdated = new Date().toISOString();
    },

    /**
     * 重置模态框状态
     */
    resetModalState() {
        this.modalState = {
            product: { isOpen: false, mode: 'add', product: null },
            category: { isOpen: false, mode: 'add', category: null, level: 1, parent1: null, parent2: null },
            deleteConfirm: { isOpen: false, type: 'product', item: null },
            imageDesc: { isOpen: false, imageIndex: null, image: null }
        };
    },

    /**
     * 重置编辑状态
     */
    resetEditingState() {
        this.editingProduct = {
            current: null,
            originalInfo: null,
            modalImages: [],
            imagesToDelete: []
        };

        this.editingCategory = {
            operation: null,
            level: null,
            parent1: null,
            parent2: null,
            category: null
        };
    },

    /**
     * 重置删除状态
     */
    resetDeleteState() {
        this.productToDelete = null;
        this.categoryToDelete = null;
    },

    /**
     * 选择一级分类
     * @param {Object|null} level1 - 一级分类对象，null 表示不选择
     */
    selectLevel1(level1) {
        this.currentLevel1 = level1;
        this.currentLevel2 = null;
        this.currentLevel3 = null;
    },

    /**
     * 选择二级分类
     * @param {Object|null} level2 - 二级分类对象，null 表示不选择
     */
    selectLevel2(level2) {
        this.currentLevel2 = level2;
        this.currentLevel3 = null;
    },

    /**
     * 选择三级分类
     * @param {Object|null} level3 - 三级分类对象，null 表示不选择
     */
    selectLevel3(level3) {
        this.currentLevel3 = level3;
    },

    /**
     * 返回首页（选中第一个一级分类）
     */
    goHome() {
        if (this.data && this.data.length > 0) {
            this.currentLevel1 = this.data[0];
        }
        this.currentLevel2 = null;
        this.currentLevel3 = null;
    },

    /**
     * 管理页选择分类
     * @param {Object|null} category - 分类对象，null 表示选择"全部"
     */
    selectCategory(category) {
        this.selectedCategory = category;
    },

    /**
     * 切换分类的折叠状态
     * @param {string} categoryName - 分类的 name_cn
     */
    toggleCategoryCollapse(categoryName) {
        if (this.collapsedCategories.has(categoryName)) {
            this.collapsedCategories.delete(categoryName);
        } else {
            this.collapsedCategories.add(categoryName);
        }
    },

    /**
     * 检查分类是否被折叠
     * @param {string} categoryName - 分类的 name_cn
     * @returns {boolean}
     */
    isCategoryCollapsed(categoryName) {
        return this.collapsedCategories.has(categoryName);
    },

    // ==========================================
    // 模态框控制方法
    // ==========================================

    /**
     * 打开产品模态框
     * @param {Object|null} product - 产品对象，null 表示新增
     */
    openProductModal(product = null) {
        this.modalState.product.isOpen = true;
        this.modalState.product.mode = product ? 'edit' : 'add';
        this.modalState.product.product = product;

        if (product) {
            this.editingProduct.current = product;
            this.editingProduct.originalInfo = {
                level1: product.level1,
                level2: product.level2,
                level3: product.level3
            };
            // 转换图片格式
            this.editingProduct.modalImages = (product.images || []).map(img => ({
                ...img,
                isNew: false,
                file: null,
                previewUrl: img.path
            }));
        } else {
            this.editingProduct.current = null;
            this.editingProduct.originalInfo = null;
            this.editingProduct.modalImages = [];
        }
        this.editingProduct.imagesToDelete = [];
    },

    /**
     * 关闭产品模态框
     */
    closeProductModal() {
        this.modalState.product.isOpen = false;
        this.modalState.product.product = null;
        this.editingProduct.current = null;
        this.editingProduct.originalInfo = null;
        this.editingProduct.modalImages = [];
        this.editingProduct.imagesToDelete = [];
    },

    /**
     * 打开分类模态框
     * @param {string} operation - 操作类型：'add' | 'edit'
     * @param {Object|null} category - 分类对象（编辑时）
     * @param {number} level - 分类级别
     * @param {Object} parent1 - 一级父分类
     * @param {Object} parent2 - 二级父分类
     */
    openCategoryModal(operation, category = null, level = 1, parent1 = null, parent2 = null) {
        this.modalState.category.isOpen = true;
        this.modalState.category.mode = operation;
        this.modalState.category.level = level;
        this.modalState.category.parent1 = parent1;
        this.modalState.category.parent2 = parent2;
        this.modalState.category.category = category;

        this.editingCategory.operation = operation;
        this.editingCategory.level = level;
        this.editingCategory.parent1 = parent1;
        this.editingCategory.parent2 = parent2;
        this.editingCategory.category = category;
    },

    /**
     * 关闭分类模态框
     */
    closeCategoryModal() {
        this.modalState.category.isOpen = false;
        this.modalState.category.category = null;
        this.editingCategory = {
            operation: null,
            level: null,
            parent1: null,
            parent2: null,
            category: null
        };
    },

    /**
     * 打开删除确认对话框
     * 注意：categoryToDelete 和 productToDelete 由调用方自己设置
     * @param {string} type - 删除类型：'product' | 'category'
     * @param {Object} item - 待删除项目（只是参考信息）
     */
    openDeleteConfirm(type, item) {
        this.modalState.deleteConfirm.isOpen = true;
        this.modalState.deleteConfirm.type = type;
        this.modalState.deleteConfirm.item = item;

        // 注意：categoryToDelete 和 productToDelete 由 manage.js 自己管理
        // 这里不设置它们，避免覆盖
    },

    /**
     * 关闭删除确认框
     */
    closeDeleteConfirm() {
        this.modalState.deleteConfirm.isOpen = false;
        this.modalState.deleteConfirm.item = null;
        this.productToDelete = null;
        this.categoryToDelete = null;
    },

    /**
     * 打开图片描述编辑模态框
     * @param {number} index - 图片索引
     * @param {Object} image - 图片对象
     */
    openImageDescModal(index, image) {
        this.modalState.imageDesc.isOpen = true;
        this.modalState.imageDesc.imageIndex = index;
        this.modalState.imageDesc.image = image;
    },

    /**
     * 关闭图片描述编辑模态框
     */
    closeImageDescModal() {
        this.modalState.imageDesc.isOpen = false;
        this.modalState.imageDesc.imageIndex = null;
        this.modalState.imageDesc.image = null;
    },

    /**
     * 添加图片到编辑中的产品
     * @param {Object} imageData - 图片数据 { path, description_cn, description_jp, isNew, file, previewUrl }
     */
    addModalImage(imageData) {
        this.editingProduct.modalImages.push(imageData);
    },

    /**
     * 移除编辑中的图片
     * @param {number} index - 图片索引
     * @returns {Object} 被移除的图片
     */
    removeModalImage(index) {
        const removed = this.editingProduct.modalImages.splice(index, 1)[0];
        // 如果不是新上传的图片，标记为待删除
        if (removed && !removed.isNew && removed.path) {
            this.editingProduct.imagesToDelete.push(removed);
        }
        return removed;
    },

    /**
     * 更新编辑中的图片描述
     * @param {number} index - 图片索引
     * @param {string} descCn - 中文描述
     * @param {string} descJp - 日文描述
     */
    updateModalImageDesc(index, descCn, descJp) {
        if (this.editingProduct.modalImages[index]) {
            this.editingProduct.modalImages[index].description_cn = descCn;
            this.editingProduct.modalImages[index].description_jp = descJp;
        }
    },


    // ==========================================
    // 状态查询方法
    // ==========================================

    /**
     * 检查是否正在加载
     * @returns {boolean}
     */
    isLoadingData() {
        return this.isLoading;
    },

    /**
     * 检查是否有数据
     * @returns {boolean}
     */
    hasData() {
        return this.data && this.data.length > 0;
    },

    /**
     * 获取当前选中的分类路径文本
     * @returns {string}
     */
    getSelectedPathText() {
        if (!this.selectedCategory) {
            return I18n.currentLang === 'cn' ? '全部产品' : 'すべての製品';
        }
        return I18n.t(this.selectedCategory);
    }
};

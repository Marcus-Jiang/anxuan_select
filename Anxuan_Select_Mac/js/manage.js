/**
 * 海拓選品 - 管理页主逻辑
 *
 * 重构后的 manage.html 业务逻辑
 * 采用渲染器和控制器分离的模式
 */

/**
 * ==========================================
 * 管理页渲染器
 * ==========================================
 */
const ManageRenderer = {

    /**
     * 渲染所有内容
     */
    renderAll() {
        this.renderCategoryTree();
        this.renderProductList();
    },

    /**
     * 渲染分类树形结构
     */
    renderCategoryTree() {
        const container = document.getElementById('category-tree');
        if (!container) return;

        let html = '';

        // "全部产品"选项
        html += this.renderAllProductsButton();

        // 渲染一级分类
        AppState.data.forEach((level1, idx) => {
            html += this.renderCategoryItem(level1, 1, idx, null, null);
        });

        container.innerHTML = html;
    },

    /**
     * 渲染"全部产品"按钮
     */
    renderAllProductsButton() {
        const isSelected = !AppState.selectedCategory;
        const bgColor = isSelected ? 'var(--primary-color)' : 'transparent';
        const textColor = isSelected ? 'white' : 'var(--text-secondary)';

        return `
            <div class="mb-2">
                <button
                    class="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-between"
                    style="background-color: ${bgColor}; color: ${textColor}"
                    onclick="ManageController.selectCategory(null)"
                >
                    <span class="flex items-center">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        全部产品
                    </span>
                </button>
            </div>
        `;
    },

    /**
     * 渲染单个分类项
     * @param {Object} category - 分类对象
     * @param {number} level - 分类级别 1, 2, 3
     * @param {number} index - 在父级中的索引
     * @param {Object} parent1 - 一级父分类
     * @param {Object} parent2 - 二级父分类
     */
    renderCategoryItem(category, level, index, parent1, parent2) {
        const hasChildren = category.children && category.children.length > 0;
        const isSelected = AppState.selectedCategory && AppState.selectedCategory.name_cn === category.name_cn;
        const isCollapsed = AppState.isCategoryCollapsed(category.name_cn);

        // 左侧缩进
        const paddingLeft = level === 1 ? '0' : level === 2 ? '20px' : '40px';

        // 背景颜色
        const bgColor = isSelected ? 'var(--primary-color)' : 'transparent';
        const textColor = isSelected ? 'white' : 'var(--text-secondary)';

        // 徽章背景
        const badgeBg = isSelected ? 'rgba(255,255,255,0.3)' : '#F0F0EE';
        const badgeColor = isSelected ? 'white' : 'var(--text-secondary)';

        // 拖拽数据
        const sortData = JSON.stringify({
            type: 'category',
            level: level,
            item: category,
            parent1: parent1,
            parent2: parent2,
            index: index
        });

        let html = `<div class="mb-1 category-item-wrapper sortable-item" style="padding-left: ${paddingLeft}" data-sort-data='${sortData}'>`;

        html += `<div class="flex items-center">`;

        // 拖拽手柄
        html += `
            <div class="drag-handle mr-1 flex-shrink-0" title="拖拽排序">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
                </svg>
            </div>
        `;

        // 折叠/展开箭头
        if (hasChildren) {
            const expandedClass = isCollapsed ? '' : 'expanded';
            html += `
                <button
                    class="collapse-arrow flex-shrink-0 p-1 rounded hover:bg-black/5 transition-transform duration-200 ${expandedClass}"
                    onclick="event.stopPropagation(); ManageController.toggleCategoryCollapse('${escapeHtml(category.name_cn)}')"
                    title="${isCollapsed ? '展开' : '折叠'}"
                >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            `;
        } else {
            html += `<div class="w-6 flex-shrink-0"></div>`;
        }

        // 分类选择按钮
        html += `
            <button
                class="flex-grow text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-between"
                style="background-color: ${bgColor}; color: ${textColor}"
                onclick="ManageController.selectCategory(${JSON.stringify(category).replace(/"/g, '&quot;')})"
            >
                <span class="flex items-center">
                    ${escapeHtml(category.name_cn)}
                </span>
                ${hasChildren ? `
                    <span class="text-xs px-2 py-0.5 rounded-full ml-2" style="background-color: ${badgeBg}; color: ${badgeColor}">
                        ${DataService.countProductsInCategory(category)}
                    </span>
                ` : ''}
            </button>
        `;

        // 操作按钮组 - 选中时使用深色按钮以便可见
        const btnBgWhenSelected = isSelected ? 'rgba(0,0,0,0.2)' : '';
        const btnIconWhenSelected = isSelected ? 'rgba(255,255,255,0.9)' : '';

        html += `
            <div class="flex items-center space-x-1 ml-1">
                ${level < 3 ? `
                <button
                    class="category-action-btn"
                    style="background-color: ${isSelected ? btnBgWhenSelected : '#E8EDEB'}; color: ${isSelected ? btnIconWhenSelected : 'var(--primary-dark)'}"
                    onclick="event.stopPropagation(); ManageController.openAddCategoryModal(${JSON.stringify(category).replace(/"/g, '&quot;')}, ${level === 1 ? JSON.stringify(category).replace(/"/g, '&quot;') : JSON.stringify(parent1).replace(/"/g, '&quot;')}, ${level === 2 ? JSON.stringify(category).replace(/"/g, '&quot;') : JSON.stringify(parent2).replace(/"/g, '&quot;')}, ${level + 1})"
                    title="新增子分类"
                >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                </button>
                ` : ''}

                <button
                    class="category-action-btn"
                    style="background-color: ${isSelected ? btnBgWhenSelected : '#F5F5F3'}; color: ${isSelected ? btnIconWhenSelected : 'var(--text-secondary)'}"
                    onclick="event.stopPropagation(); ManageController.openEditCategoryModal(${JSON.stringify(category).replace(/"/g, '&quot;')}, ${level}, ${JSON.stringify(parent1).replace(/"/g, '&quot;')}, ${JSON.stringify(parent2).replace(/"/g, '&quot;')})"
                    title="编辑分类"
                >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </button>

                <button
                    class="category-action-btn"
                    style="background-color: ${isSelected ? btnBgWhenSelected : '#FDF2F2'}; color: ${isSelected ? btnIconWhenSelected : '#DC2626'}"
                    onclick="event.stopPropagation(); ManageController.openDeleteCategoryModal(${JSON.stringify(category).replace(/"/g, '&quot;')}, ${level}, ${JSON.stringify(parent1).replace(/"/g, '&quot;')}, ${JSON.stringify(parent2).replace(/"/g, '&quot;')})"
                    title="删除分类"
                >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        `;

        html += `</div>`; // flex items-center

        // 子分类（根据折叠状态显示/隐藏）
        if (hasChildren) {
            const expandedClass = isCollapsed ? '' : 'expanded';
            html += `
                <div class="category-children pl-4 ${expandedClass}">
                    ${category.children.map((child, idx) =>
                        this.renderCategoryItem(
                            child,
                            level + 1,
                            idx,
                            level === 1 ? category : parent1,
                            level === 2 ? category : parent2
                        )
                    ).join('')}
                </div>
            `;
        }

        html += `</div>`; // mb-1 category-item-wrapper

        return html;
    },

    /**
     * 渲染产品列表
     */
    renderProductList() {
        const container = document.getElementById('product-list');
        const countEl = document.getElementById('product-count');
        const selectedEl = document.getElementById('selected-category');

        if (!container) return;

        let products = DataService.collectAllProducts();

        // 按分类筛选
        if (AppState.selectedCategory) {
            products = DataService.filterProductsByCategory(AppState.selectedCategory);
            if (selectedEl) {
                selectedEl.textContent = AppState.selectedCategory.name_cn;
            }
        } else {
            if (selectedEl) {
                selectedEl.textContent = '全部产品';
            }
        }

        // 更新计数
        if (countEl) {
            countEl.textContent = products.length;
        }

        // 无产品时
        if (products.length === 0) {
            container.innerHTML = `
                <div class="p-12 text-center">
                    <svg class="w-16 h-16 mx-auto mb-4" style="color: #D0D0CB" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <p class="text-base mb-2" style="color: var(--text-secondary)">暂无产品</p>
                    <p class="text-sm" style="color: #A0A09A">点击"新增产品"添加新产品</p>
                </div>
            `;
            return;
        }

        // 渲染产品列表
        let html = '';
        products.forEach((product, index) => {
            const coverImg = product.images && product.images.length > 0 ? product.images[0] : null;
            const coverPath = coverImg ? coverImg.path : '';

            // 拖拽数据
            const sortData = JSON.stringify({
                type: 'product',
                level: product.level3 ? 3 : (product.level2 ? 2 : 1),
                item: product,
                parent1: product.level1,
                parent2: product.level2,
                index: index
            });

            html += `
                <div class="product-item p-5 fade-in product-sortable-item" style="animation-delay: ${index * 30}ms" data-sort-data='${sortData}'>
                    <div class="flex items-start space-x-5">
                        <div class="flex-shrink-0 flex items-center">
                            <div class="drag-handle mr-3 flex-shrink-0" title="拖拽排序">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
                                </svg>
                            </div>
                            <div class="w-24 h-24 bg-white rounded-lg overflow-hidden flex items-center justify-center border" style="border-color: var(--border-color)">
                                <img
                                    src="${coverPath}"
                                    alt="${escapeHtml(product.name_cn)}"
                                    class="w-full h-full object-contain"
                                    onerror="this.src='${getImagePlaceholderSvg()}'"
                                />
                            </div>
                        </div>

                        <div class="flex-grow min-w-0">
                            <h3 class="text-base font-medium mb-2" style="color: var(--text-primary)">
                                ${escapeHtml(product.name_cn)}
                            </h3>

                            <p class="text-sm mb-3" style="color: var(--text-secondary)">
                                <span class="mr-2 text-xs px-2 py-0.5 rounded" style="background-color: #F0F0EE">日文</span>
                                ${escapeHtml(product.name_jp || '-')}
                            </p>

                            <div class="flex flex-wrap gap-2">
                                ${product.level1 ? `
                                    <span class="text-xs px-2 py-1 rounded-full" style="background-color: #E8EDEB; color: var(--primary-dark)">
                                        ${escapeHtml(product.level1.name_cn)}
                                    </span>
                                ` : ''}
                                ${product.level2 ? `
                                    <span class="text-xs px-2 py-1 rounded-full" style="background-color: #F0F0EE; color: var(--text-secondary)">
                                        ${escapeHtml(product.level2.name_cn)}
                                    </span>
                                ` : ''}
                                ${product.level3 ? `
                                    <span class="text-xs px-2 py-1 rounded-full" style="background-color: #F8F8F7; color: var(--text-secondary)">
                                        ${escapeHtml(product.level3.name_cn)}
                                    </span>
                                ` : ''}
                            </div>
                        </div>

                        <div class="flex-shrink-0 flex flex-col space-y-2">
                            <button
                                class="btn-hover px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center"
                                style="background-color: #F5F5F3; color: var(--text-secondary)"
                                onclick='ManageRenderer.openEditProductModal(${JSON.stringify(product).replace(/'/g, "\\'")})'
                            >
                                <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                编辑
                            </button>

                            <button
                                class="btn-hover px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center"
                                style="background-color: #FDF2F2; color: #DC2626"
                                onclick='ManageRenderer.openDeleteProductModal(${JSON.stringify(product).replace(/'/g, "\\'")})'
                            >
                                <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                删除
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    },

    /**
     * 打开产品编辑模态框
     */
    openEditProductModal(product) {
        ManageController.openProductModal(product);
    },

    /**
     * 打开删除产品确认对话框
     */
    openDeleteProductModal(product) {
        console.log('openDeleteProductModal called with product:', product);
        AppState.productToDelete = product;
        AppState.openDeleteConfirm('product', product);
    },

    /**
     * 渲染产品模态框的图片预览
     * @param {Array} images - 图片数组
     */
    renderModalImages(images) {
        const container = document.getElementById('image-preview-area');
        if (!container) return;

        if (!images || images.length === 0) {
            container.innerHTML = '';
            return;
        }

        let html = '';
        images.forEach((img, index) => {
            const previewUrl = img.previewUrl || img.path;
            html += `
                <div class="image-preview-container">
                    <div
                        class="aspect-square bg-white rounded-lg overflow-hidden border cursor-pointer flex items-center justify-center"
                        style="border-color: var(--border-color)"
                        onclick="ManageRenderer.openImageDescModal(${index})"
                    >
                        <img
                            src="${previewUrl}"
                            alt="图片 ${index + 1}"
                            class="w-full h-full object-contain"
                            onerror="this.src='${getImagePlaceholderSvg()}'"
                        />
                    </div>
                    <button
                        class="image-delete-btn w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center"
                        onclick="event.stopPropagation(); ManageRenderer.removeImage(${index})"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            `;
        });

        container.innerHTML = html;
    },

    /**
     * 移除图片
     */
    removeImage(index) {
        AppState.removeModalImage(index);
        this.renderModalImages(AppState.editingProduct.modalImages);
    },

    /**
     * 打开图片描述编辑模态框
     */
    openImageDescModal(index) {
        const img = AppState.editingProduct.modalImages[index];
        if (!img) return;

        AppState.openImageDescModal(index, img);

        document.getElementById('desc-modal-image').src = img.previewUrl || img.path;
        document.getElementById('image-desc-cn').value = img.description_cn || '';
        document.getElementById('image-desc-jp').value = img.description_jp || '';

        document.getElementById('image-description-modal').classList.remove('hidden');
    }
};


/**
 * ==========================================
 * 管理页控制器
 * ==========================================
 */
const ManageController = {

    /**
     * 初始化
     */
    async init() {
        try {
            AppState.isLoading = true;

            // 加载数据
            await DataService.loadData();

            // 渲染界面
            ManageRenderer.renderAll();

            AppState.isLoading = false;

        } catch (error) {
            console.error('加载数据失败:', error);
            AppState.isLoading = false;

            const treeContainer = document.getElementById('category-tree');
            if (treeContainer) {
                treeContainer.innerHTML = `
                    <p class="text-sm text-center py-8 text-red-500">
                        数据加载失败，请确保 data.json 存在或服务器已启动
                    </p>
                `;
            }

            const listContainer = document.getElementById('product-list');
            if (listContainer) {
                listContainer.innerHTML = `
                    <div class="p-8 text-center">
                        <p class="text-base text-red-500">数据加载失败</p>
                    </div>
                `;
            }
        }
    },

    /**
     * 选择分类
     * @param {Object|null} category - 分类对象
     */
    selectCategory(category) {
        AppState.selectCategory(category);
        ManageRenderer.renderAll();
    },

    /**
     * 切换分类的折叠状态
     * @param {string} categoryName - 分类的 name_cn
     */
    toggleCategoryCollapse(categoryName) {
        AppState.toggleCategoryCollapse(categoryName);
        ManageRenderer.renderCategoryTree();
    },

    // ==========================================
    // 产品管理
    // ==========================================

    /**
     * 打开新增产品模态框
     */
    openAddProductModal() {
        AppState.openProductModal(null);
        this.initProductModal();
        document.getElementById('modal-title').textContent = '新增产品';
        document.getElementById('product-modal').classList.remove('hidden');
    },

    /**
     * 打开编辑产品模态框
     */
    openProductModal(product) {
        AppState.openProductModal(product);
        this.initProductModal();
        document.getElementById('modal-title').textContent = '编辑产品';
        document.getElementById('product-modal').classList.remove('hidden');
    },

    /**
     * 初始化产品模态框
     */
    initProductModal() {
        const product = AppState.editingProduct.current;

        // 设置名称
        document.getElementById('product-name-cn').value = product ? product.name_cn || '' : '';
        document.getElementById('product-name-jp').value = product ? product.name_jp || '' : '';

        // 初始化分类选择器
        this.initCategorySelectors();

        // 渲染图片预览
        ManageRenderer.renderModalImages(AppState.editingProduct.modalImages);
    },

    /**
     * 初始化分类选择器
     */
    initCategorySelectors() {
        const level1Select = document.getElementById('category-level1');
        const level2Select = document.getElementById('category-level2');
        const level3Select = document.getElementById('category-level3');

        if (!level1Select) return;

        // 清空选项
        level1Select.innerHTML = '<option value="">请选择一级分类</option>';
        level2Select.innerHTML = '<option value="">请选择二级分类</option>';
        level3Select.innerHTML = '<option value="">请选择三级分类</option>';
        level2Select.disabled = true;
        level3Select.disabled = true;

        // 填充一级分类
        AppState.data.forEach((level1, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = level1.name_cn;
            level1Select.appendChild(option);
        });

        // 获取当前产品（编辑模式）或当前选中的分类（新增模式）
        const product = AppState.editingProduct.current;
        const selectedCategory = AppState.selectedCategory;

        // 优先使用编辑模式的产品分类信息，其次使用左侧栏选中的分类
        let level1ToSelect = null;
        let level2ToSelect = null;
        let level3ToSelect = null;

        if (product && product.level1) {
            // 编辑模式：使用产品所在的分类
            level1ToSelect = product.level1;
            level2ToSelect = product.level2;
            level3ToSelect = product.level3;
        } else if (selectedCategory) {
            // 新增模式：使用左侧栏选中的分类
            if (this.isLevel1Category(selectedCategory)) {
                // 选中一级分类
                level1ToSelect = selectedCategory;
            } else if (this.isLevel2Category(selectedCategory)) {
                // 选中二级分类，查找其父一级分类
                level2ToSelect = selectedCategory;
                level1ToSelect = this.findParentCategory(selectedCategory, 1);
            } else {
                // 选中三级分类
                level3ToSelect = selectedCategory;
                level2ToSelect = this.findParentCategory(selectedCategory, 2);
                level1ToSelect = this.findParentCategory(selectedCategory, 1);
            }
        }

        // 执行分类选中
        if (level1ToSelect) {
            const level1Index = AppState.data.findIndex(l1 => l1.name_cn === level1ToSelect.name_cn);
            if (level1Index !== -1) {
                level1Select.value = level1Index;
                this.onLevel1Change();

                if (level2ToSelect) {
                    const level2Data = AppState.data[level1Index].children;
                    if (level2Data) {
                        const level2Index = level2Data.findIndex(l2 => l2.name_cn === level2ToSelect.name_cn);
                        if (level2Index !== -1) {
                            level2Select.value = level2Index;
                            this.onLevel2Change();

                            if (level3ToSelect) {
                                const level3Data = level2Data[level2Index].children;
                                if (level3Data) {
                                    const level3Index = level3Data.findIndex(l3 => l3.name_cn === level3ToSelect.name_cn);
                                    if (level3Index !== -1) {
                                        level3Select.value = level3Index;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },

    /**
     * 检查是否为一级分类
     * 一级分类在 AppState.data 中直接存在
     */
    isLevel1Category(category) {
        if (!category) return false;
        return AppState.data.some(l1 => l1.name_cn === category.name_cn);
    },

    /**
     * 检查是否为二级分类
     * 二级分类是某个一级分类的 children 中的元素
     */
    isLevel2Category(category) {
        if (!category) return false;
        for (const level1 of AppState.data) {
            if (level1.children) {
                const found = level1.children.some(l2 => l2.name_cn === category.name_cn);
                if (found) return true;
            }
        }
        return false;
    },

    /**
     * 查找分类的父分类
     * @param {Object} category - 要查找父分类的分类
     * @param {number} parentLevel - 父分类的级别 (1, 2)
     * @returns {Object|null} 父分类对象
     */
    findParentCategory(category, parentLevel) {
        if (!category || parentLevel >= 3) return null;

        // 遍历所有一级分类
        for (const level1 of AppState.data) {
            if (parentLevel === 1 && level1.name_cn === category.name_cn) {
                return null; // 本身是一级分类，没有指定级别的父分类
            }

            // 遍历二级分类
            if (level1.children) {
                for (const level2 of level1.children) {
                    if (parentLevel === 2 && level2.name_cn === category.name_cn) {
                        return level1; // category 是二级分类，返回其一级父分类
                    }

                    // 遍历三级分类
                    if (level2.children) {
                        for (const level3 of level2.children) {
                            if (level3.name_cn === category.name_cn) {
                                // category 是三级分类
                                if (parentLevel === 1) {
                                    return level1;
                                } else if (parentLevel === 2) {
                                    return level2;
                                }
                            }
                        }
                    }
                }
            }
        }
        return null;
    },

    /**
     * 一级分类变化
     */
    onLevel1Change() {
        const level1Select = document.getElementById('category-level1');
        const level2Select = document.getElementById('category-level2');
        const level3Select = document.getElementById('category-level3');

        level2Select.innerHTML = '<option value="">请选择二级分类</option>';
        level3Select.innerHTML = '<option value="">请选择三级分类</option>';
        level3Select.disabled = true;

        if (!level1Select.value) {
            level2Select.disabled = true;
            return;
        }

        level2Select.disabled = false;
        const level1 = AppState.data[parseInt(level1Select.value)];

        if (level1.children) {
            level1.children.forEach((level2, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = level2.name_cn;
                level2Select.appendChild(option);
            });
        }
    },

    /**
     * 二级分类变化
     */
    onLevel2Change() {
        const level1Select = document.getElementById('category-level1');
        const level2Select = document.getElementById('category-level2');
        const level3Select = document.getElementById('category-level3');

        level3Select.innerHTML = '<option value="">请选择三级分类</option>';

        if (!level2Select.value) {
            level3Select.disabled = true;
            return;
        }

        level3Select.disabled = false;
        const level1 = AppState.data[parseInt(level1Select.value)];
        const level2 = level1.children[parseInt(level2Select.value)];

        if (level2.children) {
            level2.children.forEach((level3, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = level3.name_cn;
                level3Select.appendChild(option);
            });
        }
    },

    /**
     * 获取当前选中的分类信息
     */
    getSelectedCategories() {
        const level1Select = document.getElementById('category-level1');
        const level2Select = document.getElementById('category-level2');
        const level3Select = document.getElementById('category-level3');

        let level1 = null, level2 = null, level3 = null;

        if (level1Select.value !== '') {
            level1 = AppState.data[parseInt(level1Select.value)];

            if (level2Select.value !== '') {
                level2 = level1.children[parseInt(level2Select.value)];

                if (level3Select.value !== '') {
                    level3 = level2.children[parseInt(level3Select.value)];
                }
            }
        }

        return { level1, level2, level3 };
    },

    /**
     * 处理图片上传
     */
    handleImageUpload(event) {
        const files = Array.from(event.target.files);

        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                AppState.addModalImage({
                    path: '',
                    description_cn: '',
                    description_jp: '',
                    isNew: true,
                    file: file,
                    previewUrl: e.target.result
                });
                ManageRenderer.renderModalImages(AppState.editingProduct.modalImages);
            };
            reader.readAsDataURL(file);
        });

        event.target.value = '';
    },

    /**
     * 关闭产品模态框
     */
    closeProductModal() {
        AppState.closeProductModal();
        document.getElementById('product-modal').classList.add('hidden');
    },

    /**
     * 保存产品
     */
    async saveProduct() {
        const nameCn = document.getElementById('product-name-cn').value.trim();
        const nameJp = document.getElementById('product-name-jp').value.trim();
        const { level1, level2, level3 } = this.getSelectedCategories();

        // 验证
        if (!nameCn || !nameJp) {
            showToast('请填写完整的产品名称', 'error');
            return;
        }
        if (!level1) {
            showToast('请至少选择一级分类', 'error');
            return;
        }

        const btn = document.getElementById('btn-save-product');
        btn.disabled = true;
        btn.textContent = '保存中...';

        try {
            const targetCategory = level3 || level2 || level1;
            const newProduct = {
                name_cn: nameCn,
                name_jp: nameJp,
                images: []
            };

            const categoryPath = buildCategoryPath(level1, level2, level3);

            // 处理图片
            for (let i = 0; i < AppState.editingProduct.modalImages.length; i++) {
                const img = AppState.editingProduct.modalImages[i];

                if (img.isNew && img.file) {
                    // 上传新图片
                    const ext = img.file.name.split('.').pop().toLowerCase();
                    const fileName = `${nameCn}_${i + 1}.${ext}`;
                    const savePath = `images/${categoryPath}/${fileName}`;

                    const result = await API.uploadImage(img.file, savePath);
                    if (result.success) {
                        newProduct.images.push({
                            path: savePath.replace(/\\/g, '/'),
                            description_cn: img.description_cn || '',
                            description_jp: img.description_jp || ''
                        });
                    }
                } else {
                    // 旧图片
                    newProduct.images.push({
                        path: img.path,
                        description_cn: img.description_cn || '',
                        description_jp: img.description_jp || ''
                    });
                }
            }

            // 如果是编辑模式
            if (AppState.editingProduct.current && AppState.editingProduct.originalInfo) {
                const originalInfo = AppState.editingProduct.originalInfo;
                const sameCategory =
                    originalInfo.level1 &&
                    originalInfo.level1.name_cn === level1.name_cn &&
                    (originalInfo.level2 ? originalInfo.level2.name_cn === (level2 ? level2.name_cn : null) : !level2) &&
                    (originalInfo.level3 ? originalInfo.level3.name_cn === (level3 ? level3.name_cn : null) : !level3);

                if (sameCategory) {
                    // 同一分类内编辑：直接更新该位置的产品
                    const targetCategory = level3 || level2 || level1;
                    const idx = targetCategory.products.findIndex(p =>
                        p.name_cn === AppState.editingProduct.current.name_cn ||
                        p.name_jp === AppState.editingProduct.current.name_jp
                    );

                    if (idx !== -1) {
                        // 更新产品数据（保留原位置）
                        targetCategory.products[idx] = newProduct;
                        console.log(`产品在同一分类内更新，保留原位置: ${idx}`);
                    } else {
                        // 找不到则添加
                        DataService.addProduct(targetCategory, newProduct);
                    }
                } else {
                    // 改变了分类：先删除原产品，再添加到新分类（末尾）
                    DataService.removeProduct(
                        AppState.editingProduct.current,
                        originalInfo
                    );
                    DataService.addProduct(targetCategory, newProduct);
                }
            } else {
                // 新增模式
                DataService.addProduct(targetCategory, newProduct);
            }

            // 保存数据
            const saveSuccess = await DataService.saveData();

            if (saveSuccess) {
                showToast(AppState.editingProduct.current ? '产品更新成功' : '产品添加成功', 'success');
                this.closeProductModal();

                // 重新加载数据确保同步
                await DataService.loadData();
                ManageRenderer.renderAll();
            } else {
                showToast('保存失败', 'error');
            }

        } catch (error) {
            console.error('保存产品失败:', error);
            showToast('保存失败: ' + error.message, 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = '保存';
        }
    },


    // ==========================================
    // 分类管理
    // ==========================================

    /**
     * 打开新增分类模态框
     */
    openAddCategoryModal(parentCategory, parent1, parent2, level) {
        AppState.openCategoryModal('add', null, level, parent1, parent2);

        const levelNames = ['', '一级', '二级', '三级'];
        document.getElementById('category-modal-title').textContent = `新增${levelNames[level]}分类`;
        document.getElementById('category-name-cn').value = '';
        document.getElementById('category-name-jp').value = '';
        this.renderParentCategoryInfo(parentCategory, level);

        document.getElementById('category-modal').classList.remove('hidden');
    },

    /**
     * 打开编辑分类模态框
     */
    openEditCategoryModal(category, level, parent1, parent2) {
        AppState.openCategoryModal('edit', category, level, parent1, parent2);

        const levelNames = ['', '一级', '二级', '三级'];
        document.getElementById('category-modal-title').textContent = `编辑${levelNames[level]}分类`;
        document.getElementById('category-name-cn').value = category.name_cn || '';
        document.getElementById('category-name-jp').value = category.name_jp || '';

        const parentCategory = level === 1 ? null : (level === 2 ? parent1 : parent2);
        this.renderParentCategoryInfo(parentCategory, level);

        document.getElementById('category-modal').classList.remove('hidden');
    },

    /**
     * 渲染父分类信息
     */
    renderParentCategoryInfo(parentCategory, level) {
        const container = document.getElementById('parent-category-info');

        if (level === 1) {
            container.innerHTML = `
                <p class="text-xs" style="color: var(--text-secondary)">
                    📂 将在顶级添加新的一级分类
                </p>
            `;
        } else {
            const levelNames = ['', '', '一级', '二级'];
            container.innerHTML = `
                <p class="text-xs" style="color: var(--text-secondary)">
                    📂 父分类：<span class="font-medium" style="color: var(--text-primary)">${escapeHtml(parentCategory.name_cn)}</span>
                    <span class="text-xs px-1.5 py-0.5 rounded ml-1" style="background-color: #E8EDEB; color: var(--primary-dark)">${levelNames[level]}分类</span>
                </p>
            `;
        }
    },

    /**
     * 关闭分类模态框
     */
    closeCategoryModal() {
        AppState.closeCategoryModal();
        document.getElementById('category-modal').classList.add('hidden');
    },

    /**
     * 保存分类
     */
    async saveCategory() {
        const nameCn = document.getElementById('category-name-cn').value.trim();
        const nameJp = document.getElementById('category-name-jp').value.trim();

        if (!nameCn || !nameJp) {
            showToast('请填写完整的分类名称', 'error');
            return;
        }

        const btn = document.getElementById('btn-save-category');
        btn.disabled = true;
        btn.textContent = '保存中...';

        try {
            const categoryData = { name_cn: nameCn, name_jp: nameJp };
            const { operation, level, parent1, parent2, category } = AppState.editingCategory;

            if (operation === 'add') {
                const success = DataService.addCategory(categoryData, level, parent1, parent2);
                if (success) {
                    showToast('分类添加成功', 'success');
                } else {
                    showToast('分类添加失败', 'error');
                }
            } else {
                const success = DataService.updateCategory(category, categoryData, level, parent1, parent2);
                if (success) {
                    showToast('分类更新成功', 'success');
                } else {
                    showToast('分类更新失败', 'error');
                }
            }

            // 保存到服务器
            const saveSuccess = await DataService.saveData();

            if (saveSuccess) {
                this.closeCategoryModal();
                await DataService.loadData();
                ManageRenderer.renderAll();
            }

        } catch (error) {
            console.error('保存分类失败:', error);
            showToast('保存失败: ' + error.message, 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = '保存';
        }
    },

    /**
     * 打开删除分类确认对话框
     */
    openDeleteCategoryModal(category, level, parent1, parent2) {
        const hasChildren = category.children && category.children.length > 0;
        const hasProducts = category.products && category.products.length > 0;
        const totalProducts = DataService.countProductsInCategory(category);

        // 先设置状态
        AppState.categoryToDelete = { category, level, parent1, parent2 };
        AppState.openDeleteConfirm('category', category);

        if (hasChildren || hasProducts || totalProducts > 0) {
            let message = `无法删除分类"${category.name_cn}"，因为该分类下还有：`;
            if (hasChildren) message += `<br/>• ${category.children.length} 个子分类`;
            if (totalProducts > 0) message += `<br/>• ${totalProducts} 个产品`;
            message += `<br/><br/>请先删除或移动这些内容后再尝试删除分类。`;

            document.getElementById('delete-message').innerHTML = message;
            document.getElementById('btn-confirm-delete').disabled = true;
            document.getElementById('btn-confirm-delete').style.opacity = '0.5';
            document.getElementById('btn-confirm-delete').textContent = '无法删除';
        } else {
            document.getElementById('delete-message').innerHTML = `
                您确定要删除分类"<span class="font-medium" style="color: var(--text-primary)">${escapeHtml(category.name_cn)}</span>" 吗？
                <br/>此操作不可恢复！
            `;
            document.getElementById('btn-confirm-delete').disabled = false;
            document.getElementById('btn-confirm-delete').style.opacity = '1';
            document.getElementById('btn-confirm-delete').textContent = '确认删除';
            document.getElementById('delete-confirm-modal').classList.remove('hidden');
        }
    },

    /**
     * 打开删除确认对话框
     * @param {string} type - 删除类型
     * @param {Object} item - 待删除项目
     */
    openDeleteConfirm(type, item) {
        if (type === 'product') {
            document.getElementById('delete-message').innerHTML = `
                您确定要删除产品"<span class="font-medium" style="color: var(--text-primary)">${escapeHtml(item.name_cn)}</span>" 吗？
                <br/>此操作不可恢复！
            `;
            document.getElementById('btn-confirm-delete').disabled = false;
            document.getElementById('btn-confirm-delete').style.opacity = '1';
            document.getElementById('btn-confirm-delete').textContent = '确认删除';
        }

        AppState.openDeleteConfirm(type, item);
        document.getElementById('delete-confirm-modal').classList.remove('hidden');
    },

    /**
     * 关闭删除确认对话框
     */
    closeDeleteConfirm() {
        AppState.closeDeleteConfirm();
        document.getElementById('delete-confirm-modal').classList.add('hidden');
    },

    /**
     * 确认删除
     */
    async confirmDelete() {
        console.log('confirmDelete called');
        console.log('AppState.modalState.deleteConfirm:', AppState.modalState.deleteConfirm);
        console.log('AppState.productToDelete:', AppState.productToDelete);

        const { deleteConfirm } = AppState.modalState;

        if (deleteConfirm.type === 'category') {
            await this.deleteCategory();
        } else if (deleteConfirm.type === 'product') {
            await this.deleteProduct();
        } else {
            console.error('Unknown delete type:', deleteConfirm.type);
            showToast('删除类型错误', 'error');
        }
    },

    /**
     * 删除分类
     */
    async deleteCategory() {
        const { category, level, parent1, parent2 } = AppState.categoryToDelete;

        console.log('deleteCategory called with:', { category, level, parent1, parent2 });

        if (!category) {
            console.error('category is undefined or null!');
            showToast('分类数据无效', 'error');
            return;
        }

        try {
            // 删除分类
            const result = DataService.deleteCategory(category, level, parent1, parent2);
            console.log('deleteCategory result:', result);

            if (!result.success) {
                showToast(result.error, 'error');
                return;
            }

            // 保存数据
            const saveSuccess = await DataService.saveData();

            if (saveSuccess) {
                // 删除图片文件夹
                if (result.folderPath) {
                    try {
                        await API.deleteFolder(result.folderPath);
                    } catch (e) {
                        console.log('删除图片文件夹失败:', e);
                    }
                }

                showToast('分类删除成功', 'success');
                this.closeDeleteConfirm();

                // 如果删除的是当前选中的分类，重置选择
                if (AppState.selectedCategory && AppState.selectedCategory.name_cn === category.name_cn) {
                    AppState.selectCategory(null);
                }

                await DataService.loadData();
                ManageRenderer.renderAll();
            }

        } catch (error) {
            console.error('删除分类失败:', error);
            showToast('删除失败: ' + error.message, 'error');
        }
    },

    /**
     * 删除产品
     */
    async deleteProduct() {
        const product = AppState.productToDelete;
        console.log('deleteProduct called, product:', product);

        if (!product) {
            console.error('productToDelete is null!');
            showToast('找不到要删除的产品', 'error');
            return;
        }

        try {
            // 删除图片
            if (product.images) {
                for (const img of product.images) {
                    try {
                        await API.deleteImage(img.path);
                    } catch (e) {
                        console.log('删除图片失败:', e);
                    }
                }
            }

            // 从数据中删除产品
            const productInfo = {
                level1: product.level1,
                level2: product.level2,
                level3: product.level3
            };
            const removeSuccess = DataService.removeProduct(product, productInfo);

            if (!removeSuccess) {
                showToast('无法找到要删除的产品', 'error');
                return;
            }

            // 保存数据
            const saveSuccess = await DataService.saveData();

            if (saveSuccess) {
                showToast('产品删除成功', 'success');
                this.closeDeleteConfirm();
                await DataService.loadData();
                ManageRenderer.renderAll();
            } else {
                showToast('保存失败，产品可能未被删除', 'error');
            }

        } catch (error) {
            console.error('删除产品失败:', error);
            showToast('删除失败: ' + error.message, 'error');
        }
    },


    // ==========================================
    // 图片描述管理
    // ==========================================

    /**
     * 关闭图片描述模态框
     */
    closeImageDescModal() {
        AppState.closeImageDescModal();
        document.getElementById('image-description-modal').classList.add('hidden');
    },

    /**
     * 保存图片描述
     */
    saveImageDescription() {
        const { imageIndex } = AppState.modalState.imageDesc;
        if (imageIndex === null) return;

        const descCn = document.getElementById('image-desc-cn').value;
        const descJp = document.getElementById('image-desc-jp').value;

        AppState.updateModalImageDesc(imageIndex, descCn, descJp);
        ManageRenderer.renderModalImages(AppState.editingProduct.modalImages);
        this.closeImageDescModal();
    },


    // ==========================================
    // 拖拽排序管理
    // ==========================================

    /**
     * 初始化拖拽排序功能
     */
    initDragSort() {
        // 监听分类树的拖拽排序
        const categoryTree = document.getElementById('category-tree');
        if (categoryTree) {
            categoryTree.addEventListener('mousedown', (e) => this.handleDragStart(e));
        }

        // 监听产品列表的拖拽排序
        const productList = document.getElementById('product-list');
        if (productList) {
            productList.addEventListener('mousedown', (e) => this.handleDragStart(e));
        }

        // 全局鼠标移动和释放事件
        document.addEventListener('mousemove', (e) => this.handleDragMove(e));
        document.addEventListener('mouseup', (e) => this.handleDragEnd(e));
    },

    /**
     * 处理拖拽开始
     */
    handleDragStart(e) {
        // 查找拖拽手柄
        const handle = e.target.closest('.drag-handle');
        if (!handle) return;

        // 查找可拖拽项
        const sortableItem = handle.closest('.sortable-item, .product-sortable-item');
        if (!sortableItem || !sortableItem.dataset.sortData) return;

        e.preventDefault();

        const sortData = JSON.parse(sortableItem.dataset.sortData);
        DragSort.startDrag(sortableItem, sortData);

        // 添加视觉反馈
        sortableItem.classList.add('dragging');
    },

    /**
     * 处理拖拽移动
     */
    handleDragMove(e) {
        if (!DragSort.draggedElement) return;

        const targetElement = this.getDragTargetElement(e);

        // 移除所有 drag-over 样式
        document.querySelectorAll('.drag-over, .drag-over-bottom').forEach(el => {
            if (el !== DragSort.draggedElement) {
                el.classList.remove('drag-over', 'drag-over-bottom');
            }
        });

        // 如果目标元素可以放置，添加样式
        if (targetElement && targetElement !== DragSort.draggedElement) {
            const targetData = targetElement.dataset.sortData ? JSON.parse(targetElement.dataset.sortData) : null;

            if (targetData && DragSort.canDrop(targetData)) {
                const rect = targetElement.getBoundingClientRect();
                const midpoint = rect.top + rect.height / 2;

                if (e.clientY < midpoint) {
                    targetElement.classList.add('drag-over');
                    targetElement.classList.remove('drag-over-bottom');
                } else {
                    targetElement.classList.add('drag-over-bottom');
                    targetElement.classList.remove('drag-over');
                }
            }
        }
    },

    /**
     * 处理拖拽结束
     */
    handleDragEnd(e) {
        if (!DragSort.draggedElement) return;

        const targetElement = document.querySelector('.drag-over, .drag-over-bottom');

        if (targetElement) {
            const targetData = targetElement.dataset.sortData ? JSON.parse(targetElement.dataset.sortData) : null;
            const isAbove = targetElement.classList.contains('drag-over');

            if (targetData && DragSort.canDrop(targetData)) {
                this.performSort(DragSort.draggedData, targetData, isAbove);
            }
        }

        // 清理
        document.querySelectorAll('.dragging, .drag-over, .drag-over-bottom').forEach(el => {
            el.classList.remove('dragging', 'drag-over', 'drag-over-bottom');
        });

        DragSort.endDrag();
    },

    /**
     * 获取拖拽目标元素
     */
    getDragTargetElement(e) {
        const elementsAtPoint = document.elementsFromPoint(e.clientX, e.clientY);

        for (const el of elementsAtPoint) {
            if (el === DragSort.draggedElement) continue;
            if (el.classList.contains('sortable-item') || el.classList.contains('product-sortable-item')) {
                if (el.dataset.sortData) {
                    return el;
                }
            }
        }

        return null;
    },

    /**
     * 执行排序操作
     */
    async performSort(draggedData, targetData, isAbove) {
        const { type, level, item, parent1, parent2 } = draggedData;

        if (type === 'category') {
            this.sortCategory(draggedData, targetData, isAbove);
        } else if (type === 'product') {
            this.sortProduct(draggedData, targetData, isAbove);
        }
    },

    /**
     * 排序分类
     */
    async sortCategory(draggedData, targetData, isAbove) {
        const { level, item, parent1, parent2 } = draggedData;
        const { item: targetItem, parent1: targetParent1, parent2: targetParent2 } = targetData;

        // 确定要操作的数组
        let array;
        if (level === 1) {
            array = AppState.data;
        } else if (level === 2) {
            const parentIdx = AppState.data.findIndex(c => c.name_cn === parent1.name_cn);
            if (parentIdx === -1) return;
            array = AppState.data[parentIdx].children;
        } else if (level === 3) {
            const parent1Idx = AppState.data.findIndex(c => c.name_cn === parent1.name_cn);
            if (parent1Idx === -1) return;
            const parent2Idx = AppState.data[parent1Idx].children.findIndex(c => c.name_cn === parent2.name_cn);
            if (parent2Idx === -1) return;
            array = AppState.data[parent1Idx].children[parent2Idx].children;
        }

        // 找到被拖拽项和目标项的索引
        const draggedIdx = array.findIndex(c => c.name_cn === item.name_cn);
        const targetIdx = array.findIndex(c => c.name_cn === targetItem.name_cn);

        if (draggedIdx === -1 || targetIdx === -1) return;

        // 计算新的位置
        let newIdx = targetIdx;
        if (isAbove) {
            newIdx = draggedIdx < targetIdx ? targetIdx - 1 : targetIdx;
        } else {
            newIdx = draggedIdx < targetIdx ? targetIdx : targetIdx + 1;
        }

        // 移动元素
        if (draggedIdx !== newIdx) {
            const [removed] = array.splice(draggedIdx, 1);
            array.splice(newIdx, 0, removed);

            // 保存更改
            const success = await DataService.saveData();
            if (success) {
                showToast('排序已保存', 'success');
                await DataService.loadData();
                ManageRenderer.renderAll();
            } else {
                showToast('排序保存失败', 'error');
            }
        }
    },

    /**
     * 排序产品
     */
    async sortProduct(draggedData, targetData, isAbove) {
        const { item: draggedItem, parent1, parent2 } = draggedData;
        const { item: targetItem } = targetData;

        // 确定产品所在的分类
        let targetCategory;
        if (draggedItem.level3) {
            const parent1Idx = AppState.data.findIndex(c => c.name_cn === draggedItem.level1.name_cn);
            if (parent1Idx === -1) return;
            const parent2Idx = AppState.data[parent1Idx].children.findIndex(c => c.name_cn === draggedItem.level2.name_cn);
            if (parent2Idx === -1) return;
            const parent3Idx = AppState.data[parent1Idx].children[parent2Idx].children.findIndex(c => c.name_cn === draggedItem.level3.name_cn);
            if (parent3Idx === -1) return;
            targetCategory = AppState.data[parent1Idx].children[parent2Idx].children[parent3Idx];
        } else if (draggedItem.level2) {
            const parent1Idx = AppState.data.findIndex(c => c.name_cn === draggedItem.level1.name_cn);
            if (parent1Idx === -1) return;
            const parent2Idx = AppState.data[parent1Idx].children.findIndex(c => c.name_cn === draggedItem.level2.name_cn);
            if (parent2Idx === -1) return;
            targetCategory = AppState.data[parent1Idx].children[parent2Idx];
        } else {
            const parent1Idx = AppState.data.findIndex(c => c.name_cn === draggedItem.level1.name_cn);
            if (parent1Idx === -1) return;
            targetCategory = AppState.data[parent1Idx];
        }

        const products = targetCategory.products || [];

        // 找到被拖拽项和目标项的索引
        const draggedIdx = products.findIndex(p => p.name_cn === draggedItem.name_cn && p.name_jp === draggedItem.name_jp);
        const targetIdx = products.findIndex(p => p.name_cn === targetItem.name_cn && p.name_jp === targetItem.name_jp);

        if (draggedIdx === -1 || targetIdx === -1) return;

        // 计算新的位置
        let newIdx = targetIdx;
        if (isAbove) {
            newIdx = draggedIdx < targetIdx ? targetIdx - 1 : targetIdx;
        } else {
            newIdx = draggedIdx < targetIdx ? targetIdx : targetIdx + 1;
        }

        // 移动元素
        if (draggedIdx !== newIdx) {
            const [removed] = products.splice(draggedIdx, 1);
            products.splice(newIdx, 0, removed);

            // 保存更改
            const success = await DataService.saveData();
            if (success) {
                showToast('排序已保存', 'success');
                await DataService.loadData();
                ManageRenderer.renderAll();
            } else {
                showToast('排序保存失败', 'error');
            }
        }
    }
};


/**
 * ==========================================
 * 页面加载完成后初始化
 * ==========================================
 */
document.addEventListener('DOMContentLoaded', () => {
    // 初始化国际化（管理页使用中文）
    I18n.init('cn');

    // 初始化管理页
    ManageController.init();

    // 初始化拖拽排序功能
    ManageController.initDragSort();
});

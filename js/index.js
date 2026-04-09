/**
 * 海拓選品 - 展示页主逻辑
 *
 * 重构后的 index.html 业务逻辑
 * 采用渲染器和控制器分离的模式
 */

/**
 * ==========================================
 * 展示页渲染器
 * ==========================================
 */
const IndexRenderer = {

    /**
     * 渲染所有内容
     */
    renderAll() {
        this.renderSiteTitle();
        this.renderBreadcrumb();
        this.renderCategoryNav();
        this.renderProductGrid();
    },

    /**
     * 渲染网站标题
     */
    renderSiteTitle() {
        const titleEl = document.getElementById('site-title');
        if (titleEl) {
            titleEl.textContent = I18n.getSiteTitle();
        }
    },

    /**
     * 渲染面包屑导航
     */
    renderBreadcrumb() {
        const breadcrumb = document.getElementById('breadcrumb');
        if (!breadcrumb) return;

        let html = '';

        // 首页链接
        const homeText = I18n.getHomeText();
        html += `<span class="cursor-pointer hover:opacity-70" onclick="IndexController.goHome()" style="color: var(--primary-color)">${homeText}</span>`;

        // 一级分类
        if (AppState.currentLevel1) {
            html += `<span style="color: #C8C8C3">/</span>`;
            const level1Click = `IndexController.selectLevel1(DataService.findLevel1ByName('${AppState.currentLevel1.name_cn}'))`;
            html += `<span class="cursor-pointer hover:opacity-70" onclick="${level1Click}" style="color: var(--primary-color)">${I18n.t(AppState.currentLevel1)}</span>`;

            // 二级分类
            if (AppState.currentLevel2) {
                html += `<span style="color: #C8C8C3">/</span>`;
                html += `<span class="cursor-pointer hover:opacity-70" style="color: var(--primary-color)">${I18n.t(AppState.currentLevel2)}</span>`;

                // 三级分类
                if (AppState.currentLevel3) {
                    html += `<span style="color: #C8C8C3">/</span>`;
                    html += `<span style="color: var(--text-secondary)">${I18n.t(AppState.currentLevel3)}</span>`;
                }
            }
        }

        breadcrumb.innerHTML = html;
    },

    /**
     * 渲染分类导航
     */
    renderCategoryNav() {
        const nav = document.getElementById('category-nav');
        if (!nav) return;

        let html = '';

        // 一级分类标签
        html += this.renderLevel1Tags();

        // 二级分类标签
        if (AppState.currentLevel1 && AppState.currentLevel1.children && AppState.currentLevel1.children.length > 0) {
            html += this.renderLevel2Tags();
        }

        // 三级分类标签
        if (AppState.currentLevel2 && AppState.currentLevel2.children && AppState.currentLevel2.children.length > 0) {
            html += this.renderLevel3Tags();
        }

        nav.innerHTML = html;
    },

    /**
     * 渲染一级分类标签
     */
    renderLevel1Tags() {
        let html = `<div class="flex flex-wrap gap-2.5 mb-5">`;

        AppState.data.forEach((level1, idx) => {
            const isActive = AppState.currentLevel1 && level1.name_cn === AppState.currentLevel1.name_cn;
            const activeStyle = isActive
                ? 'background-color: var(--primary-color); color: white; border-color: var(--primary-color);'
                : 'background-color: white; color: var(--text-secondary); border-color: var(--border-color);';

            html += `
                <button
                    class="category-tag btn-hover px-4 py-2 rounded-full text-sm font-medium border ${isActive ? 'active' : ''}"
                    style="${activeStyle}"
                    onclick="IndexController.selectLevel1(AppState.data[${idx}])"
                >
                    ${I18n.t(level1)}
                </button>
            `;
        });

        html += `</div>`;
        return html;
    },

    /**
     * 渲染二级分类标签
     */
    renderLevel2Tags() {
        let html = `<div class="flex flex-wrap gap-2 mb-4 pl-3 border-l-2" style="border-color: #D0D8D7; margin-left: 4px;">`;

        // 全部按钮
        const allActive = !AppState.currentLevel2;
        const allStyle = allActive
            ? 'background-color: var(--accent-color); color: white;'
            : 'background-color: #F5F5F3; color: var(--text-secondary);';

        html += `
            <button
                class="category-tag btn-hover px-3 py-1.5 rounded-full text-xs font-medium border border-transparent"
                style="${allStyle}"
                onclick="IndexController.selectLevel2(null)"
            >
                ${I18n.getAllText()}
            </button>
        `;

        AppState.currentLevel1.children.forEach((level2, idx) => {
            const isActive = AppState.currentLevel2 && level2.name_cn === AppState.currentLevel2.name_cn;
            const activeStyle = isActive
                ? 'background-color: var(--accent-color); color: white;'
                : 'background-color: #F5F5F3; color: var(--text-secondary);';

            html += `
                <button
                    class="category-tag btn-hover px-3 py-1.5 rounded-full text-xs font-medium border border-transparent"
                    style="${activeStyle}"
                    onclick="IndexController.selectLevel2(AppState.currentLevel1.children[${idx}])"
                >
                    ${I18n.t(level2)}
                </button>
            `;
        });

        html += `</div>`;
        return html;
    },

    /**
     * 渲染三级分类标签
     */
    renderLevel3Tags() {
        let html = `<div class="flex flex-wrap gap-1.5 mb-5 pl-5 border-l-2" style="border-color: #E0E5E4; margin-left: 8px;">`;

        // 全部按钮
        const allActive = !AppState.currentLevel3;
        const allStyle = allActive
            ? 'background-color: #B0A8A8; color: white;'
            : 'background-color: #FAFAF9; color: var(--text-secondary);';

        html += `
            <button
                class="category-tag btn-hover px-2.5 py-1 rounded-full text-xs font-medium border border-transparent"
                style="${allStyle}"
                onclick="IndexController.selectLevel3(null)"
            >
                ${I18n.getAllText()}
            </button>
        `;

        AppState.currentLevel2.children.forEach((level3, idx) => {
            const isActive = AppState.currentLevel3 && level3.name_cn === AppState.currentLevel3.name_cn;
            const activeStyle = isActive
                ? 'background-color: #B0A8A8; color: white;'
                : 'background-color: #FAFAF9; color: var(--text-secondary);';

            html += `
                <button
                    class="category-tag btn-hover px-2.5 py-1 rounded-full text-xs font-medium border border-transparent"
                    style="${activeStyle}"
                    onclick="IndexController.selectLevel3(AppState.currentLevel2.children[${idx}])"
                >
                    ${I18n.t(level3)}
                </button>
            `;
        });

        html += `</div>`;
        return html;
    },

    /**
     * 渲染产品网格
     */
    renderProductGrid() {
        const grid = document.getElementById('product-grid');
        if (!grid) return;

        let html = '';
        let globalIdx = 0;

        if (!AppState.currentLevel1) {
            grid.innerHTML = '';
            return;
        }

        // 根据当前选中状态决定如何渲染
        if (!AppState.currentLevel2) {
            // 选中一级分类：显示所有子分类的产品
            if (AppState.currentLevel1.products && AppState.currentLevel1.products.length > 0) {
                html += this.renderProductGroup(null, AppState.currentLevel1.products, globalIdx);
                globalIdx += AppState.currentLevel1.products.length;
            }

            if (AppState.currentLevel1.children) {
                AppState.currentLevel1.children.forEach(level2 => {
                    if (level2.products && level2.products.length > 0) {
                        html += this.renderProductGroup(level2, level2.products, globalIdx);
                        globalIdx += level2.products.length;
                    }

                    if (level2.children) {
                        level2.children.forEach(level3 => {
                            if (level3.products && level3.products.length > 0) {
                                html += this.renderProductGroup(level3, level3.products, globalIdx);
                                globalIdx += level3.products.length;
                            }
                        });
                    }
                });
            }
        } else if (!AppState.currentLevel3) {
            // 选中二级分类
            if (AppState.currentLevel2.products && AppState.currentLevel2.products.length > 0) {
                html += this.renderProductGroup(null, AppState.currentLevel2.products, globalIdx);
                globalIdx += AppState.currentLevel2.products.length;
            }

            if (AppState.currentLevel2.children) {
                AppState.currentLevel2.children.forEach(level3 => {
                    if (level3.products && level3.products.length > 0) {
                        html += this.renderProductGroup(level3, level3.products, globalIdx);
                        globalIdx += level3.products.length;
                    }
                });
            }
        } else {
            // 选中三级分类
            if (AppState.currentLevel3.products && AppState.currentLevel3.products.length > 0) {
                html += this.renderProductGroup(null, AppState.currentLevel3.products, globalIdx);
            }
        }

        // 无产品时显示提示
        if (!html) {
            html = `
                <div class="col-span-full text-center py-16" style="color: var(--text-secondary)">
                    <p class="text-base">${I18n.getNoProductsText()}</p>
                </div>
            `;
        }

        grid.innerHTML = html;
    },

    /**
     * 渲染产品分组
     * @param {Object|null} category - 分类对象，null 表示不显示分组标题
     * @param {Array} products - 产品数组
     * @param {number} startIdx - 起始索引（用于动画延迟）
     */
    renderProductGroup(category, products, startIdx) {
        let html = '';

        // 如果有分类，显示分组标题
        if (category) {
            html += `
                <div class="col-span-full mt-10 mb-4 first:mt-0">
                    <h2 class="text-base font-medium pl-3 border-l-3" style="color: var(--text-primary); border-color: var(--primary-color)">
                        ${I18n.t(category)}
                    </h2>
                    <div class="mt-3 h-px" style="background-color: #ECECEA"></div>
                </div>
            `;
        }

        // 渲染产品卡片
        products.forEach((product, idx) => {
            const coverImg = product.images && product.images.length > 0 ? product.images[0] : null;
            const coverPath = coverImg ? coverImg.path : '';
            const animDelay = (startIdx + idx) * 40;

            // 转义产品名称防止 XSS
            const escapedProductName = escapeHtml(I18n.t(product));

            html += `
                <div
                    class="product-card card-hover bg-white rounded-xl overflow-hidden cursor-pointer fade-in"
                    style="animation-delay: ${animDelay}ms"
                    onclick='IndexRenderer.openProductModal(${JSON.stringify(product)})'
                >
                    <div class="aspect-square bg-white overflow-hidden flex items-center justify-center border border-[#F0F0F0]">
                        <img
                            src="${coverPath}"
                            alt="${escapedProductName}"
                            class="w-full h-full object-contain"
                            onerror="this.src='${getImagePlaceholderSvg()}'"
                        />
                    </div>
                    <div class="p-4">
                        <h3 class="text-sm font-medium line-clamp-2" style="color: var(--text-primary)">
                            ${escapedProductName}
                        </h3>
                    </div>
                </div>
            `;
        });

        return html;
    },

    /**
     * 打开产品详情模态框
     * @param {Object} product - 产品对象
     */
    openProductModal(product) {
        const modal = document.getElementById('product-modal');
        const content = document.getElementById('modal-content');

        if (!modal || !content) return;

        let html = '';

        // 模态框头部
        html += `
            <div class="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center" style="border-color: #EDEDEB">
                <h2 class="text-lg font-medium" style="color: var(--text-primary)">${escapeHtml(I18n.t(product))}</h2>
                <button
                    class="btn-hover w-9 h-9 rounded-full flex items-center justify-center"
                    style="background-color: #F5F5F3; color: var(--text-secondary)"
                    onclick="IndexRenderer.closeProductModal()"
                    onmouseover="this.style.backgroundColor='#E8E8E5'"
                    onmouseout="this.style.backgroundColor='#F5F5F3'"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        `;

        html += `<div class="p-8">`;

        // 图片画廊
        if (product.images && product.images.length > 0) {
            html += `<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">`;

            product.images.forEach((img, idx) => {
                const desc = I18n.tDesc(img);
                html += `
                    <div class="gallery-img">
                        <div class="aspect-[4/3] bg-white rounded-xl overflow-hidden flex items-center justify-center border border-[#F0F0F0]" style="box-shadow: 0 4px 12px rgba(0,0,0,0.08); padding: 16px;">
                            <img
                                src="${img.path}"
                                alt="${escapeHtml(I18n.t(product))} ${idx + 1}"
                                class="w-full h-full object-contain max-h-[500px]"
                            />
                        </div>
                        ${desc ? `<p class="mt-4 text-base text-center" style="color: var(--text-secondary); white-space: pre-line;">${escapeHtml(desc)}</p>` : ''}
                    </div>
                `;
            });

            html += `</div>`;
        } else {
            html += `
                <div class="text-center py-16" style="color: #B0B0AA">
                    <p>${I18n.getNoImageText()}</p>
                </div>
            `;
        }

        html += `</div>`;

        content.innerHTML = html;
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    },

    /**
     * 关闭产品详情模态框
     */
    closeProductModal() {
        const modal = document.getElementById('product-modal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }
};


/**
 * ==========================================
 * 展示页控制器
 * ==========================================
 */
const IndexController = {

    /**
     * 初始化
     */
    async init() {
        try {
            AppState.isLoading = true;

            // 加载数据
            await DataService.loadData();

            // 设置初始选中状态
            if (AppState.data && AppState.data.length > 0) {
                AppState.selectLevel1(AppState.data[0]);
            }

            // 渲染界面
            IndexRenderer.renderAll();

            AppState.isLoading = false;

        } catch (error) {
            console.error('加载数据失败:', error);
            AppState.isLoading = false;

            const alertMsg = I18n.currentLang === 'cn'
                ? '数据加载失败，请确保 data.json 存在或服务器已启动'
                : 'データファイルを読み込めませんでした。data.jsonが存在するか確認してください！';
            alert(alertMsg);
        }
    },

    /**
     * 选择一级分类
     * @param {Object} level1 - 一级分类对象
     */
    selectLevel1(level1) {
        AppState.selectLevel1(level1);
        IndexRenderer.renderAll();
    },

    /**
     * 选择二级分类
     * @param {Object} level2 - 二级分类对象
     */
    selectLevel2(level2) {
        AppState.selectLevel2(level2);
        IndexRenderer.renderAll();
    },

    /**
     * 选择三级分类
     * @param {Object} level3 - 三级分类对象
     */
    selectLevel3(level3) {
        AppState.selectLevel3(level3);
        IndexRenderer.renderAll();
    },

    /**
     * 返回首页
     */
    goHome() {
        AppState.goHome();
        IndexRenderer.renderAll();
    },

    /**
     * 切换语言
     * @param {string} lang - 目标语言 'jp' | 'cn'
     */
    switchLang(lang) {
        I18n.setLang(lang);
        AppState.currentLang = lang;

        // 更新语言切换按钮样式
        const btnCn = document.getElementById('btn-cn');
        const btnJp = document.getElementById('btn-jp');

        if (btnCn && btnJp) {
            if (lang === 'cn') {
                btnCn.style.backgroundColor = 'var(--primary-color)';
                btnCn.style.color = 'white';
                btnJp.style.backgroundColor = 'transparent';
                btnJp.style.color = 'var(--text-secondary)';
            } else {
                btnJp.style.backgroundColor = 'var(--primary-color)';
                btnJp.style.color = 'white';
                btnCn.style.backgroundColor = 'transparent';
                btnCn.style.color = 'var(--text-secondary)';
            }
        }

        IndexRenderer.renderAll();
    }
};


/**
 * ==========================================
 * 事件监听设置
 * ==========================================
 */

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化国际化
    I18n.init('jp');

    // 初始化展示页
    IndexController.init();
});

// 语言切换按钮事件
document.addEventListener('DOMContentLoaded', () => {
    const btnCn = document.getElementById('btn-cn');
    const btnJp = document.getElementById('btn-jp');

    if (btnCn) {
        btnCn.addEventListener('click', () => IndexController.switchLang('cn'));
    }
    if (btnJp) {
        btnJp.addEventListener('click', () => IndexController.switchLang('jp'));
    }
});

// 点击模态框背景关闭
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                IndexRenderer.closeProductModal();
            }
        });
    }
});

// ESC 键关闭模态框
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        IndexRenderer.closeProductModal();
    }
});

# 海拓選品 - 重构实施计划

> 文档版本: 1.0\
> 创建日期: 2026-04-01\
> 项目类型: 中日贸易选品展示网站 + 选品管理后台\
> 重构目标: 保持 JSON + 文件夹数据方案，优化代码架构，提高可维护性

---

## 一、重构目标

### 1.1 核心目标
- 保持 JSON + 文件夹的数据存储方案（不变）
- 保持零配置部署和打包为 exe 的能力（不变）
- 将代码从单文件混乱结构重构为模块化架构

### 1.2 重构后的目录结构

```
haituo select/
├── index.html                    # 展示页（精简，只做UI渲染）
├── manage.html                   # 管理页（精简，只做UI渲染）
├── data.json                     # 产品数据（保持不变）
├── images/                       # 图片文件夹（保持不变）
├── logo1.png                     # Logo
│
├── css/
│   └── styles.css               # 公共样式（从HTML中提取）
│
├── js/
│   ├── state.js                 # 状态管理模块
│   ├── api.js                   # API 调用层
│   ├── i18n.js                  # 国际化函数
│   ├── dataService.js           # 数据服务层（CRUD操作）
│   ├── utils.js                 # 工具函数
│   ├── index.js                 # 展示页主逻辑
│   └── manage.js                # 管理页主逻辑
│
├── app.py                        # Flask 服务器
├── build_windows.py              # Windows 打包脚本
├── build_windows.bat             # Windows 打包批处理
├── start_server.bat              # 快速启动批处理
├── 海拓選品.spec                 # PyInstaller 配置
└── requirements.txt             # Python 依赖
```

---

## 二、实施阶段

### 阶段一：基础设施创建（低风险）

**目标**：创建模块化的基础文件，提取公共代码

**任务清单**：

#### 1.1 创建目录结构
- [ ] 创建 `css/` 目录
- [ ] 创建 `js/` 目录

#### 1.2 提取公共样式到 css/styles.css
- [ ] 从 `index.html` 和 `manage.html` 提取 CSS 变量定义
- [ ] 提取动画和过渡效果
- [ ] 提取滚动条样式
- [ ] 提取卡片、按钮通用样式
- [ ] 保留 Tailwind CDN 引入（保持零依赖）

#### 1.3 创建 js/i18n.js（国际化模块）
```javascript
// 国际化函数 - 从 index.html 和 manage.html 提取
const I18n = {
    currentLang: 'jp',

    t(obj) {...},        // 获取对应语言名称
    tDesc(img) {...},    // 获取图片描述
    setLang(lang) {...}  // 切换语言
};
```

#### 1.4 创建 js/utils.js（工具函数）
- [ ] `showToast()` 提示消息函数
- [ ] `escapeHtml()` HTML转义（防XSS）
- [ ] `buildCategoryPath()` 分类路径构建
- [ ] 其他通用工具函数

#### 1.5 创建 js/state.js（状态管理）
```javascript
// 统一状态管理
const AppState = {
    // 展示页状态
    data: null,
    currentLang: 'jp',
    currentLevel1: null,
    currentLevel2: null,
    currentLevel3: null,

    // 管理页状态
    selectedCategory: null,
    editingProduct: null,
    modalImages: [],

    // 方法
    reset() {...},
    setData(data) {...}
};
```

**交付物**：目录结构创建完成，公共模块可引用

---

### 阶段二：API 层和数据服务层（低风险）

**目标**：封装所有数据操作，提供统一的数据访问接口

#### 2.1 创建 js/api.js（API 调用层）
```javascript
// 统一的 API 调用封装
const API = {
    async getData() {...},
    async saveData(data) {...},
    async uploadImage(file, path) {...},
    async deleteImage(path) {...},
    async deleteFolder(path) {...}
};
```

**封装内容**：
- 统一的错误处理
- 加载状态管理
- 异常情况降级处理（API 不可用时回退到本地 JSON）

#### 2.2 创建 js/dataService.js（数据服务层）

这是重构的核心，提供清晰的数据操作接口：

```javascript
// 数据服务层 - 封装所有 CRUD 操作
const DataService = {

    // ========== 分类操作 ==========

    // 获取所有分类
    getCategories() {
        return AppState.data || [];
    },

    // 添加分类
    addCategory(parent, level, categoryData) {
        // level 1: 添加到根目录
        // level 2: 添加到一级分类的 children
        // level 3: 添加到二级分类的 children
    },

    // 更新分类
    updateCategory(category, nameCn, nameJp) {...},

    // 删除分类（需检查是否有子分类或产品）
    deleteCategory(category, level, parent1, parent2) {...},

    // 统计分类下的产品数量
    countProductsInCategory(category) {...},

    // ========== 产品操作 ==========

    // 收集所有产品（带分类信息）
    collectAllProducts() {...},

    // 按分类筛选产品
    filterProductsByCategory(category) {...},

    // 添加产品
    addProduct(targetCategory, productData) {...},

    // 更新产品
    updateProduct(oldProduct, newProduct, newCategory) {...},

    // 删除产品
    deleteProduct(product) {...},

    // ========== 图片操作 ==========

    // 处理产品图片上传
    async uploadProductImages(productName, images) {...},

    // 移动产品图片到新分类
    async moveProductImages(product, oldCategory, newCategory) {...},

    // 删除产品图片
    async deleteProductImages(images) {...}
};
```

**关键改进**：
- 消除 `confirmDelete()` 的 if-else 混乱
- 每个操作有明确的职责
- 数据修改后自动通知状态更新

#### 2.3 更新 index.html 和 manage.html 引用新模块
- [ ] 更新 `<script>` 引用顺序（先加载基础模块，再加载业务模块）
- [ ] 移除重复的函数定义
- [ ] 保持 HTML 结构和 CSS 类名不变

**交付物**：数据操作通过 DataService 统一访问

---

### 阶段三：UI 渲染层简化（中风险）

**目标**：简化渲染函数，让代码更清晰易读

#### 3.1 重构 index.html 的 JS

**当前问题函数**：
- `renderAll()` - 调用多个渲染函数
- `renderCategoryNav()` - 67行，逻辑复杂
- `renderProductGrid()` - 67行，逻辑复杂
- `renderProductGroup()` - 辅助函数

**重构思路**：
```javascript
// 重构后的渲染函数结构
const Renderer = {

    // 主入口
    renderAll() {
        this.renderSiteTitle();
        this.renderBreadcrumb();
        this.renderCategoryNav();
        this.renderProductGrid();
    },

    // 渲染分类导航（拆分为多个小函数）
    renderCategoryNav() {
        this.renderLevel1Categories();
        this.renderLevel2Categories();
        this.renderLevel3Categories();
    },

    renderLevel1Categories() {...},
    renderLevel2Categories() {...},
    renderLevel3Categories() {...},

    // 渲染产品网格
    renderProductGrid() {...},

    // 渲染单个产品分组
    renderProductGroup(category, products, startIdx) {...}
};
```

#### 3.2 重构 manage.html 的 JS

**当前问题函数**：
- `renderCategoryTree()` - 渲染分类树
- `renderCategoryItem()` - 97行递归函数，同时生成操作按钮
- `renderProductList()` - 110行，包含HTML拼接
- `saveProduct()` - 157行，图片处理逻辑复杂
- `confirmDelete()` - 171行，同时处理产品和分类删除

**重构思路**：

```javascript
// 管理页渲染器
const ManageRenderer = {

    // 主入口
    renderAll() {
        this.renderCategoryTree();
        this.renderProductList();
    },

    // 渲染分类树（使用递归但更清晰）
    renderCategoryTree() {
        const container = document.getElementById('category-tree');
        container.innerHTML = this.renderAllCategories();
    },

    renderAllCategories() {
        let html = this.renderAllProductsButton();
        AppState.data.forEach((cat, idx) => {
            html += this.renderCategoryItem(cat, 1, idx, null, null);
        });
        return html;
    },

    renderCategoryItem(category, level, index, parent1, parent2) {
        // 简化后的递归函数，职责单一
    },

    // 渲染产品列表
    renderProductList() {...}
};

// 管理页控制器（处理所有业务逻辑）
const ManageController = {

    // 产品操作
    async addProduct(productData) {...},
    async updateProduct(productId, productData) {...},
    async deleteProduct(product) {...},

    // 分类操作
    async addCategory(parent, level, categoryData) {...},
    async updateCategory(categoryId, categoryData) {...},
    async deleteCategory(category) {...},

    // 模态框控制
    openProductModal(product) {...},
    closeProductModal() {...},
    openCategoryModal(...) {...},
    closeCategoryModal() {...}
};
```

**关键改进**：
- 渲染逻辑和业务逻辑分离
- 函数职责单一，每个函数不超过50行
- 消除深层嵌套的 if-else

#### 3.3 优化图片处理逻辑

**当前问题**：`saveProduct()` 中处理图片上传、移动、删除的逻辑混杂

**重构方案**：
```javascript
// 图片控制器
const ImageController = {

    // 上传新图片
    async uploadNewImages(files, categoryPath, productName) {...},

    // 移动现有图片到新分类
    async moveImages(images, oldCategory, newCategory) {...},

    // 删除图片
    async deleteImages(images) {...},

    // 渲染图片预览
    renderImagePreview(images, container) {...}
};
```

---

### 阶段四：Flask API 优化（低风险）

**目标**：保持 API 接口不变，优化后端代码结构

#### 4.1 查看并优化 app.py
- [ ] 检查现有 API 端点
- [ ] 考虑添加数据验证
- [ ] 优化文件操作（原子性写入）

#### 4.2 确保打包兼容性
- [ ] 测试 PyInstaller 打包
- [ ] 验证 exe 在无 Python 环境运行
- [ ] 验证图片路径正确性

---

### 阶段五：测试与验证（低风险）

**目标**：确保重构后功能完全正常

#### 5.1 功能测试

**展示页测试**：
- [ ] 首页加载
- [ ] 三级分类切换
- [ ] 中日语言切换
- [ ] 产品卡片点击打开详情
- [ ] 模态框关闭（点击背景、ESC键）

**管理页测试**：
- [ ] 分类树渲染
- [ ] 选择分类筛选产品
- [ ] 新增产品（上传图片）
- [ ] 编辑产品
- [ ] 删除产品
- [ ] 新增分类
- [ ] 编辑分类
- [ ] 删除分类（含子分类/产品检查）
- [ ] Toast 提示显示

#### 5.2 打包测试
- [ ] 执行 `build_windows.bat`
- [ ] 验证生成 HaiTuo_Select_Windows/ 目录
- [ ] 运行 exe 测试功能
- [ ] 验证图片显示正常

---

## 三、重构原则

### 3.1 代码组织原则
1. **先拆后合** - 先把大文件拆成小模块，验证正常后再继续
2. **循序渐进** - 每个阶段完成后测试再进入下一阶段
3. **保持兼容** - 重构期间不改变任何功能行为

### 3.2 模块依赖关系
```
css/styles.css        <- 被所有 HTML 引用
js/utils.js           <- 被其他 JS 模块引用
js/i18n.js            <- 被其他 JS 模块引用
js/state.js           <- 被 dataService 和 renderer 引用
js/api.js             <- 被 dataService 引用
js/dataService.js     <- 被 index.js 和 manage.js 引用
js/index.js           <- 被 index.html 引用
js/manage.js          <- 被 manage.html 引用
```

### 3.3 风险控制
- 每个阶段完成后手动测试关键功能
- 使用 Git 备份（如果可用）
- 保留原文件的备份副本

---

## 四、交付物清单

| 阶段 | 交付物 | 状态 |
|------|--------|------|
| 阶段一 | css/styles.css, js/utils.js, js/i18n.js, js/state.js | 待完成 |
| 阶段二 | js/api.js, js/dataService.js | 待完成 |
| 阶段三 | js/index.js, js/manage.js（重构后的渲染和控制器） | 待完成 |
| 阶段四 | app.py 优化（如果需要） | 待完成 |
| 阶段五 | 完整测试报告 | 待完成 |

---

## 五、时间预估（相对）

| 阶段 | 复杂度 | 预计工作量 |
|------|--------|----------|
| 阶段一 | 低 | 1-2 小时 |
| 阶段二 | 中 | 2-3 小时 |
| 阶段三 | 中高 | 4-6 小时 |
| 阶段四 | 低 | 0.5-1 小时 |
| 阶段五 | 中 | 1-2 小时 |
| **总计** | - | **8-14 小时** |

---

## 六、后续维护建议

### 6.1 代码规范
- 继续使用中文注释
- 函数长度不超过 50 行
- 保持模块化，不要在模块间产生循环依赖

### 6.2 文档更新
- 重构完成后更新 PROJECT_ARCHITECTURE.md
- 添加模块 API 文档
- 更新使用说明

### 6.3 可能的未来优化方向
1. **性能优化** - 图片懒加载、虚拟滚动
2. **数据迁移** - 如需 SQLite，可写迁移脚本
3. **功能扩展** - 产品搜索、批量操作、导入导出

---

**文档结束**

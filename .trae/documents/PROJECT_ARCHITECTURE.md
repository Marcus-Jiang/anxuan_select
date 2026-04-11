# 海拓選品 - 项目架构文档

> 文档版本: 3.5\
> 最后更新: 2026-04-11\
> 项目类型: 中日贸易选品展示网站 + 选品管理后台

***

## 目录

1. [技术栈概览](#1-技术栈概览)
2. [目录结构说明](#2-目录结构说明)
3. [模块化架构](#3-模块化架构)
4. [核心模块说明](#4-核心模块说明)
5. [数据请求与状态管理](#5-数据请求与状态管理)
6. [开发规范](#6-开发规范)
7. [打包发布](#7-打包发布)

***

## 1. 技术栈概览

### 前端技术栈

| 技术                       | 说明   | 使用方式                                  |
| ------------------------ | ---- | ------------------------------------- |
| **HTML5**                | 页面结构 | 单文件 index.html + manage.html          |
| **Tailwind CSS 3.x**     | 样式框架 | CDN引入 (`https://cdn.tailwindcss.com`) |
| **原生 JavaScript (ES6+)** | 交互逻辑 | 模块化结构（js/ 目录）                     |
| **CSS**                  | 样式表 | 独立模块 css/styles.css                  |
| **JSON**                 | 数据格式 | data.json                             |

### 后端/构建工具

| 技术              | 说明     | 用途                  |
| --------------- | ------ | ------------------- |
| **Python 3.x**  | 本地服务器  | app.py 提供 HTTP 服务   |
| **Flask**       | Web 框架 | 提供 REST API 接口      |
| **PyInstaller** | 打包工具   | 将 Python 项目打包成 .exe |

### 设计特点

* ✅ **零依赖部署**: 无需 npm、无需构建工具
* ✅ **单页应用 (SPA)**: 无刷新切换
* ✅ **模块化架构**: 代码清晰易维护
* ✅ **本地化部署**: 无需互联网连接
* ✅ **云端部署**: 支持 Vercel 云部署
* ✅ **日语优先**: 默认语言为日语，符合目标用户
* ✅ **管理后台**: 可视化管理产品和分类

***

## 2. 目录结构说明

```
haituo select/
├── .trae/                              # IDE 配置目录
│   └── documents/
│       ├── PROJECT_ARCHITECTURE.md    # 本文档
│       └── REFACTOR_PLAN.md          # 重构计划文档
│
├── css/                               # 公共样式目录
│   └── styles.css                    # 公共样式表
│
├── js/                               # JavaScript 模块目录
│   ├── api.js                        # API 调用模块
│   ├── dataService.js                # 数据服务模块
│   ├── i18n.js                       # 国际化模块
│   ├── index.js                      # 展示页主逻辑
│   ├── manage.js                     # 管理页主逻辑
│   ├── state.js                      # 状态管理模块
│   └── utils.js                      # 工具函数模块（含拖拽排序）
│
├── images/                            # 产品图片目录
│
├── Anxuan_Select_Mac/                  # Mac 打包输出目录
│
├── index.html                         # 【核心】主页面文件（展示页）
├── manage.html                        # 【核心】管理后台页面
├── data.json                          # 【核心】产品数据文件
│
├── app.py                               # Python 本地服务器（Flask）
├── Anxuan_Selected.spec                 # PyInstaller 配置文件
├── build_all.py                         # 批量构建脚本
├── build_mac.py                         # Mac 打包脚本
├── build_windows.py                     # Windows 打包脚本
├── build_windows.bat                    # Windows 打包批处理文件
├── start_server.bat                     # 快速启动服务器批处理文件
├── requirements.txt                     # Python 依赖包列表
└── vercel.json                          # Vercel 部署配置文件
```

### 文件重要性说明

| 文件                        | 重要性   | 说明                       |
| ------------------------- | ----- | ------------------------ |
| `index.html`              | ⭐⭐⭐⭐⭐ | **前端展示页**                 |
| `manage.html`             | ⭐⭐⭐⭐⭐ | **管理后台页**                 |
| `data.json`               | ⭐⭐⭐⭐⭐ | **数据源**                    |
| `js/dataService.js`       | ⭐⭐⭐⭐⭐ | **数据服务层** - 封装所有 CRUD 操作 |
| `js/state.js`             | ⭐⭐⭐⭐  | **状态管理** - 统一管理应用状态     |
| `js/index.js`             | ⭐⭐⭐⭐  | **展示页主逻辑** - UI 渲染和交互   |
| `js/manage.js`            | ⭐⭐⭐⭐  | **管理页主逻辑** - UI 渲染和交互   |
| `css/styles.css`          | ⭐⭐⭐⭐  | **公共样式** - CSS 变量和动画等   |
| `js/api.js`               | ⭐⭐⭐   | **API 调用层** - 封装 HTTP 请求  |
| `js/utils.js`             | ⭐⭐⭐   | **工具函数** - 通用辅助函数、拖拽排序 |
| `js/i18n.js`              | ⭐⭐⭐   | **国际化** - 中日双语支持         |
| `app.py`                  | ⭐⭐⭐⭐  | Flask 服务器                   |
| `vercel.json`             | ⭐⭐⭐   | Vercel 部署配置文件            |

***

## 3. 模块化架构

### 3.1 模块依赖关系

```
┌─────────────────────────────────────────────────────────────┐
│                        index.html                           │
│                      manage.html                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     css/styles.css                            │
│              (CSS 变量、动画、通用样式、拖拽样式)                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        JS 模块                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    utils.js                          │   │
│  │              (工具函数 - 被所有模块依赖)                 │   │
│  │         含 DragSort 拖拽排序管理器                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                              │                              │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  │
│  │    i18n.js    │  │   state.js    │  │    api.js    │  │
│  │   (国际化)     │  │  (状态管理)    │  │  (API调用)    │  │
│  └────────────────┘  └────────────────┘  └────────────────┘  │
│                              │              │              │
│                              │              ▼              │
│                              │    ┌────────────────┐       │
│                              │    │ dataService.js│       │
│                              │    │  (数据服务层)   │       │
│                              │    └────────────────┘       │
│                              │              │              │
│                              ▼              ▼              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              index.js / manage.js                    │   │
│  │              (页面主逻辑 - 渲染器 + 控制器)              │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        app.py                                │
│                    (Flask 服务器)                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       data.json                              │
│                    (产品数据存储)                              │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 模块职责划分

| 模块 | 职责 | 主要功能 |
|------|------|----------|
| **utils.js** | 工具函数 | showToast, escapeHtml, buildCategoryPath, getImagePlaceholderSvg, DragSort 拖拽排序等 |
| **i18n.js** | 国际化 | t(), tDesc(), 语言切换, 翻译文本管理 |
| **state.js** | 状态管理 | AppState 对象, 统一管理所有应用状态, 包括折叠状态管理 |
| **api.js** | API 调用 | getData, saveData, uploadImage, deleteImage 等 |
| **dataService.js** | 数据服务 | 封装所有 CRUD 操作, 分类和产品管理 |
| **index.js** | 展示页逻辑 | IndexRenderer, IndexController |
| **manage.js** | 管理页逻辑 | ManageRenderer, ManageController |

***

## 4. 核心模块说明

### 4.1 utils.js - 工具函数模块

```javascript
// 主要函数
showToast(message, type)     // 显示提示消息
escapeHtml(text)             // HTML 转义（防 XSS）
buildCategoryPath(l1, l2, l3) // 构建分类路径
getImagePlaceholderSvg()     // 获取图片占位符 SVG
generatePreviewUrl(file)      // 生成图片预览 URL
moveArrayElement()           // 数组元素移动

// 拖拽排序
DragSort                      // 拖拽排序管理器对象
initDraggable()               // 初始化拖拽功能
handleDragMove()              // 处理拖拽移动
handleDragEnd()               // 处理拖拽结束
getDragTargetElement()        // 获取拖拽目标元素
```

### 4.2 i18n.js - 国际化模块

```javascript
// 主要函数和属性
I18n.currentLang               // 当前语言：'jp' 或 'cn'
I18n.init(lang)               // 初始化
I18n.setLang(lang)            // 设置语言
I18n.t(obj)                   // 获取翻译后的名称
I18n.tDesc(img)               // 获取图片描述（支持换行符 white-space: pre-line）
I18n.getActionText(action)   // 获取操作按钮文本
```

### 4.3 state.js - 状态管理模块

```javascript
// AppState 对象结构
AppState = {
    // 数据
    data: null,               // 完整的分类和产品数据
    isLoading: false,         // 加载状态

    // 展示页状态
    currentLevel1: null,      // 当前选中的一级分类
    currentLevel2: null,      // 当前选中的二级分类
    currentLevel3: null,      // 当前选中的三级分类
    currentLang: 'jp',        // 当前语言

    // 管理页状态
    selectedCategory: null,    // 当前选中的分类（用于筛选）
    collapsedCategories: Set,  // 折叠状态：存储被折叠的分类 name_cn
    modalState: {...},         // 模态框状态
    editingProduct: {...},     // 产品编辑状态
    editingCategory: {...},    // 分类编辑状态

    // 删除状态（由调用方管理）
    productToDelete: null,     // 待删除的产品
    categoryToDelete: null,    // 待删除的分类（含 level, parent1, parent2）

    // 方法
    init(),                    // 初始化
    selectLevel1(),           // 选择一级分类
    selectLevel2(),           // 选择二级分类
    selectLevel3(),           // 选择三级分类
    toggleCategoryCollapse(),  // 切换分类折叠状态
    isCategoryCollapsed(),     // 检查分类是否折叠
    openProductModal(),        // 打开产品模态框
    closeProductModal(),      // 关闭产品模态框
    openDeleteConfirm(type, item),  // 打开删除确认（不设置 productToDelete/categoryToDelete）
    closeDeleteConfirm(),     // 关闭删除确认框
    // ...
}
```

**状态管理要点**：
- `openDeleteConfirm()` 只负责设置 `modalState.deleteConfirm`，不设置 `productToDelete` 或 `categoryToDelete`
- `productToDelete` 和 `categoryToDelete` 由 `manage.js` 中的调用方自己管理
- `categoryToDelete` 存储完整信息：`{ category, level, parent1, parent2 }`

### 4.4 api.js - API 调用模块

```javascript
// API 对象
API = {
    baseUrl: '',              // API 基础路径
    timeout: 30000,           // 请求超时时间

    // 方法
    init(baseUrl),            // 初始化
    get(endpoint),            // GET 请求
    post(endpoint, data),     // POST 请求
    postForm(endpoint, formData), // POST 表单（文件上传）

    // 数据操作
    getData(),                 // 获取完整数据
    saveData(data),           // 保存完整数据

    // 图片操作
    uploadImage(file, path),   // 上传图片
    deleteImage(path),        // 删除图片
    deleteFolder(path)        // 删除文件夹
}
```

### 4.5 dataService.js - 数据服务模块

```javascript
// DataService 对象
DataService = {
    // 数据加载和保存
    loadData(),                // 加载数据
    saveData(),                // 保存数据

    // 分类操作
    getCategories(),           // 获取所有分类
    countProductsInCategory(), // 统计产品数量（含子分类产品）
    addCategory(),             // 添加分类
    updateCategory(),          // 更新分类
    deleteCategory(),          // 删除分类

    // 产品操作
    collectAllProducts(),      // 收集所有产品
    filterProductsByCategory(), // 按分类筛选产品
    collectCurrentProducts(),   // 收集当前分类下的产品
    addProduct(),               // 添加产品
    removeProduct()             // 删除产品（使用 OR 匹配 name_cn 或 name_jp）
}
```

***

## 5. 数据请求与状态管理

### 5.1 展示页数据流

```
用户访问 index.html
    │
    ▼
index.js::IndexController.init()
    │
    ▼
DataService.loadData() → API.getData()
    │
    ▼
AppState.data = data
AppState.currentLevel1 = data[0]
    │
    ▼
IndexRenderer.renderAll()
    │
    ├── IndexRenderer.renderSiteTitle()
    ├── IndexRenderer.renderBreadcrumb()
    ├── IndexRenderer.renderCategoryNav()
    └── IndexRenderer.renderProductGrid()
```

### 5.2 管理页数据流

```
用户访问 manage.html
    │
    ▼
manage.js::ManageController.init()
    │
    ▼
DataService.loadData() → API.getData()
    │
    ▼
AppState.data = data
    │
    ▼
ManageRenderer.renderAll()
    │
    ├── ManageRenderer.renderCategoryTree()
    └── ManageRenderer.renderProductList()

用户操作（新增/编辑/删除/排序）
    │
    ▼
ManageController.操作()
    │
    ▼
DataService.操作()
    │
    ▼
API.saveData() → AppState 更新 → Renderer.renderAll()
```

### 5.3 状态管理特点

* ✅ **单一数据源**: `AppState.data` 是唯一的数据来源
* ✅ **可预测性**: 状态变更后立即调用渲染函数
* ✅ **模块化**: 每个模块管理自己的状态子集
* ✅ **调试友好**: 可以在控制台直接检查 AppState
* ✅ **分离关注点**: 删除状态由调用方管理，`openDeleteConfirm` 只管模态框显示

***

## 6. 开发规范

### 6.1 模块加载顺序

在 HTML 文件中，JS 模块必须按以下顺序加载：

```html
<!-- 1. 基础工具模块 -->
<script src="js/utils.js"></script>

<!-- 2. 基础设施模块 -->
<script src="js/i18n.js"></script>
<script src="js/state.js"></script>

<!-- 3. 数据层模块 -->
<script src="js/api.js"></script>
<script src="js/dataService.js"></script>

<!-- 4. 页面主逻辑 -->
<script src="js/index.js"></script>
<!-- 或 -->
<script src="js/manage.js"></script>
```

### 6.2 添加新产品/分类

**通过管理页操作**（推荐）：
1. 启动服务器：`python app.py`
2. 访问管理页：`http://localhost:8888/manage.html`
3. 点击"新增产品"或分类旁的"+"按钮
4. 填写信息、上传图片
5. 保存

**手动修改**：
```json
// 在 data.json 中添加
{
    "name_cn": "新分类",
    "name_jp": "新しいカテゴリ",
    "children": [],
    "products": []
}
```

### 6.3 修改样式

**方案 1**：修改 `css/styles.css`（推荐用于公共样式）

**方案 2**：在页面内联 `<style>`（用于页面特定样式）

**方案 3**：使用 Tailwind 工具类（用于快速样式调整）

### 6.4 添加新功能

**模式**：在对应的页面主逻辑模块中添加

```javascript
// 例如在 index.js 中添加新功能

// 1. 在 IndexRenderer 中添加渲染函数
IndexRenderer.renderNewFeature = function() {
    // 渲染新功能
};

// 2. 在 IndexController 中添加业务逻辑
IndexController.newFeatureAction = async function() {
    // 处理新功能逻辑
};

// 3. 在 renderAll 中调用
IndexRenderer.renderAll = function() {
    this.renderSiteTitle();
    this.renderBreadcrumb();
    this.renderCategoryNav();
    this.renderProductGrid();
    this.renderNewFeature();  // 新增
};
```

### 6.5 代码风格规范

* 使用中文注释（符合项目要求）
* 函数长度尽量控制在 50 行以内
* 变量命名清晰，有意义
* 使用 `const` 和 `let`，避免使用 `var`
* 使用模板字符串进行 HTML 拼接

### 6.6 删除操作状态管理规范

删除操作采用**两步确认**模式：

1. **第一步**：用户点击删除按钮 → 设置 `productToDelete`/`categoryToDelete` → 调用 `openDeleteConfirm()` 显示模态框
2. **第二步**：用户确认删除 → `confirmDelete()` 根据 `deleteConfirm.type` 执行对应删除逻辑

```javascript
// manage.js 中的删除流程示例
openDeleteProductModal(product) {
    AppState.productToDelete = product;  // 先设置待删除项
    AppState.openDeleteConfirm('product', product);  // 再显示确认框
}

confirmDelete() {
    const { deleteConfirm } = AppState.modalState;
    if (deleteConfirm.type === 'product') {
        // 使用 productToDelete 执行删除
    }
}
```

***

## 7. 打包发布

### 7.1 打包命令

#### Windows 打包
```powershell
# 方法1：使用批处理文件一键打包（推荐）
双击运行 build_windows.bat

# 方法2：手动打包
python build_windows.py
```

#### Mac 打包
```bash
# 手动打包
python build_mac.py
```

#### 批量打包
```powershell
# 同时打包 Windows 和 Mac 版本
python build_all.py
```

### 7.2 打包后输出

#### Windows 输出目录：`HaiTuo_Select_Windows/`
```
HaiTuo_Select_Windows/
├── 海拓選品.exe          # 打包的可执行文件
├── index.html             # 展示页
├── manage.html            # 管理页
├── data.json              # 数据文件
├── css/                   # 样式目录
│   └── styles.css
├── js/                    # 脚本目录
│   ├── api.js
│   ├── dataService.js
│   ├── i18n.js
│   ├── index.js
│   ├── manage.js
│   ├── state.js
│   └── utils.js
├── images/                # 图片目录
└── 使用说明.txt           # 使用说明
```

#### Mac 输出目录：`Anxuan_Select_Mac/`
```
Anxuan_Select_Mac/
├── Start Server.command     # 双击启动脚本
├── app.py                   # 服务器程序
├── index.html              # 展示页
├── manage.html             # 管理页
├── data.json               # 数据文件
├── css/                    # 样式目录
│   └── styles.css
├── js/                     # 脚本目录
│   ├── api.js
│   ├── dataService.js
│   ├── i18n.js
│   ├── index.js
│   ├── manage.js
│   ├── state.js
│   └── utils.js
├── images/                 # 图片目录
└── 使用说明.txt            # 使用说明
```

### 7.3 本地使用方法

#### Windows
1. 将 `HaiTuo_Select_Windows/` 文件夹整体复制到客户电脑
2. 双击 `海拓選品.exe`
3. 服务器自动启动，浏览器打开展示页
4. 访问 `http://localhost:8888/manage.html` 打开管理页

#### Mac
1. 将 `Anxuan_Select_Mac/` 文件夹复制到 Mac 电脑上
2. 双击 `Start Server.command` 启动
3. 如果提示"无法执行"，在终端中执行：`chmod +x "Start Server.command"`
4. 服务器自动启动，浏览器打开展示页
5. 访问 `http://localhost:8888/manage.html` 打开管理页

### 7.4 Vercel 云端部署

#### 部署步骤
1. 将代码推送到 GitHub 仓库
2. 登录 Vercel 账号
3. 导入 GitHub 仓库
4. 选择 Python 框架
5. 无需额外配置，Vercel 会自动使用 `vercel.json` 文件
6. 点击 "Deploy" 开始部署

#### 部署后访问
- 展示页：`https://[project-name].vercel.app/`
- 管理页：`https://[project-name].vercel.app/manage.html`

#### ⚠️ Vercel 只读限制说明

**重要：Vercel Serverless 环境是只读的，无法执行写操作！**

##### 受限制的功能：
- ❌ **产品增删改**：无法新增、编辑、删除产品
- ❌ **分类增删改**：无法新增、编辑、删除分类
- ❌ **图片上传**：无法上传新图片或替换图片
- ❌ **图片删除**：无法删除图片或图片文件夹
- ❌ **数据保存**：无法保存任何数据修改

##### 正常工作的功能：
- ✅ **数据展示**：可以正常浏览所有产品和分类
- ✅ **图片显示**：图片由 Vercel CDN 提供，访问速度更快
- ✅ **语言切换**：中日双语切换正常工作
- ✅ **搜索筛选**：可以搜索和筛选产品

##### 错误提示：
当在 Vercel 环境中尝试执行写操作时，系统会返回友好的错误提示：
```
⚠️ Vercel 云端部署为只读环境，无法执行写操作。

请在本地环境中进行数据修改，然后重新部署到云端。

本地使用方法：
1. 下载项目到本地
2. 运行 python app.py
3. 访问 http://localhost:8888/manage.html
4. 修改数据后推送到 GitHub
```

##### 推荐工作流程：
1. **本地开发**：在本地环境中使用管理页修改数据
2. **数据验证**：在本地验证所有修改是否正确
3. **推送到 GitHub**：将修改后的数据和图片推送到 GitHub
4. **自动部署**：Vercel 会自动检测 GitHub 更新并重新部署
5. **云端展示**：在 Vercel 上展示最新数据

##### 技术原因：
Vercel 的 Serverless 函数运行在只读文件系统中，除了 `/tmp` 目录外无法写入任何文件。这是 Serverless 架构的固有限制，无法通过配置解决。

***

## 附录

### A. 核心功能清单 (展示页)

* ✅ 三级分类导航
* ✅ 中日双语切换
* ✅ 产品卡片展示
* ✅ 产品详情模态框
* ✅ 多图展示
* ✅ 图片描述（支持换行符 `\n` 渲染）
* ✅ 返回顶部按钮
* ✅ 面包屑导航

### B. 核心功能清单 (管理页)

* ✅ 产品列表展示
* ✅ 产品新增（含图片上传）
* ✅ 产品编辑（含图片替换）
* ✅ 产品删除（带二次确认）
* ✅ 分类管理（一、二、三级分类）
* ✅ 分类新增/编辑/删除
* ✅ 图片文件夹自动管理
* ✅ 数据实时保存
* ✅ Toast 提示
* ✅ **拖拽排序功能**
  * 支持一级分类拖拽排序
  * 支持二级分类（同级）拖拽排序
  * 支持三级分类（同级）拖拽排序
  * 支持产品（在同级分类下）拖拽排序
  * 排序后自动保存到 data.json
* ✅ **分类折叠/展开功能**
  * 支持任意层级分类的折叠
  * 折叠状态持久化（在页面刷新前保持）
  * 折叠箭头方向正确（展开朝下，折叠朝右）
* ✅ **智能分类填充**
  * 新增产品时自动填充当前选中的分类
  * 支持一级/二级/三级分类的智能识别
  * 自动向上查找父分类

### C. 拖拽排序功能说明

#### 功能特点
- **原生实现**：使用 HTML5 拖拽 API，无需外部库
- **同级限制**：只能在同一级别内排序，无法跨级拖拽
  - 一级分类：可在所有一级分类间拖拽
  - 二级分类：只能在同一一级分类下的二级分类间拖拽
  - 三级分类：只能在同一二级分类下的三级分类间拖拽
  - 产品：只能在同一分类下的产品间拖拽
- **自动保存**：拖拽完成后自动保存到 data.json

#### 使用方式
1. 在分类树或产品列表中，找到想移动项左侧的 **拖拽手柄**（三横线图标）
2. 鼠标按住拖拽手柄
3. 拖动到目标位置（上方或下方）
4. 释放鼠标完成排序
5. 系统自动保存并显示 Toast 提示

#### 相关文件
- `js/utils.js` - 拖拽工具函数（DragSort, initDraggable, handleDragMove 等）
- `js/manage.js` - 拖拽排序控制器（ManageController.sortCategory, sortProduct）
- `css/styles.css` - 拖拽样式（.sortable-item, .drag-handle, .drag-over 等）

### D. 分类折叠功能说明

#### 功能特点
- **CSS 动画实现**：使用 max-height 和 visibility 实现平滑展开/折叠动画
- **箭头旋转指示**：折叠时箭头旋转-90度（朝右），展开时箭头朝下
- **状态管理**：使用 `AppState.collapsedCategories` Set 存储折叠状态
- **同级限制**：只能折叠有子分类的分类

#### 使用方式
1. 在分类树中，找到有子分类的分类项
2. 点击分类项左侧的 **折叠箭头** 按钮
3. 分类的子项将平滑展开或折叠
4. 展开/折叠状态在页面刷新前保持

#### 相关文件
- `js/state.js` - `toggleCategoryCollapse()`, `isCategoryCollapsed()` 方法
- `js/manage.js` - `ManageController.toggleCategoryCollapse()` 控制器方法
- `css/styles.css` - 折叠样式（.category-children, .collapse-arrow, .expanded）

### E. 配色参考
```
主色调: #6B8E8B (灰绿)
强调色: #9A8C98 (灰紫)
背景色: #F7F7F5 (暖灰)
文字色: #3A3A3A (深灰)
边框色: #E5E5E0 (浅灰)
错误色: #DC2626 (红色)
成功色: #16A34A (绿色)
```

### F. 更新日志

**v3.4 (2026-04-11)**
- 新增 Vercel 云端部署支持
- 添加 `vercel.json` 配置文件
- 优化静态文件处理（使用 @vercel/static 构建器）
- 修复 Vercel 部署时图片 404 问题
- 新增 Mac 打包脚本 `build_mac.py`
- 新增批量构建脚本 `build_all.py`
- **修复 Vercel 只读环境问题**：
  - 添加环境检测函数 `is_vercel_environment()`
  - 在所有写操作 API 中添加只读环境检测
  - 返回友好的错误提示，指导用户在本地修改数据
  - 受影响的 API：`POST /api/data`、`POST /api/upload-image`、`POST /api/delete-image`、`POST /api/delete-folder`

**v3.3 (2026-04-02)**
- 新增智能分类填充功能
- 新增产品时自动选中当前分类（支持一级/二级/三级）
- 新增 `isLevel1Category()`, `isLevel2Category()`, `findParentCategory()` 辅助方法

**v3.2 (2026-04-02)**
- 新增分类折叠/展开功能
- 修复折叠箭头方向问题（展开时朝下）
- 修复选中分类时按钮不可见问题（使用深色背景）
- 修复三级分类显示添加子分类按钮的问题（限制为 level < 3）
- 修复删除确认状态管理问题（分离 modalState 和待删除项状态）
- 修复产品编辑在同一分类内位置保留问题

**v3.1 (2026-04-01)**
- 新增拖拽排序功能
- 支持一级/二级/三级分类的拖拽排序
- 支持产品的拖拽排序
- 同级限制，防止跨级排序
- 排序后自动保存到 data.json

**v3.0 (2026-04-01)**
- 代码架构全面重构
- 采用模块化结构（css/、js/ 目录）
- 分离渲染器和控制器模式
- 统一状态管理（AppState）
- 数据服务层（DataService）封装 CRUD 操作
- API 调用层统一封装
- 国际化模块独立
- 工具函数模块化

**v2.1 (2026-03-26)**
- 管理后台功能新增
- 商品和分类的可视化管理支持
- 升级到 Flask 框架

**v2.0 (2026-03-20)**
- 初始版本
- 中日语言选品展示

***

**文档结束**

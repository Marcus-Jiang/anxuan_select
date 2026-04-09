/**
 * 海拓選品 - 工具函数模块
 *
 * 提供通用的工具函数，供其他模块使用
 */

/**
 * ==========================================
 * Toast 提示消息
 * ==========================================
 */

/**
 * 显示 Toast 提示消息
 * @param {string} message - 提示文本
 * @param {string} type - 消息类型：'success' | 'error' | 'info'
 * @param {number} duration - 显示时长（毫秒），默认 3000
 */
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.getElementById('toast');
    if (!toast) {
        console.warn('Toast 元素不存在，跳过显示');
        return;
    }

    const icon = document.getElementById('toast-icon');
    const msg = document.getElementById('toast-message');

    msg.textContent = message;

    // 根据类型设置图标
    if (type === 'success') {
        icon.innerHTML = `
            <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
        `;
        toast.className = 'toast';
    } else if (type === 'error') {
        icon.innerHTML = `
            <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
        `;
        toast.className = 'toast';
    } else {
        icon.innerHTML = `
            <svg class="w-5 h-5" style="color: var(--primary-color)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        `;
        toast.className = 'toast';
    }

    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.add('hidden');
    }, duration);
}


/**
 * ==========================================
 * HTML 转义（防止 XSS 攻击）
 * ==========================================
 */

/**
 * 转义 HTML 特殊字符
 * @param {string} text - 原始文本
 * @returns {string} 转义后的文本
 */
function escapeHtml(text) {
    if (!text) return '';

    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}


/**
 * ==========================================
 * 分类路径构建
 * ==========================================
 */

/**
 * 根据分类层级构建图片存储路径
 * @param {Object} level1 - 一级分类对象
 * @param {Object} level2 - 二级分类对象（可选）
 * @param {Object} level3 - 三级分类对象（可选）
 * @returns {string} 路径字符串，格式：'一级分类/二级分类/三级分类'
 */
function buildCategoryPath(level1, level2, level3) {
    let path = '';

    if (level1) {
        path += level1.name_cn;
    }
    if (level2) {
        path += '/' + level2.name_cn;
    }
    if (level3) {
        path += '/' + level3.name_cn;
    }

    return path;
}


/**
 * ==========================================
 * 图片处理
 * ==========================================
 */

/**
 * 获取图片加载失败时的占位符 SVG
 * @param {string} text - 占位符显示的文字
 * @returns {string} SVG 数据 URI
 */
function getImagePlaceholderSvg(text = '暂无图片') {
    const lang = window.I18n ? I18n.currentLang : 'jp';
    const displayText = lang === 'cn' ? '暂无图片' : '画像なし';

    return `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><rect fill='%23FFFFFF' width='200' height='200'/><text x='100' y='110' text-anchor='middle' fill='%239A9A95' font-size='14'>${encodeURIComponent(displayText)}</text></svg>`;
}


/**
 * 从文件对象生成预览 URL
 * @param {File} file - 文件对象
 * @returns {Promise<string>} 数据 URL
 */
function generatePreviewUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}


/**
 * 从已有路径生成预览 URL（用于图片移动后的预览）
 * @param {string} path - 图片路径
 * @returns {Promise<string>} 数据 URL
 */
async function fetchImageAsBlobUrl(path) {
    try {
        const response = await fetch(path);
        const blob = await response.blob();
        return URL.createObjectURL(blob);
    } catch (e) {
        console.error('获取图片失败:', e);
        return getImagePlaceholderSvg();
    }
}


/**
 * ==========================================
 * DOM 操作辅助
 * ==========================================
 */

/**
 * 隐藏指定元素
 * @param {string|HTMLElement} element - 元素或元素 ID
 */
function hideElement(element) {
    const el = typeof element === 'string' ? document.getElementById(element) : element;
    if (el) {
        el.classList.add('hidden');
    }
}


/**
 * 显示指定元素
 * @param {string|HTMLElement} element - 元素或元素 ID
 */
function showElement(element) {
    const el = typeof element === 'string' ? document.getElementById(element) : element;
    if (el) {
        el.classList.remove('hidden');
    }
}


/**
 * ==========================================
 * 字符串处理
 * ==========================================
 */

/**
 * 生成唯一 ID
 * @returns {string} 基于时间戳和随机数的唯一 ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}


/**
 * 去除字符串首尾空白
 * @param {string} str - 原始字符串
 * @returns {string} 去除空白后的字符串
 */
function trimString(str) {
    return str ? str.trim() : '';
}


/**
 * 检查字符串是否为空
 * @param {string} str - 待检查的字符串
 * @returns {boolean} 是否为空
 */
function isEmpty(str) {
    return !str || str.trim().length === 0;
}


/**
 * ==========================================
 * 数组处理
 * ==========================================
 */

/**
 * 从数组中移除指定元素
 * @param {Array} array - 原始数组
 * @param {Function} predicate - 判断条件
 * @returns {Array} 新数组（不包含指定元素）
 */
function removeFromArray(array, predicate) {
    return array.filter(item => !predicate(item));
}


/**
 * 在数组中查找元素并返回索引
 * @param {Array} array - 原始数组
 * @param {Function} predicate - 判断条件
 * @returns {number} 元素索引，未找到返回 -1
 */
function findIndexInArray(array, predicate) {
    return array.findIndex(predicate);
}


/**
 * ==========================================
 * 对象处理
 * ==========================================
 */

/**
 * 深拷贝对象（使用 JSON 序列化）
 * @param {Object} obj - 待拷贝的对象
 * @returns {Object} 深拷贝后的新对象
 */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}


/**
 * 合并对象
 * @param {Object} target - 目标对象
 * @param {Object} source - 源对象
 * @returns {Object} 合并后的对象
 */
function mergeObjects(target, source) {
    return { ...target, ...source };
}


/**
 * ==========================================
 * 验证函数
 * ==========================================
 */

/**
 * 检查是否填写了必填字段
 * @param {string} value - 字段值
 * @returns {boolean} 是否有效
 */
function isRequired(value) {
    return !isEmpty(value);
}


/**
 * 检查是否为有效的文件名
 * @param {string} filename - 文件名
 * @returns {boolean} 是否有效
 */
function isValidFilename(filename) {
    // 不允许的特殊字符
    const invalidChars = /[<>:"/\\|?*]/;
    return !invalidChars.test(filename);
}


/**
 * 获取文件扩展名
 * @param {string} filename - 文件名
 * @returns {string} 扩展名（不含点）
 */
function getFileExtension(filename) {
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
}


/**
 * ==========================================
 * 事件处理
 * ==========================================
 */

/**
 * 阻止事件冒泡
 * @param {Event} event - 事件对象
 */
function stopEventPropagation(event) {
    if (event) {
        event.stopPropagation();
    }
}


/**
 * 监听 ESC 键按下事件
 * @param {Function} callback - 回调函数
 */
function onEscapeKey(callback) {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            callback();
        }
    });
}


/**
 * ==========================================
 * 拖拽排序工具函数
 * ==========================================
 */

/**
 * 拖拽排序管理器
 * 用于管理分类和产品的拖拽排序功能
 */
const DragSort = {
    // 当前拖拽的元素
    draggedElement: null,
    // 拖拽的数据信息
    draggedData: null,
    // 是否处于排序模式
    isSortingMode: false,
    // 排序模式类型：'category' | 'product'
    sortType: null,
    // 排序上下文（用于限制同级排序）
    sortContext: null,

    /**
     * 开始拖拽
     * @param {HTMLElement} element - 拖拽的元素
     * @param {Object} data - 拖拽的数据 { type, level, item, parent1, parent2 }
     */
    startDrag(element, data) {
        this.draggedElement = element;
        this.draggedData = data;
        element.classList.add('dragging');
    },

    /**
     * 结束拖拽
     */
    endDrag() {
        if (this.draggedElement) {
            this.draggedElement.classList.remove('dragging');
        }
        this.draggedElement = null;
        this.draggedData = null;

        // 移除所有 drag-over 样式
        document.querySelectorAll('.drag-over, .drag-over-bottom').forEach(el => {
            el.classList.remove('drag-over', 'drag-over-bottom');
        });
    },

    /**
     * 检查是否可以放置（同级限制）
     * @param {Object} targetData - 目标位置的数据
     * @returns {boolean} 是否可以放置
     */
    canDrop(targetData) {
        if (!this.draggedData || !targetData) return false;

        // 同类型才能放置（如一级分类只能放在一级分类列表中）
        if (this.draggedData.type !== targetData.type) return false;

        // 同级别才能放置（如二级分类只能放在二级分类列表中）
        if (this.draggedData.level !== targetData.level) return false;

        // 如果是三级分类或产品，必须在同一父分类下
        if (this.draggedData.level >= 3) {
            if (!this.draggedData.parent2 || !targetData.parent2) return false;
            return this.draggedData.parent2.name_cn === targetData.parent2.name_cn;
        }

        // 如果是二级分类，必须在同一父分类下
        if (this.draggedData.level === 2) {
            if (!this.draggedData.parent1 || !targetData.parent1) return false;
            return this.draggedData.parent1.name_cn === targetData.parent1.name_cn;
        }

        // 一级分类可以在整个列表中移动
        return true;
    },

    /**
     * 进入排序模式
     * @param {string} type - 排序类型：'category' | 'product'
     * @param {Object} context - 排序上下文
     */
    enterSortMode(type, context = null) {
        this.isSortingMode = true;
        this.sortType = type;
        this.sortContext = context;

        // 添加排序模式样式到 body
        document.body.classList.add('sorting-mode');
    },

    /**
     * 退出排序模式
     */
    exitSortMode() {
        this.isSortingMode = false;
        this.sortType = null;
        this.sortContext = null;

        // 移除排序模式样式
        document.body.classList.remove('sorting-mode');

        // 移除所有拖拽样式
        document.querySelectorAll('.dragging, .drag-over, .drag-over-bottom').forEach(el => {
            el.classList.remove('dragging', 'drag-over', 'drag-over-bottom');
        });
    }
};


/**
 * 初始化元素的拖拽排序功能
 * @param {HTMLElement} element - 可拖拽的元素
 * @param {Object} options - 配置选项
 */
function initDraggable(element, options) {
    const {
        data,           // 拖拽数据
        handleClass,    // 拖拽手柄的 class（可选）
        onDragStart,   // 开始拖拽回调
        onDragEnd,     // 结束拖拽回调
        onDrop         // 放置回调
    } = options;

    // 如果指定了 handle，只允许在手柄上拖拽
    if (handleClass) {
        const handle = element.querySelector('.' + handleClass);
        if (handle) {
            handle.addEventListener('mousedown', (e) => {
                e.preventDefault();
                startDragHandler(element, data, onDragStart, onDragEnd, onDrop);
            });
        }
    } else {
        element.addEventListener('mousedown', (e) => {
            e.preventDefault();
            startDragHandler(element, data, onDragStart, onDragEnd, onDrop);
        });
    }
}


/**
 * 开始拖拽处理
 */
function startDragHandler(element, data, onDragStart, onDragEnd, onDrop) {
    DragSort.startDrag(element, data);

    if (onDragStart) {
        onDragStart(data);
    }

    // 添加鼠标移动和释放事件
    const mouseMoveHandler = (e) => {
        handleDragMove(e, element);
    };

    const mouseUpHandler = (e) => {
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);

        handleDragEnd(e, element, onDragEnd, onDrop);
    };

    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
}


/**
 * 处理拖拽移动
 */
function handleDragMove(e, draggedElement) {
    // 获取鼠标位置下的元素
    const targetElement = getDragTargetElement(e, draggedElement);

    // 移除所有 drag-over 样式
    document.querySelectorAll('.drag-over, .drag-over-bottom').forEach(el => {
        if (el !== draggedElement) {
            el.classList.remove('drag-over', 'drag-over-bottom');
        }
    });

    // 如果目标元素可以放置，添加样式
    if (targetElement && targetElement !== draggedElement) {
        const targetData = targetElement.dataset.sortData ? JSON.parse(targetElement.dataset.sortData) : null;

        if (targetData && DragSort.canDrop(targetData)) {
            // 根据鼠标位置决定是放在上方还是下方
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
}


/**
 * 处理拖拽结束
 */
function handleDragEnd(e, draggedElement, onDragEnd, onDrop) {
    // 获取放置目标
    const targetElement = document.querySelector('.drag-over, .drag-over-bottom');

    if (targetElement) {
        const targetData = targetElement.dataset.sortData ? JSON.parse(targetElement.dataset.sortData) : null;
        const isAbove = targetElement.classList.contains('drag-over');

        if (targetData && onDrop) {
            onDrop(DragSort.draggedData, targetData, isAbove);
        }
    }

    if (onDragEnd) {
        onDragEnd(DragSort.draggedData);
    }

    DragSort.endDrag();
}


/**
 * 获取拖拽目标元素
 */
function getDragTargetElement(e, excludeElement) {
    // 获取鼠标位置下的所有元素
    const elementsAtPoint = document.elementsFromPoint(e.clientX, e.clientY);

    // 找到第一个可放置的元素
    for (const el of elementsAtPoint) {
        if (el === excludeElement) continue;
        if (el.classList.contains('sortable-item') || el.classList.contains('product-sortable-item')) {
            if (el.dataset.sortData) {
                return el;
            }
        }
    }

    return null;
}


/**
 * 在数组中移动元素
 * @param {Array} array - 数组
 * @param {number} fromIndex - 原索引
 * @param {number} toIndex - 目标索引
 * @returns {Array} 移动后的新数组
 */
function moveArrayElement(array, fromIndex, toIndex) {
    const newArray = [...array];
    const [removed] = newArray.splice(fromIndex, 1);
    newArray.splice(toIndex, 0, removed);
    return newArray;
}

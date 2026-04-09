/**
 * 海拓選品 - 数据服务层
 *
 * 封装所有数据操作，提供清晰的数据访问接口
 *
 * 这个模块是重构的核心，它：
 * 1. 隔离了数据操作的复杂性
 * 2. 提供了统一的数据访问接口
 * 3. 负责分类和产品的 CRUD 操作
 */

/**
 * ==========================================
 * 数据服务管理器
 * ==========================================
 */
const DataService = {

    // ==========================================
    // 辅助方法（内部使用）
    // ==========================================

    /**
     * 根据名称在数据中查找一级分类
     * @param {string} name - 分类名称
     * @returns {Object|null} 找到的分类或 null
     */
    findLevel1ByName(name) {
        return AppState.data.find(c => c.name_cn === name) || null;
    },

    /**
     * 根据名称在指定一级分类下查找二级分类
     * @param {Object} level1 - 一级分类
     * @param {string} name - 二级分类名称
     * @returns {Object|null} 找到的分类或 null
     */
    findLevel2ByName(level1, name) {
        if (!level1 || !level1.children) return null;
        return level1.children.find(c => c.name_cn === name) || null;
    },

    /**
     * 根据名称在指定二级分类下查找三级分类
     * @param {Object} level2 - 二级分类
     * @param {string} name - 三级分类名称
     * @returns {Object|null} 找到的分类或 null
     */
    findLevel3ByName(level2, name) {
        if (!level2 || !level2.children) return null;
        return level2.children.find(c => c.name_cn === name) || null;
    },

    /**
     * 查找分类在数据中的索引
     * @param {Object} category - 分类对象
     * @param {number} level - 分类级别 1, 2, 3
     * @param {Object} parent1 - 一级父分类
     * @param {Object} parent2 - 二级父分类
     * @returns {Object} 包含索引信息的对象
     */
    findCategoryIndex(category, level, parent1, parent2) {
        const result = { found: false, level1Index: -1, level2Index: -1, level3Index: -1 };

        if (level === 1) {
            const idx = AppState.data.findIndex(c => c.name_cn === category.name_cn);
            if (idx !== -1) {
                result.found = true;
                result.level1Index = idx;
            }
        } else if (level === 2 && parent1) {
            const l1Idx = AppState.data.findIndex(c => c.name_cn === parent1.name_cn);
            if (l1Idx !== -1 && AppState.data[l1Idx].children) {
                const l2Idx = AppState.data[l1Idx].children.findIndex(c => c.name_cn === category.name_cn);
                if (l2Idx !== -1) {
                    result.found = true;
                    result.level1Index = l1Idx;
                    result.level2Index = l2Idx;
                }
            }
        } else if (level === 3 && parent1 && parent2) {
            const l1Idx = AppState.data.findIndex(c => c.name_cn === parent1.name_cn);
            if (l1Idx !== -1 && AppState.data[l1Idx].children) {
                const l2Idx = AppState.data[l1Idx].children.findIndex(c => c.name_cn === parent2.name_cn);
                if (l2Idx !== -1 && AppState.data[l1Idx].children[l2Idx].children) {
                    const l3Idx = AppState.data[l1Idx].children[l2Idx].children.findIndex(c => c.name_cn === category.name_cn);
                    if (l3Idx !== -1) {
                        result.found = true;
                        result.level1Index = l1Idx;
                        result.level2Index = l2Idx;
                        result.level3Index = l3Idx;
                    }
                }
            }
        }

        return result;
    },


    // ==========================================
    // 数据加载和保存
    // ==========================================

    /**
     * 加载数据
     * @returns {Promise<Object>} data.json 内容
     */
    async loadData() {
        const data = await API.getData();
        AppState.setData(data);
        return data;
    },

    /**
     * 保存数据
     * @returns {Promise<boolean>} 是否保存成功
     */
    async saveData() {
        const result = await API.saveData(AppState.data);
        if (result.success) {
            AppState.lastUpdated = new Date().toISOString();
        }
        return result.success;
    },


    // ==========================================
    // 分类操作
    // ==========================================

    /**
     * 获取所有分类
     * @returns {Array} 分类数组
     */
    getCategories() {
        return AppState.data || [];
    },

    /**
     * 统计分类下的产品数量（递归）
     * @param {Object} category - 分类对象
     * @returns {number} 产品数量
     */
    countProductsInCategory(category) {
        let count = 0;

        if (category.products) {
            count += category.products.length;
        }

        if (category.children) {
            category.children.forEach(child => {
                count += this.countProductsInCategory(child);
            });
        }

        return count;
    },

    /**
     * 添加分类
     * @param {Object} categoryData - 分类数据 { name_cn, name_jp }
     * @param {number} level - 分类级别 1, 2, 3
     * @param {Object} parent1 - 一级父分类（level >= 2 时需要）
     * @param {Object} parent2 - 二级父分类（level === 3 时需要）
     * @returns {boolean} 是否添加成功
     */
    addCategory(categoryData, level, parent1 = null, parent2 = null) {
        const newCategory = {
            name_cn: categoryData.name_cn,
            name_jp: categoryData.name_jp,
            children: [],
            products: []
        };

        if (level === 1) {
            // 添加到根目录
            AppState.data.push(newCategory);
            return true;
        } else if (level === 2 && parent1) {
            // 添加到一级分类
            const idx = AppState.data.findIndex(c => c.name_cn === parent1.name_cn);
            if (idx !== -1) {
                if (!AppState.data[idx].children) {
                    AppState.data[idx].children = [];
                }
                AppState.data[idx].children.push(newCategory);
                return true;
            }
        } else if (level === 3 && parent1 && parent2) {
            // 添加到二级分类
            const l1Idx = AppState.data.findIndex(c => c.name_cn === parent1.name_cn);
            if (l1Idx !== -1 && AppState.data[l1Idx].children) {
                const l2Idx = AppState.data[l1Idx].children.findIndex(c => c.name_cn === parent2.name_cn);
                if (l2Idx !== -1) {
                    if (!AppState.data[l1Idx].children[l2Idx].children) {
                        AppState.data[l1Idx].children[l2Idx].children = [];
                    }
                    AppState.data[l1Idx].children[l2Idx].children.push(newCategory);
                    return true;
                }
            }
        }

        return false;
    },

    /**
     * 更新分类
     * @param {Object} category - 要更新的分类对象
     * @param {Object} categoryData - 新的分类数据 { name_cn, name_jp }
     * @param {number} level - 分类级别
     * @param {Object} parent1 - 一级父分类
     * @param {Object} parent2 - 二级父分类
     * @returns {boolean} 是否更新成功
     */
    updateCategory(category, categoryData, level, parent1, parent2) {
        const indices = this.findCategoryIndex(category, level, parent1, parent2);

        if (!indices.found) {
            return false;
        }

        if (level === 1) {
            AppState.data[indices.level1Index].name_cn = categoryData.name_cn;
            AppState.data[indices.level1Index].name_jp = categoryData.name_jp;
            return true;
        } else if (level === 2) {
            AppState.data[indices.level1Index].children[indices.level2Index].name_cn = categoryData.name_cn;
            AppState.data[indices.level1Index].children[indices.level2Index].name_jp = categoryData.name_jp;
            return true;
        } else if (level === 3) {
            AppState.data[indices.level1Index].children[indices.level2Index].children[indices.level3Index].name_cn = categoryData.name_cn;
            AppState.data[indices.level1Index].children[indices.level2Index].children[indices.level3Index].name_jp = categoryData.name_jp;
            return true;
        }

        return false;
    },

    /**
     * 删除分类
     * @param {Object} category - 要删除的分类对象
     * @param {number} level - 分类级别
     * @param {Object} parent1 - 一级父分类
     * @param {Object} parent2 - 二级父分类
     * @returns {Object} { success: boolean, error?: string, folderPath?: string }
     */
    deleteCategory(category, level, parent1, parent2) {
        // 检查是否有子分类或产品
        const hasChildren = category.children && category.children.length > 0;
        const hasProducts = category.products && category.products.length > 0;
        const totalProducts = this.countProductsInCategory(category);

        if (hasChildren || hasProducts || totalProducts > 0) {
            return {
                success: false,
                error: hasChildren ? '分类下还有子分类，无法删除' : '分类下还有产品，无法删除'
            };
        }

        const indices = this.findCategoryIndex(category, level, parent1, parent2);

        if (!indices.found) {
            return { success: false, error: '找不到要删除的分类' };
        }

        // 执行删除
        if (level === 1) {
            AppState.data.splice(indices.level1Index, 1);
        } else if (level === 2) {
            AppState.data[indices.level1Index].children.splice(indices.level2Index, 1);
        } else if (level === 3) {
            AppState.data[indices.level1Index].children[indices.level2Index].children.splice(indices.level3Index, 1);
        }

        // 返回要删除的文件夹路径
        let folderPath = 'images';
        if (level === 1) {
            folderPath = 'images/' + category.name_cn;
        } else if (level === 2) {
            folderPath = 'images/' + parent1.name_cn + '/' + category.name_cn;
        } else if (level === 3) {
            folderPath = 'images/' + parent1.name_cn + '/' + parent2.name_cn + '/' + category.name_cn;
        }

        return { success: true, folderPath };
    },


    // ==========================================
    // 产品操作
    // ==========================================

    /**
     * 收集所有产品（带分类信息）
     * @returns {Array} 产品数组，每个产品包含 level1, level2, level3 引用
     */
    collectAllProducts() {
        let products = [];

        AppState.data.forEach(level1 => {
            // 一级分类下的产品
            if (level1.products) {
                level1.products.forEach(product => {
                    products.push({
                        ...product,
                        level1: level1,
                        level2: null,
                        level3: null
                    });
                });
            }

            if (level1.children) {
                level1.children.forEach(level2 => {
                    // 二级分类下的产品
                    if (level2.products) {
                        level2.products.forEach(product => {
                            products.push({
                                ...product,
                                level1: level1,
                                level2: level2,
                                level3: null
                            });
                        });
                    }

                    if (level2.children) {
                        level2.children.forEach(level3 => {
                            // 三级分类下的产品
                            if (level3.products) {
                                level3.products.forEach(product => {
                                    products.push({
                                        ...product,
                                        level1: level1,
                                        level2: level2,
                                        level3: level3
                                    });
                                });
                            }
                        });
                    }
                });
            }
        });

        return products;
    },

    /**
     * 按分类筛选产品
     * @param {Object|null} category - 分类对象，null 表示返回所有产品
     * @returns {Array} 筛选后的产品数组
     */
    filterProductsByCategory(category) {
        if (!category) {
            return this.collectAllProducts();
        }

        const allProducts = this.collectAllProducts();
        return allProducts.filter(product => {
            return (
                (product.level1 && product.level1.name_cn === category.name_cn) ||
                (product.level2 && product.level2.name_cn === category.name_cn) ||
                (product.level3 && product.level3.name_cn === category.name_cn)
            );
        });
    },

    /**
     * 在当前分类下收集产品（用于展示页）
     * @returns {Array} 产品数组
     */
    collectCurrentProducts() {
        let products = [];

        if (!AppState.currentLevel1) return products;

        if (!AppState.currentLevel2) {
            // 选中一级分类：收集该分类下所有产品
            if (AppState.currentLevel1.products) {
                products = products.concat(AppState.currentLevel1.products);
            }
            if (AppState.currentLevel1.children) {
                AppState.currentLevel1.children.forEach(level2 => {
                    if (level2.products) {
                        products = products.concat(level2.products);
                    }
                    if (level2.children) {
                        level2.children.forEach(level3 => {
                            if (level3.products) {
                                products = products.concat(level3.products);
                            }
                        });
                    }
                });
            }
        } else if (!AppState.currentLevel3) {
            // 选中二级分类
            if (AppState.currentLevel2.products) {
                products = products.concat(AppState.currentLevel2.products);
            }
            if (AppState.currentLevel2.children) {
                AppState.currentLevel2.children.forEach(level3 => {
                    if (level3.products) {
                        products = products.concat(level3.products);
                    }
                });
            }
        } else {
            // 选中三级分类
            if (AppState.currentLevel3.products) {
                products = products.concat(AppState.currentLevel3.products);
            }
        }

        return products;
    },

    /**
     * 获取产品所在的分类对象（在原始数据中）
     * @param {Object} productInfo - 包含 level1, level2, level3 的产品信息
     * @returns {Object|null} 目标分类对象
     */
    getTargetCategory(productInfo) {
        let targetCategory = null;

        if (productInfo.level3) {
            const l1Idx = AppState.data.findIndex(c => c.name_cn === productInfo.level1.name_cn);
            if (l1Idx !== -1 && AppState.data[l1Idx].children) {
                const l2Idx = AppState.data[l1Idx].children.findIndex(c => c.name_cn === productInfo.level2.name_cn);
                if (l2Idx !== -1 && AppState.data[l1Idx].children[l2Idx].children) {
                    const l3Idx = AppState.data[l1Idx].children[l2Idx].children.findIndex(c => c.name_cn === productInfo.level3.name_cn);
                    if (l3Idx !== -1) {
                        targetCategory = AppState.data[l1Idx].children[l2Idx].children[l3Idx];
                    }
                }
            }
        } else if (productInfo.level2) {
            const l1Idx = AppState.data.findIndex(c => c.name_cn === productInfo.level1.name_cn);
            if (l1Idx !== -1 && AppState.data[l1Idx].children) {
                const l2Idx = AppState.data[l1Idx].children.findIndex(c => c.name_cn === productInfo.level2.name_cn);
                if (l2Idx !== -1) {
                    targetCategory = AppState.data[l1Idx].children[l2Idx];
                }
            }
        } else if (productInfo.level1) {
            const l1Idx = AppState.data.findIndex(c => c.name_cn === productInfo.level1.name_cn);
            if (l1Idx !== -1) {
                targetCategory = AppState.data[l1Idx];
            }
        }

        return targetCategory;
    },

    /**
     * 从原始数据中删除产品
     * @param {Object} product - 要删除的产品（可以是原始数据中的引用或新创建的对象）
     * @param {Object} productInfo - 产品的分类信息
     * @returns {boolean} 是否删除成功
     */
    removeProduct(product, productInfo) {
        const targetCategory = this.getTargetCategory(productInfo);

        if (!targetCategory || !targetCategory.products) {
            console.warn('找不到产品所在的分类或分类没有产品数组');
            return false;
        }

        // 使用更可靠的匹配方式：直接通过 name_cn 匹配（因为同级分类下产品名称应该唯一）
        // 或者匹配 name_jp（某些产品可能只有日文名）
        const idx = targetCategory.products.findIndex(p =>
            p.name_cn === product.name_cn || p.name_jp === product.name_jp
        );

        if (idx !== -1) {
            targetCategory.products.splice(idx, 1);
            console.log(`成功删除产品: ${product.name_cn}`);
            return true;
        }

        console.warn('在分类中找不到要删除的产品:', product);
        return false;
    },

    /**
     * 添加产品到目标分类
     * @param {Object} targetCategory - 目标分类对象
     * @param {Object} productData - 产品数据
     * @returns {boolean} 是否添加成功
     */
    addProduct(targetCategory, productData) {
        if (!targetCategory.products) {
            targetCategory.products = [];
        }
        targetCategory.products.push(productData);
        return true;
    }
};

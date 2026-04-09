# -*- coding: utf-8 -*-
"""
Anxuan Selected - Mac 打包脚本
专门用于打包 Mac 平台的可执行程序
使用方法:
    python build_mac.py
"""

import os
import sys
import shutil


def create_release_dir(base_dir):
    """
    创建发布目录
    参数: base_dir - 项目根目录
    返回: 发布目录路径
    """
    release_dir_name = "Anxuan_Select_Mac"
    release_dir = os.path.join(base_dir, release_dir_name)

    print("\n" + "=" * 70)
    print(f"Creating release directory: {release_dir_name}")
    print("=" * 70)

    if os.path.exists(release_dir):
        shutil.rmtree(release_dir)

    os.makedirs(release_dir, exist_ok=True)
    print(f"  [OK] 发布目录已创建")

    return release_dir


def copy_release_files(base_dir, release_dir):
    """
    复制发布文件到发布目录
    参数:
        base_dir - 项目根目录
        release_dir - 发布目录路径
    """
    print("\n" + "=" * 70)
    print("Copying release files...")
    print("=" * 70)

    files_to_copy = ['index.html', 'manage.html', 'data.json', 'app.py']

    for filename in files_to_copy:
        src = os.path.join(base_dir, filename)
        if os.path.exists(src):
            shutil.copy2(src, release_dir)
            print(f"  [OK] {filename}")

    dirs_to_copy = ['css', 'js', 'images']

    for dirname in dirs_to_copy:
        src = os.path.join(base_dir, dirname)
        dst = os.path.join(release_dir, dirname)
        if os.path.exists(src):
            print(f"  [Copying] {dirname}/ ...")
            shutil.copytree(src, dst)
            print(f"  [OK] {dirname}/")


def create_start_script(release_dir):
    """
    创建 Mac 启动脚本
    参数: release_dir - 发布目录路径
    """
    print("\n" + "=" * 70)
    print("Creating start script...")
    print("=" * 70)

    script_content = '''#!/bin/bash
# Anxuan Selected - 启动脚本
# 双击此文件即可启动服务

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )"
cd "$SCRIPT_DIR"

# 检查 Python3 是否安装
if ! command -v python3 &> /dev/null; then
    echo "Error: Python3 is not installed."
    echo "Please install Python3 from https://www.python.org/downloads/"
    read -p "Press Enter to exit..."
    exit 1
fi

# 检查端口是否被占用
if lsof -Pi :8888 -sTCP:LISTEN -t &> /dev/null; then
    echo "Error: Port 8888 is already in use."
    echo "Please stop the existing server or change the port."
    read -p "Press Enter to exit..."
    exit 1
fi

# 启动服务器
echo "========================================"
echo "Anxuan Selected - Starting Server"
echo "========================================"
echo ""
echo "Server starting on: http://localhost:8888"
echo ""
echo "- Homepage: http://localhost:8888/index.html"
echo "- Admin page: http://localhost:8888/manage.html"
echo ""
echo "Press Ctrl+C to stop the server"
echo "========================================"
echo ""

# 尝试自动打开浏览器
if command -v open &> /dev/null; then
    (sleep 2 && open http://localhost:8888/index.html) &
fi

# 启动 Python 服务器
python3 app.py
'''

    script_file = os.path.join(release_dir, 'Start Server.command')
    with open(script_file, 'w', encoding='utf-8') as f:
        f.write(script_content)

    os.chmod(script_file, 0o755)
    print(f"  [OK] Start Server.command")


def create_readme(release_dir):
    """
    创建使用说明文档
    参数: release_dir - 发布目录路径
    """
    print("\n" + "=" * 70)
    print("Creating README file...")
    print("=" * 70)

    readme_content = '''Anxuan Selected - 使用说明 (Mac版)
=================================

系统要求
--------
- macOS 10.13 (High Sierra) 或更高版本
- 需要安装 Python 3.x

前置准备
--------
1. 如果还没有安装 Python，请从以下地址下载安装：
   https://www.python.org/downloads/

2. 安装完成后，打开 "终端" (Terminal) 应用

3. 验证 Python 是否安装成功：
   python3 --version

使用方法
--------

方法1：启动脚本（推荐）
--------------------
1. 将 "Anxuan_Select_Mac" 文件夹整体复制到任意位置
2. 进入文件夹
3. 双击 "Start Server.command" 文件
4. 如果提示 "无法执行"，请先打开终端，进入文件夹后执行：
   chmod +x "Start Server.command"
   然后再次双击运行

方法2：通过终端启动
----------------
1. 打开终端，进入到 Anxuan_Select_Mac 文件夹
2. 执行以下命令：
   python3 app.py
3. 在浏览器中打开 http://localhost:8888

方法3：直接打开HTML（仅供查看）
---------------------------
1. 直接用浏览器打开 "index.html"
2. 注意：直接打开可能导致 data.json 无法正常加载，推荐使用方法1或2

注意事项
--------
- 请保持文件夹完整，不要单独移动文件
- 数据文件 data.json 和图片文件夹 images/ 会被实时修改
- 请定期备份 data.json 和 images/ 文件夹
- 如果端口 8888 被占用，请先关闭占用该端口的程序

功能介绍
--------
- 中日语言切换（右上角按钮）
- 三级分类导航
- 商品卡片展示
- 商品详情弹窗（多图展示）
- 返回顶部按钮
- 面包屑导航
- 管理后台（manage.html）

文件说明
--------
Start Server.command  - 启动脚本（双击运行）
app.py                - 服务器程序
index.html           - 选品展示页面
manage.html          - 管理后台页面
data.json            - 商品数据文件
css/                 - 样式表
js/                  - JavaScript
images/              - 商品图片库
使用说明.txt         - 本文件

常见问题
--------

Q: 双击 Start Server.command 没有任何反应？
A: 请在终端中执行：chmod +x "Start Server.command"

Q: 提示 "Python3 is not installed"？
A: 请先安装 Python 3.x，从 https://www.python.org/downloads/ 下载

Q: 端口 8888 被占用？
A: 请关闭占用该端口的其他程序，或修改 app.py 中的端口

Q: 图片无法显示？
A: 请确保通过服务器方式启动（方法1或2），而不是直接打开 HTML 文件

=================================
'''

    readme_file = os.path.join(release_dir, '使用说明.txt')
    with open(readme_file, 'w', encoding='utf-8') as f:
        f.write(readme_content)

    print(f"  [OK] 使用说明.txt")


def main():
    """
    主函数：执行 Mac 打包流程
    """
    print("=" * 70)
    print("Anxuan Selected - Mac Build Tool")
    print("=" * 70)

    base_dir = os.path.dirname(os.path.abspath(__file__))
    print(f"\nProject directory: {base_dir}")

    try:
        release_dir = create_release_dir(base_dir)

        copy_release_files(base_dir, release_dir)

        create_start_script(release_dir)

        create_readme(release_dir)

        print("\n" + "=" * 70)
        print("Build Complete!")
        print("=" * 70)
        print(f"\nRelease files location: {release_dir}")
        print("\nMac files:")
        print("  - Start Server.command (双击启动)")
        print("  - app.py")
        print("  - index.html")
        print("  - manage.html")
        print("  - css/")
        print("  - js/")
        print("  - 使用说明.txt")
        print("\n" + "=" * 70)

    except Exception as e:
        print(f"\nBuild process error: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()

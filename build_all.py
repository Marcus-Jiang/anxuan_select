# -*- coding: utf-8 -*-
"""
Anxuan Selected - 全平台打包脚本
同时打包 Windows 和 Mac 两个平台版本
使用方法:
    python build_all.py
"""

import os
import sys
import shutil


def clean_build_dirs(base_dir):
    """清理旧的构建目录"""
    print("\n" + "=" * 70)
    print("Cleaning old build directories...")
    print("=" * 70)

    dirs_to_clean = ['build', 'dist']
    for dir_name in dirs_to_clean:
        dir_path = os.path.join(base_dir, dir_name)
        if os.path.exists(dir_path):
            print(f"  Removing directory: {dir_name}")
            shutil.rmtree(dir_path)

    print("  Cleanup complete!")


def build_windows_release(base_dir):
    """构建 Windows 发布版本"""
    print("\n" + "#" * 70)
    print("# Building Windows Release")
    print("#" * 70)

    release_dir_name = "Anxuan_Select_Windows"
    release_dir = os.path.join(base_dir, release_dir_name)

    if os.path.exists(release_dir):
        shutil.rmtree(release_dir)
    os.makedirs(release_dir, exist_ok=True)
    print(f"  [OK] Created {release_dir_name}")

    try:
        import PyInstaller
        print(f"  [OK] PyInstaller version: {PyInstaller.__version__}")
    except ImportError:
        print("  [Error] PyInstaller not installed!")
        return False

    pyinstaller_cmd = [
        'pyinstaller',
        '--onefile',
        '--name', 'Anxuan_Selected',
        '--add-data', 'index.html;.',
        '--add-data', 'manage.html;.',
        '--add-data', 'data.json;.',
        '--add-data', 'css;css',
        '--add-data', 'js;js',
        '--add-data', 'images;images',
        '--console',
        'app.py'
    ]

    original_cwd = os.getcwd()
    os.chdir(base_dir)

    try:
        from PyInstaller import __main__ as pyi_main
        pyi_main.run(pyinstaller_cmd[1:])
        print("  [OK] PyInstaller build complete")
    except Exception as e:
        print(f"  [Error] PyInstaller failed: {str(e)}")
        return False
    finally:
        os.chdir(original_cwd)

    dist_dir = os.path.join(base_dir, 'dist')
    exe_file = os.path.join(dist_dir, 'Anxuan_Selected.exe')
    if os.path.exists(exe_file):
        shutil.copy2(exe_file, release_dir)
        print("  [OK] Copied Anxuan_Selected.exe")

    for filename in ['index.html', 'manage.html', 'data.json']:
        src = os.path.join(base_dir, filename)
        if os.path.exists(src):
            shutil.copy2(src, release_dir)
            print(f"  [OK] Copied {filename}")

    for dirname in ['css', 'js', 'images']:
        src = os.path.join(base_dir, dirname)
        dst = os.path.join(release_dir, dirname)
        if os.path.exists(src):
            shutil.copytree(src, dst)
            print(f"  [OK] Copied {dirname}/")

    readme_content = '''Anxuan Selected - 使用说明 (Windows版)
=================================

系统要求
--------
- Windows 7 或更高版本
- 无需安装 Python 或其他依赖项

使用方法
--------

方法1：EXE文件（推荐）
-----------------
1. 将文件夹整体复制到任意位置
2. 双击 "Anxuan_Selected.exe"
3. 自动启动本地服务器，浏览器将打开
4. 开始使用选品网站！
5. 关闭时，请关闭控制台窗口

方法2：直接打开HTML
-----------------
1. 直接用浏览器打开 "index.html"
2. 注意：直接打开可能导致 data.json 无法正常加载，推荐使用方法1

注意事项
--------
- "Anxuan_Selected.exe" 可以单独运行，但建议保持文件夹完整
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

=================================
'''

    readme_file = os.path.join(release_dir, '使用说明.txt')
    with open(readme_file, 'w', encoding='utf-8') as f:
        f.write(readme_content)
    print("  [OK] Created 使用说明.txt")

    return True


def build_mac_release(base_dir):
    """构建 Mac 发布版本"""
    print("\n" + "#" * 70)
    print("# Building Mac Release")
    print("#" * 70)

    release_dir_name = "Anxuan_Select_Mac"
    release_dir = os.path.join(base_dir, release_dir_name)

    if os.path.exists(release_dir):
        shutil.rmtree(release_dir)
    os.makedirs(release_dir, exist_ok=True)
    print(f"  [OK] Created {release_dir_name}")

    for filename in ['index.html', 'manage.html', 'data.json', 'app.py']:
        src = os.path.join(base_dir, filename)
        if os.path.exists(src):
            shutil.copy2(src, release_dir)
            print(f"  [OK] Copied {filename}")

    for dirname in ['css', 'js', 'images']:
        src = os.path.join(base_dir, dirname)
        dst = os.path.join(release_dir, dirname)
        if os.path.exists(src):
            shutil.copytree(src, dst)
            print(f"  [OK] Copied {dirname}/")

    script_content = '''#!/bin/bash
# Anxuan Selected - 启动脚本
# 双击此文件即可启动服务

SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )"
cd "$SCRIPT_DIR"

if ! command -v python3 &> /dev/null; then
    echo "Error: Python3 is not installed."
    echo "Please install Python3 from https://www.python.org/downloads/"
    read -p "Press Enter to exit..."
    exit 1
fi

if lsof -Pi :8888 -sTCP:LISTEN -t &> /dev/null; then
    echo "Error: Port 8888 is already in use."
    echo "Please stop the existing server or change the port."
    read -p "Press Enter to exit..."
    exit 1
fi

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

if command -v open &> /dev/null; then
    (sleep 2 && open http://localhost:8888/index.html) &
fi

python3 app.py
'''

    script_file = os.path.join(release_dir, 'Start Server.command')
    with open(script_file, 'w', encoding='utf-8') as f:
        f.write(script_content)
    os.chmod(script_file, 0o755)
    print("  [OK] Created Start Server.command")

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

注意事项
--------
- 请保持文件夹完整，不要单独移动文件
- 数据文件 data.json 和图片文件夹 images/ 会被实时修改
- 请定期备份 data.json 和 images/ 文件夹
- 如果端口 8888 被占用，请先关闭占用该端口的程序

=================================
'''

    readme_file = os.path.join(release_dir, '使用说明.txt')
    with open(readme_file, 'w', encoding='utf-8') as f:
        f.write(readme_content)
    print("  [OK] Created 使用说明.txt")

    return True


def main():
    """主函数：执行全平台打包流程"""
    print("=" * 70)
    print("Anxuan Selected - Build All Platforms")
    print("=" * 70)

    base_dir = os.path.dirname(os.path.abspath(__file__))
    print(f"\nProject directory: {base_dir}")

    try:
        clean_build_dirs(base_dir)

        print("\n[1/2] Building Windows release...")
        build_windows_release(base_dir)

        print("\n[2/2] Building Mac release...")
        build_mac_release(base_dir)

        print("\n" + "=" * 70)
        print("All Builds Complete!")
        print("=" * 70)
        print(f"\nOutput directories:")
        print(f"  - Windows: {os.path.join(base_dir, 'Anxuan_Select_Windows')}")
        print(f"  - Mac: {os.path.join(base_dir, 'Anxuan_Select_Mac')}")
        print("\n" + "=" * 70)

    except Exception as e:
        print(f"\nBuild process error: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()

# -*- coding: utf-8 -*-
"""
Anxuan Selected - Windows 打包脚本
专门用于打包 Windows 平台的可执行程序
使用方法:
    python build_windows.py
    或双击运行 build_windows.bat
"""

import os
import sys
import shutil


def clean_build_dirs(base_dir):
    """
    清理旧的构建目录
    参数: base_dir - 项目根目录
    """
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


def create_release_dir(base_dir):
    """
    创建发布目录
    参数: base_dir - 项目根目录
    返回: 发布目录路径
    """
    release_dir_name = "Anxuan_Select_Windows"
    release_dir = os.path.join(base_dir, release_dir_name)

    print("\n" + "=" * 70)
    print(f"Creating release directory: {release_dir_name}")
    print("=" * 70)

    if os.path.exists(release_dir):
        shutil.rmtree(release_dir)

    os.makedirs(release_dir, exist_ok=True)
    print(f"  [OK] 发布目录已创建")

    return release_dir


def build_executable(base_dir):
    """
    使用 PyInstaller 打包可执行文件
    参数: base_dir - 项目根目录
    """
    print("\n" + "=" * 70)
    print("Building Windows executable...")
    print("=" * 70)

    try:
        import PyInstaller
        print(f"  [OK] PyInstaller installed (version: {PyInstaller.__version__})")
    except ImportError:
        print("  [Error] PyInstaller not installed!")
        print("  Please run: pip install -r requirements.txt")
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
        print(f"\n  Running PyInstaller...")

        from PyInstaller import __main__ as pyi_main
        pyi_main.run(pyinstaller_cmd[1:])

        print(f"\n  [OK] Executable built successfully!")
        return True

    except Exception as e:
        print(f"\n  [Error] Build failed: {str(e)}")
        return False
    finally:
        os.chdir(original_cwd)


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

    dist_dir = os.path.join(base_dir, 'dist')

    exe_file = os.path.join(dist_dir, 'Anxuan_Selected.exe')
    if os.path.exists(exe_file):
        shutil.copy2(exe_file, release_dir)
        print(f"  [OK] Anxuan_Selected.exe")

    backup_files = ['index.html', 'manage.html', 'data.json']
    for filename in backup_files:
        src = os.path.join(base_dir, filename)
        if os.path.exists(src):
            shutil.copy2(src, release_dir)
            print(f"  [OK] {filename}")

    css_src = os.path.join(base_dir, 'css')
    css_dst = os.path.join(release_dir, 'css')
    if os.path.exists(css_src):
        print(f"  [Copying] css/ ...")
        shutil.copytree(css_src, css_dst)
        print(f"  [OK] css/")

    js_src = os.path.join(base_dir, 'js')
    js_dst = os.path.join(release_dir, 'js')
    if os.path.exists(js_src):
        print(f"  [Copying] js/ ...")
        shutil.copytree(js_src, js_dst)
        print(f"  [OK] js/")

    images_src = os.path.join(base_dir, 'images')
    images_dst = os.path.join(release_dir, 'images')
    if os.path.exists(images_src):
        print(f"  [Copying] images/ ...")
        shutil.copytree(images_src, images_dst)
        print(f"  [OK] images/")


def create_readme(release_dir):
    """
    创建使用说明文档
    参数: release_dir - 发布目录路径
    """
    print("\n" + "=" * 70)
    print("Creating README file...")
    print("=" * 70)

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

文件说明
--------
Anxuan_Selected.exe  - 主程序（推荐使用）
index.html          - 选品展示页面
manage.html         - 管理后台页面
data.json           - 商品数据文件
css/                - 样式表
js/                 - JavaScript
images/             - 商品图片库
使用说明.txt        - 本文件

常见问题
--------
Q: EXE文件被杀毒软件拦截了？
A: 这是正常现象，请将文件添加到信任列表

Q: 端口8888无法使用？
A: 请检查是否有其他程序占用了该端口

Q: 图片无法显示？
A: 请使用 "Anxuan_Selected.exe" 启动，或确保 images/ 文件夹在同一目录下

=================================
'''

    readme_file = os.path.join(release_dir, '使用说明.txt')
    with open(readme_file, 'w', encoding='utf-8') as f:
        f.write(readme_content)

    print(f"  [OK] 使用说明.txt")


def main():
    """
    主函数：执行 Windows 打包流程
    """
    print("=" * 70)
    print("Anxuan Selected - Windows Build Tool")
    print("=" * 70)

    base_dir = os.path.dirname(os.path.abspath(__file__))
    print(f"\nProject directory: {base_dir}")

    try:
        clean_build_dirs(base_dir)

        release_dir = create_release_dir(base_dir)

        success = build_executable(base_dir)
        if not success:
            print("\nBuild failed!")
            return

        copy_release_files(base_dir, release_dir)

        create_readme(release_dir)

        print("\n" + "=" * 70)
        print("Build Complete!")
        print("=" * 70)
        print(f"\nRelease files location: {release_dir}")
        print("\nMain files:")
        print("  - Anxuan_Selected.exe")
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

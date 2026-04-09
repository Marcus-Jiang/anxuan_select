# -*- coding: utf-8 -*-
"""
海拓選品 - Flask Web 服务器
使用 Flask 框架实现的选品网站服务器，支持数据管理和图片上传
"""

# ========== 导入必要的模块 ==========
from flask import Flask, request, jsonify, send_from_directory
import os
import sys
import webbrowser
import json
import shutil
from werkzeug.utils import secure_filename

# ========== 获取资源目录的函数 ==========
def get_resource_dir():
    """
    获取资源目录的路径
    - 如果是打包成 EXE 运行，返回临时解压目录或 EXE 所在目录
    - 如果是直接运行脚本，返回脚本所在目录
    """
    if getattr(sys, 'frozen', False):
        # 打包成 EXE 的情况
        if hasattr(sys, '_MEIPASS'):
            # PyInstaller 的临时解压目录
            return sys._MEIPASS
        else:
            # EXE 文件所在的目录
            return os.path.dirname(sys.executable)
    else:
        # 直接运行 Python 脚本的情况
        return os.path.dirname(os.path.abspath(__file__))

# ========== 初始化 Flask 应用 ==========
# 获取资源目录
base_dir = get_resource_dir()

# 切换工作目录到资源目录
os.chdir(base_dir)

# 创建 Flask 应用实例
# __name__ 是 Python 的特殊变量，表示当前模块的名称
# static_folder 告诉 Flask 静态文件在哪里
app = Flask(__name__, static_folder='.', static_url_path='')

# ========== 配置项 ==========
PORT = 8888  # 服务器端口号
DATA_FILE = 'data.json'  # 数据文件路径
UPLOAD_FOLDER = 'images'  # 图片上传目录

# 配置 Flask 的上传文件夹
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
# 限制上传文件的大小为 16MB
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

# 允许上传的图片扩展名
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'}

# ========== 辅助函数 ==========
def allowed_file(filename):
    """
    检查文件扩展名是否允许
    参数: filename - 文件名
    返回: True 如果允许，否则 False
    """
    # 获取文件扩展名并转为小写
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def ensure_dir_exists(dir_path):
    """
    确保目录存在，如果不存在就创建
    参数: dir_path - 目录路径
    """
    if not os.path.exists(dir_path):
        os.makedirs(dir_path)

# ========== API 路由定义 ==========

# 1. GET /api/data - 返回 data.json 的完整内容
@app.route('/api/data', methods=['GET'])
def get_data():
    """
    读取并返回 data.json 的内容
    请求方法: GET
    返回: JSON 格式的数据
    """
    try:
        # 检查数据文件是否存在
        if not os.path.exists(DATA_FILE):
            return jsonify({'error': '数据文件不存在'}), 404
        
        # 读取文件内容
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # 返回成功响应
        return jsonify({
            'success': True,
            'data': data
        })
    
    except Exception as e:
        # 如果出错，返回错误信息
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# 2. POST /api/data - 保存 JSON 数据到 data.json
@app.route('/api/data', methods=['POST'])
def save_data():
    """
    保存 JSON 数据到 data.json
    请求方法: POST
    请求体: JSON 格式的数据
    返回: 操作结果
    """
    try:
        # 获取请求体中的 JSON 数据
        # request.get_json() 会自动解析 JSON 请求体
        data = request.get_json()
        
        if data is None:
            return jsonify({
                'success': False,
                'error': '请求体不是有效的 JSON 格式'
            }), 400
        
        # 备份原文件（如果存在）
        if os.path.exists(DATA_FILE):
            backup_file = DATA_FILE + '.bak'
            shutil.copy2(DATA_FILE, backup_file)
        
        # 保存数据到文件
        # ensure_ascii=False 确保中文字符正常显示
        # indent=2 让 JSON 格式化，方便阅读
        with open(DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        return jsonify({
            'success': True,
            'message': '数据保存成功'
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# 3. POST /api/upload-image - 上传图片到指定路径
@app.route('/api/upload-image', methods=['POST'])
def upload_image():
    """
    上传图片到指定路径
    请求方法: POST
    请求参数:
        - file: 图片文件
        - path: 保存路径（相对路径，例如 'images/分类/产品名.png'）
    返回: 操作结果
    """
    try:
        # 检查请求中是否有文件
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'error': '没有找到文件'
            }), 400
        
        file = request.files['file']
        
        # 检查文件名是否为空
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': '没有选择文件'
            }), 400
        
        # 获取保存路径参数
        save_path = request.form.get('path', '')
        
        # 如果没有指定路径，使用原文件名保存到 images 目录
        if not save_path:
            filename = secure_filename(file.filename)
            save_path = os.path.join(UPLOAD_FOLDER, filename)
        
        # 确保路径是安全的
        save_path = os.path.normpath(save_path)
        
        # 确保保存目录存在
        save_dir = os.path.dirname(save_path)
        if save_dir:
            ensure_dir_exists(save_dir)
        
        # 检查文件类型是否允许
        if not allowed_file(file.filename):
            return jsonify({
                'success': False,
                'error': '不支持的文件类型'
            }), 400
        
        # 保存文件
        file.save(save_path)
        
        return jsonify({
            'success': True,
            'message': '图片上传成功',
            'path': save_path
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# 4. POST /api/delete-image - 删除指定路径的图片
@app.route('/api/delete-image', methods=['POST'])
def delete_image():
    """
    删除指定路径的图片
    请求方法: POST
    请求参数:
        - path: 要删除的图片路径
    返回: 操作结果
    """
    try:
        # 获取请求参数
        data = request.get_json() or request.form
        file_path = data.get('path', '')
        
        if not file_path:
            return jsonify({
                'success': False,
                'error': '请提供要删除的文件路径'
            }), 400
        
        # 确保路径是安全的
        file_path = os.path.normpath(file_path)
        
        # 检查文件是否存在
        if not os.path.exists(file_path):
            return jsonify({
                'success': True,
                'message': '文件不存在，无需删除'
            })
        
        # 删除文件
        os.remove(file_path)
        
        return jsonify({
            'success': True,
            'message': '图片删除成功'
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# 5. POST /api/delete-folder - 删除指定路径的文件夹
@app.route('/api/delete-folder', methods=['POST'])
def delete_folder():
    """
    删除指定路径的文件夹（递归删除）
    请求方法: POST
    请求参数:
        - path: 要删除的文件夹路径
    返回: 操作结果
    """
    try:
        # 获取请求参数
        data = request.get_json() or request.form
        folder_path = data.get('path', '')
        
        if not folder_path:
            return jsonify({
                'success': False,
                'error': '请提供要删除的文件夹路径'
            }), 400
        
        # 确保路径是安全的
        folder_path = os.path.normpath(folder_path)
        
        # 检查文件夹是否存在
        if not os.path.exists(folder_path):
            return jsonify({
                'success': True,
                'message': '文件夹不存在，无需删除'
            })
        
        # 确保是在 images 目录下（安全检查）
        if not folder_path.startswith(UPLOAD_FOLDER):
            return jsonify({
                'success': False,
                'error': '只能删除 images 目录下的文件夹'
            }), 400
        
        # 递归删除文件夹
        shutil.rmtree(folder_path)
        
        return jsonify({
            'success': True,
            'message': '文件夹删除成功'
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ========== 静态文件服务 ==========

# 访问根路径时返回 index.html
@app.route('/')
def index():
    """
    首页路由
    返回 index.html 文件
    """
    return send_from_directory(base_dir, 'index.html')

# 支持访问 manage.html 时打开管理页面
@app.route('/manage.html')
def manage():
    """
    管理页面路由
    返回 manage.html 文件
    """
    manage_path = os.path.join(base_dir, 'manage.html')
    if os.path.exists(manage_path):
        return send_from_directory(base_dir, 'manage.html')
    else:
        return "管理页面文件 manage.html 不存在，请先创建该文件！", 404

# 处理 favicon.ico 请求
@app.route('/favicon.ico')
def favicon():
    """
    网站图标路由
    """
    return '', 204

# 静态文件路由 - 处理 images 目录下的文件（本地开发用，Vercel 上由 @vercel/static 处理）
@app.route('/images/<path:filename>')
def serve_image(filename):
    """
    静态文件路由
    处理 images 目录下的所有文件请求
    在 Vercel 上，图片由 @vercel/static 构建器直接从 CDN 提供
    这个路由只在本地开发时作为备用
    """
    images_dir = os.path.join(base_dir, 'images')
    image_path = os.path.join(images_dir, filename)
    if os.path.exists(image_path):
        return send_from_directory(images_dir, filename)
    else:
        return '', 404

# ========== 主函数 ==========
def main():
    """
    主函数：启动 Flask 服务器
    """
    print("=" * 70)
    print("Anxuan Selected - Flask Web Server")
    print("=" * 70)
    print(f"\n项目目录: {base_dir}")
    print(f"启动端口: {PORT}")
    
    # 检查 index.html 是否存在
    if not os.path.exists('index.html'):
        print("\n错误：index.html 不存在！")
        print("请在正确的目录中运行此脚本。")
        input("\n按 Enter 键退出...")
        return
    
    # 检查 data.json 是否存在
    if not os.path.exists('data.json'):
        print("\n警告：data.json 不存在！")
    
    # 确保 images 目录存在
    ensure_dir_exists(UPLOAD_FOLDER)
    
    # 构建访问 URL
    url = f"http://localhost:{PORT}"
    
    print(f"\n服务器启动成功！")
    print(f"访问地址: {url}")
    print(f"管理页面: {url}/manage.html")
    print("\n" + "=" * 70)
    print("按 Ctrl+C 停止服务器")
    print("=" * 70)
    
    # 7. 支持启动后自动打开浏览器访问 index.html
    try:
        webbrowser.open(url)
        print("\n已自动打开浏览器...")
    except Exception as e:
        print(f"\n无法自动打开浏览器，请手动访问: {url}")
    
    # 启动 Flask 服务器
    # debug=False 表示不使用调试模式（生产环境）
    # use_reloader=False 表示不使用自动重载（避免打包成 EXE 时出现问题）
    try:
        app.run(host='0.0.0.0', port=PORT, debug=False, use_reloader=False)
    except OSError as e:
        if e.errno == 10048:
            print(f"\n错误：端口 {PORT} 已被占用！")
            print("请关闭其他程序或修改端口号。")
        else:
            print(f"\n服务器启动失败: {e}")
        input("\n按 Enter 键退出...")
    except KeyboardInterrupt:
        print("\n\n服务器已停止。")
    except Exception as e:
        print(f"\n发生错误: {e}")
        input("\n按 Enter 键退出...")

# ========== 程序入口 ==========
if __name__ == "__main__":
    main()

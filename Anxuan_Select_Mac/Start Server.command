#!/bin/bash
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

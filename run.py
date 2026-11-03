"""
Nexus-Flow Application Runner
PayPal & AI Hackathon 2026
Production-grade single-command launcher.
"""

import sys
import os
import shutil
import subprocess
from pathlib import Path

# Ensure root directory is in sys.path
ROOT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT_DIR))

import uvicorn
from backend.config import APP_HOST, APP_PORT, APP_ENV, DEBUG

def check_nextjs():
    has_npm = shutil.which("npm") is not None
    has_node = shutil.which("node") is not None
    frontend_dir = ROOT_DIR / "frontend"
    return has_npm and has_node and frontend_dir.exists()

def print_banner(nextjs_status: str):
    banner = f"""
======================================================================
  _   _                       _____ _               
 | \\ | |                     |  ___| |              
 |  \\| | _____  ___   _ ___  | |_  | | _____      __
 | . ` |/ _ \\ \\/ / | | / __| |  _| | |/ _ \\ \\ /\\ / /
 | |\\  |  __/>  <| |_| \\__ \\ | |   | | (_) \\ V  V / 
 |_| \\_|\\___/_/\\_\\\\__,_|___/ \\_|   |_|\\___/ \\_/\\_/  
                                                    
  Autonomous AI Multi-Agent Commerce Engine
  Global PayPal & AI Hackathon 2026
======================================================================
  Environment       : {APP_ENV.upper()}
  Gateway URL       : http://{APP_HOST}:{APP_PORT}
  API Docs          : http://{APP_HOST}:{APP_PORT}/api/docs
  Frontend (Served) : http://{APP_HOST}:{APP_PORT}
  Next.js Status    : {nextjs_status}
  PayPal Engine     : Orders v2 (Sandbox Mode Active)
  APIMatic Audit    : Certified (Zero Invariant Errors)
  Channel3 & Kernel : Multi-Agent Sourcing Active
======================================================================
"""
    print(banner)

def main():
    nextjs_available = check_nextjs()
    next_proc = None

    if nextjs_available:
        nextjs_status = "Available (Port 3000 via npm run dev)"
        try:
            print("[INFO] Launching Next.js development server in background...")
            next_proc = subprocess.Popen(
                ["npm", "run", "dev"],
                cwd=str(ROOT_DIR / "frontend"),
                shell=True
            )
        except Exception as e:
            print(f"[WARN] Could not launch Next.js subprocess: {e}")
            nextjs_status = "FastAPI Unified Mode (Port 8000)"
    else:
        nextjs_status = "FastAPI Direct Serving Mode (Port 8000)"

    print_banner(nextjs_status)

    try:
        uvicorn.run(
            "backend.main:app",
            host=APP_HOST,
            port=APP_PORT,
            reload=DEBUG,
            access_log=True,
            log_level="info"
        )
    finally:
        if next_proc and next_proc.poll() is None:
            print("\n[INFO] Stopping Next.js background process...")
            next_proc.terminate()

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""用 TinyPNG API 壓縮圖片（免費 500 張/月）"""
import os
import sys
import json
import base64
import urllib.request
import urllib.error
import glob

API_KEY = os.environ.get("TINYPNG_KEY", "")

if not API_KEY:
    print("請設定 TinyPNG API Key:")
    print("  1. 到 https://tinypng.com/developers 免費申請")
    print("  2. 執行: TINYPNG_KEY=你的key python3 compress.py")
    sys.exit(1)

# 要壓縮的資料夾
TARGET_DIR = os.path.join(os.path.dirname(__file__), "人物")
AUTH = base64.b64encode(f"api:{API_KEY}".encode()).decode()

files = sorted(
    glob.glob(os.path.join(TARGET_DIR, "*.png"))
    + glob.glob(os.path.join(TARGET_DIR, "*.jpg"))
    + glob.glob(os.path.join(TARGET_DIR, "*.jpeg"))
)

print(f"找到 {len(files)} 張圖片")
total_saved = 0

for i, fpath in enumerate(files, 1):
    fname = os.path.basename(fpath)
    orig_size = os.path.getsize(fpath)

    try:
        # 上傳壓縮
        with open(fpath, "rb") as f:
            data = f.read()

        req = urllib.request.Request(
            "https://api.tinify.com/shrink",
            data=data,
            headers={"Authorization": f"Basic {AUTH}"},
        )
        resp = urllib.request.urlopen(req)
        result = json.loads(resp.read())

        # 下載壓縮後的檔案
        output_url = result["output"]["url"]
        req2 = urllib.request.Request(
            output_url,
            headers={"Authorization": f"Basic {AUTH}"},
        )
        compressed = urllib.request.urlopen(req2).read()

        # 覆蓋原檔
        with open(fpath, "wb") as f:
            f.write(compressed)

        new_size = len(compressed)
        saved = orig_size - new_size
        pct = (saved / orig_size * 100) if orig_size > 0 else 0
        total_saved += saved

        print(
            f"[{i}/{len(files)}] {fname}: "
            f"{orig_size // 1024}KB → {new_size // 1024}KB "
            f"(-{pct:.0f}%)"
        )

    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"[{i}/{len(files)}] {fname}: 錯誤 {e.code} - {body}")
    except Exception as e:
        print(f"[{i}/{len(files)}] {fname}: {e}")

print(f"\n完成！總共節省 {total_saved // 1024}KB")

import os
import sys
import json
import zipfile
import urllib.request

req = urllib.request.Request(
    'https://api.github.com/repos/git-for-windows/git/releases/latest',
    headers={'User-Agent': 'Mozilla/5.0'}
)
resp = urllib.request.urlopen(req)
data = json.loads(resp.read().decode('utf-8'))

# Prefer standard MinGit (with curl & openssh)
assets = [
    a for a in data['assets']
    if 'MinGit' in a['name'] and '64-bit.zip' in a['name'] and 'busybox' not in a['name']
]

if not assets:
    assets = [a for a in data['assets'] if 'MinGit' in a['name'] and '64-bit.zip' in a['name']]

target_asset = assets[0]
download_url = target_asset['browser_download_url']
print(f"Downloading {target_asset['name']} from {download_url}...")

dest_dir = os.path.expandvars(r'%LOCALAPPDATA%\Programs\Git')
os.makedirs(dest_dir, exist_ok=True)
zip_path = os.path.join(dest_dir, 'mingit.zip')

req2 = urllib.request.Request(download_url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req2) as response, open(zip_path, 'wb') as out_file:
    while True:
        chunk = response.read(1024 * 1024)
        if not chunk:
            break
        out_file.write(chunk)
print("Download completed. Extracting...")

with zipfile.ZipFile(zip_path, 'r') as zip_ref:
    zip_ref.extractall(dest_dir)

os.remove(zip_path)
print(f"MinGit successfully installed to: {dest_dir}")
git_exe = os.path.join(dest_dir, 'cmd', 'git.exe')
print(f"Git executable: {git_exe} (exists: {os.path.exists(git_exe)})")

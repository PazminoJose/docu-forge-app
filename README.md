# Tauri + React + Typescript

This template should help get you started developing with Tauri, React and Typescript in Vite.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## Python backed
Add dependency to backend
```bash
uv --directory src-backend add 
```
Build all
```bash
pnpm run build:app
```
Start python backend in dev mode
```bash
pnpm run dev:py
```
Compile python backend
```bash
uv --directory src-backend run pyinstaller run.py --onedir --name python_backend --contents-directory internal --clean --log-level=DEBUG --collect-all sanic --collect-all sanic_routing --collect-all tracerite --collect-all pandas --collect-all openpyxl --collect-all numpy --hidden-import=multiprocessing
```
Copy compile backend to tauri binaries
```bash
.\scripts\copy_binary.ps1
```
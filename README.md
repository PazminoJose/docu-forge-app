# Tauri + React + Typescript

This template should help get you started developing with Tauri, React and Typescript in Vite.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## Python backed
Init python backend
```bash
uv init --no-workspace src-backend --python 3.10
```
Add dependency to backend
```bash
uv --directory src-backend add 
```
Start backend
```bash
uv run --directory src-backend main.py
```
Copile python backend
```bash
uv --directory src-backend run pyinstaller run.py `
  --onefile `
  --name python_backend `
  --clean `
  --log-level=DEBUG `
  --collect-all sanic `
  --collect-all sanic_routing `
  --collect-all tracerite `
  --collect-all pandas `
  --collect-all openpyxl `
  --collect-all numpy `
  --hidden-import=multiprocessing
```
Copy compile backend to tauri binaries
```bash
Copy-Item "src-backend/dist/python_backend.exe" ("src-tauri/binaries/python_backend-" + ((rustc -vV | Select-String "host").ToString().Split()[1]) + ".exe")
```
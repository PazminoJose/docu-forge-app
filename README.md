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
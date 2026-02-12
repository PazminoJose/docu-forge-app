from main import app  

if __name__ == "__main__":
    import multiprocessing
    multiprocessing.freeze_support()  # 👈 enables safe multiprocessing in PyInstaller

    app.run(host="127.0.0.1", port=8000)
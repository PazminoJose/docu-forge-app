use std::sync::{Arc, Mutex};
use tauri::AppHandle;
use tauri::{Emitter, Runtime};
use tauri_plugin_shell::process::{CommandChild, CommandEvent};
use tauri_plugin_shell::ShellExt;

pub fn setup_sidecar<R: Runtime>(app: &AppHandle<R>, sidecar_handle: SidecarHandle) {
    #[cfg(not(debug_assertions))]
    {
        let handle = app.clone();

        // 1. Intentar lanzar el sidecar
        let sidecar_command = handle
            .shell()
            .sidecar("python_backend")
            .expect("No se pudo encontrar el sidecar 'python_backend'");

        let (mut rx, child) = sidecar_command
            .spawn()
            .expect("Fallo al lanzar el proceso sidecar");

        // 2. Guardar el child en el Mutex
        *sidecar_handle.lock().unwrap() = Some(child);

        // 3. Spawneamos el hilo de lectura de eventos
        tauri::async_runtime::spawn(async move {
            while let Some(event) = rx.recv().await {
                if let CommandEvent::Stdout(line_bytes) = event {
                    let line = String::from_utf8_lossy(&line_bytes);
                    let _ = handle.emit("message", format!("{}", line));
                    println!("[Sanic] {}", line);
                }
            }
        });
    }
}

pub type SidecarHandle = Arc<Mutex<Option<CommandChild>>>;

/// Limpia el proceso sidecar de forma agresiva
pub fn kill_sidecar(handle: &SidecarHandle) {
    if let Some(child) = handle.lock().unwrap().take() {
        let pid = child.pid();
        println!("Cerrando backend (PID: {})...", pid);

        #[cfg(windows)]
        {
            let _ = std::process::Command::new("taskkill")
                .args(["/F", "/T", "/PID", &pid.to_string()])
                .output();
        }

        let _ = child.kill();
    }
}

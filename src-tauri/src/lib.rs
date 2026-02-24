pub mod sidecard;
pub use sidecard::{kill_sidecar, setup_sidecar, SidecarHandle};
pub mod updater;
use std::sync::{Arc, Mutex};
use tauri::Manager;
use tauri::RunEvent;
pub use updater::update;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let sidecar_handle: SidecarHandle = Arc::new(Mutex::new(None));
    let exit_handle = sidecar_handle.clone();

    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .setup(move |app| {
            let window = app.get_webview_window("main").unwrap();
            window.center().unwrap();
            let app_handler = app.handle().clone();
            let sidecar_h = sidecar_handle.clone();
            tauri::async_runtime::spawn(async move {
                tokio::time::sleep(std::time::Duration::from_millis(200)).await;
                setup_sidecar(&app_handler, sidecar_h.clone());
                update(app_handler, &sidecar_h).await.unwrap();
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![])
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(move |_app, event| {
            if matches!(event, RunEvent::Exit | RunEvent::ExitRequested { .. }) {
                kill_sidecar(&exit_handle);
            }
        });
}

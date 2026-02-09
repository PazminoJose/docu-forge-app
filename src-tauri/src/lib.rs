mod constants;
use constants::constants::{DATA_FILE_NAME, TEMPLATE_FILE_NAME};
use doe::*;
use std::fs;
use std::path::PathBuf;
use tauri::{path::BaseDirectory, AppHandle, Manager};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn edit_docx(file: Vec<u8>) -> String {
    format!("Archivo .docx recibido con {} bytes", file.len())
}

#[tauri::command]
fn save_doc(
    app: AppHandle,
    template: Vec<u8>,
    template_extension: String,
    data_file: Vec<u8>,
) -> Result<(String, String), String> {
    // App data directory
    let base_dir: PathBuf = app
        .path()
        .resolve("docs", BaseDirectory::AppData)
        .map_err(|e| e.to_string())?;

    // Create directory if it doesn't exist
    fs::create_dir_all(&base_dir).map_err(|e| e.to_string())?;

    // Paths
    let template_path = base_dir.join(format!("{}.{}", TEMPLATE_FILE_NAME, template_extension));
    let data_file_path = base_dir.join(DATA_FILE_NAME);

    // Save files
    fs::write(&template_path, template).map_err(|e| e.to_string())?;
    fs::write(&data_file_path, data_file).map_err(|e| e.to_string())?;

    println!("Template guardado en: {}", template_path.display());
    println!("Data file guardado en: {}", data_file_path.display());

    // Return paths as strings
    Ok((
        template_path.to_string_lossy().to_string(),
        data_file_path.to_string_lossy().to_string(),
    ))
}

#[tauri::command]
fn clear_app_data(app: AppHandle) -> Result<(), String> {
    let base_dir: PathBuf = app
        .path()
        .resolve("docs", BaseDirectory::AppData)
        .map_err(|e| e.to_string())?;

    if base_dir.exists() {
        fs::remove_dir_all(&base_dir).map_err(|e| e.to_string())?;
        println!("Datos de la app eliminados en: {}", base_dir.display());
    } else {
        println!(
            "No se encontraron datos para eliminar en: {}",
            base_dir.display()
        );
    }

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();
            window.center().unwrap();
            Ok(())
        })
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            edit_docx,
            save_doc,
            clear_app_data
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

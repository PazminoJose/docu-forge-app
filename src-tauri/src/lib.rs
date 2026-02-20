pub mod api;
pub use api::py_api;
pub mod sidecard;
use docx_rs::*;
use regex::Regex;
pub use sidecard::{kill_sidecar, setup_sidecar, SidecarHandle};
use std::collections::HashSet;
use std::fs::File;
use std::io::Read;
use std::sync::{Arc, Mutex};
use tauri::Manager;
use tauri::RunEvent;
use tauri_plugin_dialog::DialogExt;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn get_file(file_path: &str) -> Vec<u8> {
    let mut file = File::open(file_path).expect("No se pudo abrir el archivo");
    let mut buf = Vec::new();
    file.read_to_end(&mut buf)
        .expect("No se pudo leer el archivo");
    buf
}

#[tauri::command]
fn get_fields(file_path: &str) -> Result<Vec<String>, String> {
    // Llamamos a una función interna y convertimos el error a String
    extract_fields(file_path.to_string()).map_err(|e| e.to_string())
}

// Esta función mantiene el Box<dyn Error> para facilitar el uso de '?'
fn extract_fields(path: String) -> Result<Vec<String>, Box<dyn std::error::Error>> {
    let mut file = File::open(path)?;
    let mut buf = Vec::new();
    file.read_to_end(&mut buf)?;

    let doc = read_docx(&buf)?;
    let re = Regex::new(r"\$\{([^}]+)\}")?;
    let mut placeholders = HashSet::new();

    // Función auxiliar para extraer texto de un párrafo
    let extract_paragraph_text = |para: &Paragraph| -> String {
        let mut full_text = String::new();
        for run in &para.children {
            if let ParagraphChild::Run(run_content) = run {
                for child in &run_content.children {
                    if let RunChild::Text(t) = child {
                        full_text.push_str(&t.text);
                    }
                }
            }
        }
        full_text
    };

    // Recorremos los hijos del documento
    for child in &doc.document.children {
        match child {
            // Caso 1: El párrafo está en la raíz del documento
            DocumentChild::Paragraph(para) => {
                let texto = extract_paragraph_text(para);
                for cap in re.captures_iter(&texto) {
                    placeholders.insert(cap[1].to_string());
                }
            }
            // Caso 2: El elemento es una TABLA
            DocumentChild::Table(table) => {
                for row in &table.rows {
                    if let TableChild::TableRow(table_row) = row {
                        for cell in &table_row.cells {
                            if let TableRowChild::TableCell(table_cell) = cell {
                                // Las celdas contienen a su vez otros elementos (como párrafos)
                                for cell_child in &table_cell.children {
                                    if let TableCellContent::Paragraph(para) = cell_child {
                                        let texto = extract_paragraph_text(para);
                                        for cap in re.captures_iter(&texto) {
                                            placeholders.insert(cap[1].to_string());
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            _ => {} // Ignorar otros tipos como secciones o saltos de página
        }
    }

    Ok(placeholders.into_iter().collect())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let sidecar_handle: SidecarHandle = Arc::new(Mutex::new(None));
    let exit_handle = sidecar_handle.clone();

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .setup(move |app| {
            let window = app.get_webview_window("main").unwrap();
            window.center().unwrap();
            let app_handler = app.handle().clone();
            let sidecar_init_handle = sidecar_handle.clone();
            tauri::async_runtime::spawn(async move {
                tokio::time::sleep(std::time::Duration::from_millis(200)).await;
                setup_sidecar(&app_handler, sidecar_init_handle);
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![py_api, get_fields, get_file])
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(move |_app, event| {
            if matches!(event, RunEvent::Exit | RunEvent::ExitRequested { .. }) {
                kill_sidecar(&exit_handle);
            }
        });
}

use docx_rs::*;
use regex::Regex;
use reqwest::Client;
use serde_json::Value;
use std::collections::HashSet;
use std::fs::File;
use std::io::Read;
use tauri::Manager;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
async fn py_api(method: String, endpoint: String, payload: Option<Value>) -> Result<Value, String> {
    let client = Client::new();
    let url = format!("http://127.0.0.1:8000/{}", endpoint);

    let request = match method.as_str() {
        "GET" => client.get(&url),
        "POST" => {
            let req = client.post(&url);
            if let Some(data) = &payload {
                req.json(data)
            } else {
                req
            }
        }
        "PUT" => client.put(&url),
        "DELETE" => client.delete(&url),
        _ => return Err(format!("Unsupported HTTP method: {}", method)),
    };

    let request = if let Some(data) = payload {
        request.json(&data)
    } else {
        request
    };

    let response = request.send().await.map_err(|e| e.to_string())?;

    let status = response.status();
    let text = response.text().await.map_err(|e| e.to_string())?;

    if !status.is_success() {
        return Err(format!("Backend error {}: {}", status, text));
    }

    let json_response = serde_json::from_str(&text).map_err(|e| e.to_string())?;

    Ok(json_response)
}

#[tauri::command]
fn edit_docx(file: Vec<u8>) -> String {
    format!("Archivo .docx recibido con {} bytes", file.len())
}

#[tauri::command]
fn get_file(file_path: &str) -> Vec<u8> {
    let mut file = File::open(file_path).expect("No se pudo abrir el archivo");
    let mut buf = Vec::new();
    file.read_to_end(&mut buf)
        .expect("No se pudo leer el archivo");
    buf
}

#[tauri::command]
async fn get_fields(file_path: &str) -> Result<Vec<String>, String> {
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
    tauri::Builder::default()
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();
            window.center().unwrap();
            Ok(())
        })
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            py_api, edit_docx, get_fields, get_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

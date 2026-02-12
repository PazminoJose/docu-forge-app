use reqwest::Client;
use serde_json::Value;

#[tauri::command]
pub async fn py_api(
    method: String,
    endpoint: String,
    payload: Option<Value>,
) -> Result<Value, String> {
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

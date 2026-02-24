use crate::sidecard::{kill_sidecar_for_update, SidecarHandle};
use tauri_plugin_dialog::{DialogExt, MessageDialogButtons};
use tauri_plugin_updater::UpdaterExt;

pub async fn update(
    app: tauri::AppHandle,
    sidecar_handle: SidecarHandle,
) -> tauri_plugin_updater::Result<()> {
    if let Some(update) = app.updater()?.check().await? {
        let dialog_buttons =
            MessageDialogButtons::OkCancelCustom("Actualizar".to_string(), "Luego".to_string());

        let confirmed = app
            .dialog()
            .message("Hay una nueva versión disponible. ¿Deseas descargarla e instalarla ahora?")
            .title("Actualización encontrada")
            .buttons(dialog_buttons)
            .blocking_show();

        if confirmed {
            let mut downloaded = 0;

            // Descargamos y obtenemos el buffer de la actualización
            let buffer = update
                .download(
                    |chunk_length, _content_length| {
                        downloaded += chunk_length;
                    },
                    || {
                        println!("Descarga finalizada");
                    },
                )
                .await?;
            kill_sidecar_for_update(&sidecar_handle).await;
            println!("Cerrando procesos secundarios...");
            update.install(buffer)?;
        }
    }
    Ok(())
}

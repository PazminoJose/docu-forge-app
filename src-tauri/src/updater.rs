use crate::sidecard::{kill_sidecar, SidecarHandle};
use tauri_plugin_updater::UpdaterExt;

pub async fn update(
    app: tauri::AppHandle,
    handle: &SidecarHandle,
) -> tauri_plugin_updater::Result<()> {
    if let Some(update) = app.updater()?.check().await? {
        let mut downloaded = 0;
        // Kill sidecar before downloading the update, otherwise the updater will fail to replace the executable on Windows
        kill_sidecar(handle);
        // alternatively we could also call update.download() and update.install() separately
        let bites = update
            .download(
                |chunk_length, content_length| {
                    downloaded += chunk_length;
                    println!("downloaded {downloaded} from {content_length:?}");
                },
                || {
                    println!("download finished");
                },
            )
            .await?;
        update.install(bites)?;
        println!("update installed");
        app.restart();
    }

    Ok(())
}

use std::io::{BufRead, BufReader};
use std::net::TcpStream;
use std::path::PathBuf;
use std::process::{Child, Command, Stdio};
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};
use std::{env, thread};
use tauri::Emitter;
use tauri::{AppHandle, RunEvent, WindowEvent};
use tauri_plugin_shell::process::CommandEvent;
use tauri_plugin_shell::ShellExt;

fn backend_filename() -> &'static str {
    if cfg!(windows) {
        "python_backend.exe"
    } else {
        "python_backend"
    }
}

pub fn spawn_sidecar() -> std::io::Result<Child> {
    let exe_dir: PathBuf = env::current_exe()?
        .parent()
        .expect("exe has no parent")
        .to_path_buf();
    let bin = exe_dir.join(backend_filename());
    println!("▶ spawning backend: {:?}", bin);

    let mut cmd = Command::new(&bin);
    cmd.stdout(Stdio::piped()).stderr(Stdio::piped());

    // On Unix, detach into its own process group so we can kill everything
    #[cfg(unix)]
    unsafe {
        cmd.pre_exec(|| {
            if libc::setsid() < 0 {
                return Err(std::io::Error::last_os_error());
            }
            Ok(())
        });
    }

    let mut child = cmd.spawn()?;

    // pipe stdout → println!
    if let Some(out) = child.stdout.take() {
        thread::spawn(move || {
            for line in BufReader::new(out).lines().flatten() {
                println!("[backend] {line}");
            }
        });
    }

    // pipe stderr → eprintln!
    if let Some(err) = child.stderr.take() {
        thread::spawn(move || {
            for line in BufReader::new(err).lines().flatten() {
                eprintln!("[backend-err] {line}");
            }
        });
    }

    Ok(child)
}

pub fn kill_on_exit(handle: Arc<Mutex<Option<Child>>>, event: &RunEvent) {
    let should_kill = matches!(
        event,
        // User clicked the “X”
        RunEvent::WindowEvent { event: WindowEvent::CloseRequested { .. }, .. }
      // Tauri is about to exit (before Exit)
      | RunEvent::ExitRequested { .. }
      // Final exit event
      | RunEvent::Exit
    );
    if should_kill {
        if let Some(mut child) = handle.lock().unwrap().take() {
            #[cfg(unix)]
            {
                let pgid = child.id() as i32;
                unsafe { libc::kill(-pgid, libc::SIGKILL) };
            }
            #[cfg(windows)]
            {
                let _ = child.kill();
            }
            let _ = child.wait();
            println!("⛔ backend terminated, port 8000 freed");
        }
    }
}

pub fn monitor_backend_ready(app_handle: &AppHandle) {
    let handle = app_handle.clone();
    thread::spawn(move || {
        let deadline = Instant::now() + Duration::from_secs(10);
        while Instant::now() < deadline {
            if TcpStream::connect(("127.0.0.1", 8000)).is_ok() {
                println!("✅ backend is ready");
                let _ = handle.emit("backend-ready", ());
                return;
            }
            thread::sleep(Duration::from_millis(100));
        }
        eprintln!("⚠️ backend did not become ready in 10s");
    });
}

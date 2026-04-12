use serde::Serialize;
use std::process::Command;

use crate::scan::find_repo_root;

#[derive(Debug, Serialize)]
pub struct RunResult {
    pub stdout: String,
    pub stderr: String,
    pub exit_code: i32,
}

#[tauri::command]
pub fn run_demo(demo_path: String) -> Result<RunResult, String> {
    // Validate the path
    if !demo_path.ends_with("demo.ts") {
        return Err("Path must end with demo.ts".to_string());
    }

    // Find repo root
    let exe = std::env::current_exe().map_err(|e| e.to_string())?;
    let repo_root = find_repo_root(&exe)
        .or_else(|| std::env::current_dir().ok().and_then(|d| find_repo_root(&d)))
        .or_else(|| {
            std::env::var("MATHCRAFT_ROOT")
                .ok()
                .map(std::path::PathBuf::from)
        })
        .ok_or_else(|| "Could not find mathcraft repo root".to_string())?;

    let absolute_path = repo_root.join(&demo_path);

    // Security: ensure the resolved path is within the repo
    let canonical = absolute_path
        .canonicalize()
        .map_err(|e| format!("Invalid demo path '{}': {}", demo_path, e))?;
    let canonical_root = repo_root
        .canonicalize()
        .map_err(|e| format!("Cannot resolve repo root: {}", e))?;
    if !canonical.starts_with(&canonical_root) {
        return Err("Demo path must be within the mathcraft repository".to_string());
    }

    // Spawn deno with only --allow-read permission
    let output = Command::new("deno")
        .arg("run")
        .arg("--allow-read")
        .arg(&canonical)
        .current_dir(&repo_root)
        .output()
        .map_err(|e| {
            if e.kind() == std::io::ErrorKind::NotFound {
                "deno not found on PATH. Please install Deno: https://deno.com".to_string()
            } else {
                format!("Failed to spawn deno: {}", e)
            }
        })?;

    Ok(RunResult {
        stdout: String::from_utf8_lossy(&output.stdout).to_string(),
        stderr: String::from_utf8_lossy(&output.stderr).to_string(),
        exit_code: output.status.code().unwrap_or(-1),
    })
}

use serde::Serialize;
use std::path::Path;
use walkdir::WalkDir;

#[derive(Debug, Clone, Serialize)]
pub struct DemoEntry {
    /// Relative path from repo root, e.g. "domains/01-number-theory/gcd/demo.ts"
    pub path: String,
    /// Concept name, e.g. "gcd"
    pub slug: String,
    /// Category within section, e.g. "01-number-theory"
    pub category: String,
    /// Top-level section, e.g. "domains"
    pub section: String,
}

/// Find the repo root by walking up from `start` until we find a directory
/// containing `deno.json`.
pub fn find_repo_root(start: &Path) -> Option<std::path::PathBuf> {
    let mut dir = if start.is_file() {
        start.parent()?.to_path_buf()
    } else {
        start.to_path_buf()
    };
    loop {
        if dir.join("deno.json").exists() {
            return Some(dir);
        }
        if !dir.pop() {
            return None;
        }
    }
}

#[tauri::command]
pub fn scan_demos() -> Result<Vec<DemoEntry>, String> {
    // Resolve repo root from the current executable's location
    let exe = std::env::current_exe().map_err(|e| e.to_string())?;
    let repo_root = find_repo_root(&exe)
        .or_else(|| {
            // Fallback: try current working directory
            std::env::current_dir().ok().and_then(|d| find_repo_root(&d))
        })
        .or_else(|| {
            // Fallback: try MATHCRAFT_ROOT env var
            std::env::var("MATHCRAFT_ROOT").ok().map(std::path::PathBuf::from)
        })
        .ok_or_else(|| "Could not find mathcraft repo root (no deno.json found)".to_string())?;

    let sections = ["domains", "frontiers", "applications"];
    let mut entries = Vec::new();

    for section in &sections {
        let section_dir = repo_root.join(section);
        if !section_dir.exists() {
            continue;
        }

        for entry in WalkDir::new(&section_dir)
            .follow_links(true)
            .into_iter()
            .filter_map(|e| e.ok())
        {
            let path = entry.path();
            if path.file_name().map(|f| f == "demo.ts").unwrap_or(false) {
                let relative = path
                    .strip_prefix(&repo_root)
                    .map_err(|e| e.to_string())?
                    .to_string_lossy()
                    .to_string();

                // The concept directory is the parent of demo.ts
                let concept_dir = path.parent().ok_or("no parent")?;
                let slug = concept_dir
                    .file_name()
                    .ok_or("no slug")?
                    .to_string_lossy()
                    .to_string();

                // Category: path components between section and slug
                let rel_from_section = concept_dir
                    .strip_prefix(&section_dir)
                    .map_err(|e| e.to_string())?;
                let category = rel_from_section
                    .parent()
                    .map(|p| p.to_string_lossy().to_string())
                    .unwrap_or_default();

                entries.push(DemoEntry {
                    path: relative,
                    slug,
                    category,
                    section: section.to_string(),
                });
            }
        }
    }

    entries.sort_by(|a, b| {
        a.section
            .cmp(&b.section)
            .then(a.category.cmp(&b.category))
            .then(a.slug.cmp(&b.slug))
    });

    Ok(entries)
}

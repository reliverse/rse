use std::env;
use std::fs;
use std::path::PathBuf;

use crate::globby::globby;
use crate::graph::Graph;
use crate::graph::{Package, PackageConfig};

pub enum PackageManager {
    Pnpm,
    Bun,
}

impl PackageManager {
    pub fn run_cmd(&self) -> Vec<&str> {
        match self {
            Self::Pnpm => vec!["pnpm", "--silent", "run"],
            Self::Bun => vec!["bun", "--silent", "run"],
        }
    }
}

pub struct Monorepo {
    pub root: PathBuf,
    pub package_manager: PackageManager,
    pub package_globs: Vec<String>,
}

impl Monorepo {
    pub fn cache_dir(&self) -> PathBuf {
        self.root.join(".cache")
    }

    pub fn to_graph(&self) -> Graph {
        let package_json_globs = self
            .package_globs
            .iter()
            .map(|glob| format!("{glob}/package.json"))
            .collect::<Vec<_>>();

        let mut packages: Vec<Package> = vec![];
        let matches = globby(&self.root, package_json_globs, vec![]);
        for package_json in matches {
            let package = read_package_json(package_json).expect("Could not read package.json");
            packages.push(package);
        }

        Graph::new(packages)
    }
}

pub fn find() -> Option<Monorepo> {
    let mut current_dir = env::current_dir().ok()?;

    loop {
        if let Some((package_manager, package_globs)) = read_workspace(&current_dir) {
            return Some(Monorepo {
                root: current_dir.to_owned(),
                package_globs,
                package_manager,
            });
        }

        if !current_dir.pop() {
            break;
        }
    }
    None
}

fn read_workspace(path: &PathBuf) -> Option<(PackageManager, Vec<String>)> {
    if path.join("pnpm-workspace.yaml").exists() {
        let content = fs::read_to_string(path.join("pnpm-workspace.yaml"))
            .expect("Failed to read pnpm-workspace.yaml");
        let yaml = serde_yaml::from_str::<serde_yaml::Value>(&content)
            .expect("pnpm-workspace.yaml is not valid YAML");
        let packages = yaml["packages"]
            .as_sequence()
            .expect("pnpm-workspace.yaml#packages must be an array");
        let globs = packages
            .iter()
            .filter_map(|v| v.as_str())
            .map(String::from)
            .collect();
        return Some((PackageManager::Pnpm, globs));
    }

    if let Ok(content) = fs::read_to_string(path.join("package.json")) {
        if let Ok(json) = serde_json::from_str::<serde_json::Value>(&content) {
            if json["workspaces"].is_null() {
                // Ignore package.json files without workspaces
                return None;
            }
            return Some((
                PackageManager::Bun,
                json["workspaces"]
                    .as_array()
                    .unwrap()
                    .iter()
                    .filter_map(|v| v.as_str())
                    .map(String::from)
                    .collect(),
            ));
        }
    }

    None
}

fn read_package_json(package_json_path: PathBuf) -> std::io::Result<Package> {
    let content = fs::read_to_string(&package_json_path)?;
    let json: serde_json::Value = serde_json::from_str(&content)?;

    let name = json["name"]
        .as_str()
        .expect("package.json must have a valid \"name\"")
        .to_string();

    let build_script = json["scripts"]["build"]
        .as_str()
        .map(|script| script.to_string());

    let mut dependency_names = Vec::new();
    if let Some(deps) = json["dependencies"].as_object() {
        dependency_names.extend(
            deps.iter()
                .filter(|(_, version)| {
                    version
                        .as_str()
                        .map_or(false, |s| s.starts_with("workspace:"))
                })
                .map(|(name, _)| name.clone()),
        );
    }
    if let Some(dev_deps) = json["devDependencies"].as_object() {
        dependency_names.extend(
            dev_deps
                .iter()
                .filter(|(_, version)| {
                    version
                        .as_str()
                        .map_or(false, |s| s.starts_with("workspace:"))
                })
                .map(|(name, _)| name.clone()),
        );
    }

    Ok(Package {
        dir: package_json_path.parent().unwrap().into(),
        name,
        build_script,
        dependency_names,
        config: PackageConfig::from(json["dlerust"].to_owned()),
    })
}

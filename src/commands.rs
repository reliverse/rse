use std::env;
use std::path::PathBuf;
use std::process::exit;

use crate::colors::{BOLD, CYAN, DIM, GREEN, MAGENTA, RED, RESET, YELLOW};
use crate::ctx::Ctx;
use crate::graph::{Graph, Package};
use crate::hash::hash_package;
use crate::monorepo;
use crate::monorepo::Monorepo;

pub fn build(ctx: &Ctx) -> Result<(), Box<dyn std::error::Error>> {
    if env::var("INSIDE_DLERUST").unwrap_or_default() == "true" {
        // When inside another dlerust command, we don't have to build the active
        // package's dependencies or check if the build is cached, we just need
        // to run the command after --. The process that triggered this build is
        // in charge of building all dependencies and checking the cache.
        if ctx.is_debug {
            println!(
                "{DIM}[dlerust] → Ignoring dlerust, running command immediately:  {:?}{RESET}",
                ctx.cmd_args
            );
        }
        exec_child_command(
            std::process::Command::new(ctx.cmd_args[0]).args(ctx.cmd_args[1..].iter()),
        );
        return Ok(());
    }

    let monorepo = require_monorepo(ctx);
    let graph = monorepo.to_graph();
    let active_package = require_active_package(ctx, &graph);

    let dependencies = graph
        .get_package_dependencies_build_order(&active_package.name)
        .unwrap();
    let packages_to_build = [dependencies, vec![active_package]].concat();

    build_cached_packages(ctx, &monorepo, packages_to_build);
    Ok(())
}

pub fn deps(ctx: &Ctx) -> Result<(), Box<dyn std::error::Error>> {
    if env::var("INSIDE_DLERUST").unwrap_or_default() == "true" {
        // When building dependencies inside another dlerust command, the parent
        // will already have build the dependencies. So in this case, we return
        // immediately since theres nothing to build.
        return Ok(());
    }

    let monorepo = require_monorepo(ctx);
    let graph = monorepo.to_graph();
    let active_package = require_active_package(ctx, &graph);
    let dependencies = graph
        .get_package_dependencies_build_order(&active_package.name)
        .unwrap();

    build_cached_packages(ctx, &monorepo, dependencies);
    Ok(())
}

pub fn all(ctx: &Ctx) -> Result<(), Box<dyn std::error::Error>> {
    let monorepo = require_monorepo(ctx);
    let graph = monorepo.to_graph();
    let dependencies = graph.get_overall_build_order();

    build_cached_packages(ctx, &monorepo, dependencies);
    Ok(())
}

pub fn graph(ctx: &Ctx) -> Result<(), Box<dyn std::error::Error>> {
    let monorepo = require_monorepo(ctx);
    let graph = monorepo.to_graph();
    graph.print()?;
    Ok(())
}

pub fn clean(ctx: &Ctx) -> Result<(), Box<dyn std::error::Error>> {
    if let Some(monorepo) = monorepo::find() {
        let cache_dir = monorepo.cache_dir();
        if ctx.is_debug {
            println!("{DIM}[dlerust] → Deleting cache at {:?}{RESET}", cache_dir);
        }

        std::fs::remove_dir_all(monorepo.cache_dir())
            .unwrap_or_else(|err| println!("Failed to remove cache: {err}"))
    } else {
        if ctx.is_debug {
            println!("{DIM}[dlerust] → Not in monorepo{RESET}");
        }
    }

    println!("{GREEN}[dlerust] ✓{RESET} Cache deleted");
    Ok(())
}

/// Find the monorepo the cwd is inside, or exit.
fn require_monorepo(ctx: &Ctx) -> Monorepo {
    let monorepo = monorepo::find();
    if monorepo.is_none() {
        println!(
            "{YELLOW}{BOLD}[dlerust] !{RESET} Monorepo root not found. Are you inside a monorepo?"
        );
        exit(1)
    }

    let monorepo = monorepo.unwrap();
    if ctx.is_debug {
        println!(
            "{DIM}[dlerust] → Monorepo found at {:?}{RESET}",
            monorepo.root
        );
    }
    monorepo
}

/// Find the package the cwd is inside, or exit.
fn require_active_package(ctx: &Ctx, graph: &Graph) -> Package {
    let active_package = graph.find_active_package();
    if active_package.is_none() {
        eprintln!(
            "{RED}{BOLD}[dlerust] !{RESET} Not inside a package directory, could not determine dependencies to build"
        );
        exit(1);
    };
    let active_package = active_package.unwrap();
    if ctx.is_debug {
        println!(
            "{DIM}[dlerust] → Active package {:?}{RESET}",
            active_package.dir
        );
    }
    active_package
}

/// Build a list of packages in the order passed in (from 0 to n), restoring each from cache if already built.
/// Exit if something goes wrong.
fn build_cached_packages(ctx: &Ctx, monorepo: &Monorepo, packages: Vec<Package>) {
    if ctx.is_debug {
        println!(
            "{DIM}[dlerust] → Packages to build: {:?}{RESET}",
            packages
                .iter()
                .map(|package| &package.name)
                .collect::<Vec<_>>()
        );
    }

    for package in packages {
        build_cached_package(ctx, monorepo, package);
    }
}

/// Build a single package or restore it from cache if already build.
/// Exit if something goes wrong.
fn build_cached_package(ctx: &Ctx, monorepo: &Monorepo, package: Package) {
    let build_script = package.build_script.clone();
    if package.build_script.is_none() {
        println!(
            "{GREEN}[dlerust] ✓{RESET} {}: Nothing to build",
            package.name
        );
        return;
    }
    let build_script = build_script.unwrap();

    let mut args = monorepo.package_manager.run_cmd();
    args.push("build");
    if ctx.is_debug {
        println!(
            "{DIM}[dlerust] → Running {args:?} in {:?}{RESET}",
            package.dir.strip_prefix(monorepo.root.clone()).unwrap()
        );
    }

    // Even though we'll actually be calling `<pm> run build`, print the build
    // script instead because it is more meaningful to the user.
    println!(
        "{MAGENTA}[dlerust] ◐{RESET} {}: {CYAN}{build_script}{RESET}",
        package.name
    );

    let cache_dir = get_package_cache_dir(ctx, monorepo, &package);
    if ctx.is_debug {
        println!("{DIM}[dlerust] → Cache dir: {:?}{RESET}", cache_dir);
    }

    if cache_dir.exists() && package.config.cache {
        restore_package_cache(ctx, &package, cache_dir);
        println!("{GREEN}[dlerust] ✓{RESET} {}: Cached!", package.name);
        return;
    }

    exec_in_dir(&package.dir, args);

    if package.config.cache {
        cache_package_output(ctx, &package, cache_dir);
    }

    println!("{GREEN}[dlerust] ✓{RESET} {}: Built", package.name);
}

/// Return the path to a package's cache based on it's current hash.
fn get_package_cache_dir(ctx: &Ctx, monorepo: &Monorepo, package: &Package) -> PathBuf {
    let (package_hash, file_hashes) = hash_package(package).unwrap_or_else(|e| {
        println!(
            "{RED}{BOLD}[dlerust] ✘{RESET} Error computing package hash: {}",
            e
        );
        exit(1)
    });
    if ctx.is_debug {
        println!("{DIM}[dlerust] → File hashes:\n{file_hashes}{RESET}");
        println!("{DIM}[dlerust] → Package hash: {package_hash}{RESET}");
    }

    monorepo
        .cache_dir()
        .join(package.name.clone())
        .join(package_hash)
}

/// Copy the cache output to the package's output directory.
fn restore_package_cache(ctx: &Ctx, package: &Package, cache_dir: PathBuf) {
    let out_dir = package.absolute_out_dir();
    if ctx.is_debug {
        println!("{DIM}[dlerust] → Restoring {cache_dir:?} to {out_dir:?}");
    }
    std::fs::create_dir_all(&out_dir).unwrap();
    let mut copy_options = fs_extra::dir::CopyOptions::default();
    copy_options.overwrite = true;
    copy_options.content_only = true;
    fs_extra::dir::copy(&cache_dir, &out_dir, &copy_options).unwrap_or_else(|e| {
        println!("{RED}{BOLD}[dlerust] ✘{RESET} Error restoring cache: {}", e);
        exit(1);
    });
}

/// Copy the package's output directory to the cache directory.
fn cache_package_output(ctx: &Ctx, package: &Package, cache_dir: PathBuf) {
    let out_dir = package.absolute_out_dir();
    if ctx.is_debug {
        println!("{DIM}[dlerust] → Caching {out_dir:?} to {cache_dir:?}");
    }

    if !out_dir.exists() {
        println!(
            "{RED}{BOLD}[dlerust] ✘{RESET} Output directory {:?} doesn't exist, cannot cache",
            out_dir
        );
        exit(1);
    }

    std::fs::create_dir_all(&cache_dir).unwrap();
    let mut copy_options = fs_extra::dir::CopyOptions::default();
    copy_options.overwrite = true;
    copy_options.content_only = true;
    fs_extra::dir::copy(&out_dir, &cache_dir, &copy_options).unwrap_or_else(|e| {
        println!("{RED}{BOLD}[dlerust] ✘{RESET} Error caching output: {}", e);
        exit(1);
    });
}

/// Execute a command inside a directory. Continue on success, exit if the command failed.
fn exec_in_dir(dir: &PathBuf, args: Vec<&str>) {
    exec_child_command(
        std::process::Command::new(args[0])
            .args(args[1..].iter())
            .current_dir(&dir),
    );
}

/// Execute a command as a child process. Continue on success, exit if the command failed.
fn exec_child_command(cmd: &mut std::process::Command) {
    let mut child = cmd.env("INSIDE_DLERUST", "true").spawn().unwrap();
    match child.wait() {
        Ok(res) => match res.code() {
            Some(0) => {
                // Noop, contin
            }
            Some(code) => exit(code),
            None => exit(1),
        },
        Err(_) => exit(1),
    }
}

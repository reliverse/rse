use std::env;
use std::process;
use std::process::exit;

use colors::{BLUE, BOLD, CYAN, DIM, GREEN, RESET, YELLOW};
use ctx::Ctx;

mod colors;
mod commands;
mod ctx;
mod globby;
mod graph;
mod hash;
mod monorepo;

const VERSION: &str = "0.1.0";

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let is_debug = is_debug();
    let args: Vec<String> = env::args().collect();
    let separator = args.iter().position(|arg| arg == "--");

    let (dlerust_args_slice, cmd_args_slice): (&[String], &[String]) = match separator {
        Some(index) => (&args[1..index], &args[index + 1..]),
        None => (&args[1..], &[]),
    };
    let dlerust_args: Vec<&str> = dlerust_args_slice.iter().map(|str| str.as_str()).collect();
    let cmd_args: Vec<&str> = cmd_args_slice.iter().map(|str| str.as_str()).collect();
    if is_debug {
        println!("{DIM}[dlerust] → Dlerust args:  {dlerust_args:?}{RESET}");
        println!("{DIM}[dlerust] → Command args: {cmd_args:?}{RESET}");
    }

    if array_includes_either(&dlerust_args, "-v", "--version") {
        return print_version();
    }
    if array_includes_either(&dlerust_args, "-h", "--help") {
        return print_help();
    }

    let ctx = Ctx {
        is_debug,
        cmd_args: cmd_args.clone(),
    };

    match (dlerust_args.len(), cmd_args.len()) {
        (0, 0) => print_help(),
        (0, _) => commands::build(&ctx),
        _ => match dlerust_args[0] {
            "deps" => commands::deps(&ctx),
            "all" => commands::all(&ctx),
            "graph" => commands::graph(&ctx),
            "clean" | "clear" => commands::clean(&ctx),
            _ => print_unknown_command(),
        },
    }
    .map_err(|err| {
        eprintln!("Unhandled error: {}", err);
        process::exit(1);
    })
}

#[rustfmt::skip]
fn print_help() -> Result<(), Box<dyn std::error::Error>> {
    println!("{BOLD}{BLUE}Dlerust{RESET} orchestrates and caches builds for JS monorepos. {DIM}({}){RESET}", VERSION);
    println!();
    println!("{BOLD}Usage: dlerust <command> {DIM}[-- ...args]{RESET}");
    println!();
    println!("{BOLD}Commands:{RESET}");
    println!("  {BOLD}{BLUE  }     {RESET}    {DIM}-- unbuild{RESET}       Build dependencies and run the command, caching the result");
    println!("  {BOLD}{BLUE  }deps {RESET}    {DIM}&& vitest {RESET}       Ensure dependencies are build before running the command");
    println!("  {BOLD}{BLUE  }all  {RESET}    {DIM}          {RESET}       Build all packages in the monorepo, caching the results");
    println!();
    println!("  {BOLD}{GREEN }graph{RESET}    {DIM}          {RESET}       Print the dependency graph");
    println!();
    println!("  {BOLD}{YELLOW}clean{RESET}    {DIM}          {RESET}       Delete build cache {DIM}(dlerust clear){RESET}");
    println!();
    println!("{BOLD}Examples:{RESET}");
    println!();
    println!("  dlerust -- unbuild              {DIM}Run unbuild after building dependencies{RESET}");
    println!("  dlerust -- tsup --minify        {DIM}Run TSup with CLI flags{RESET}");
    println!("  dlerust deps && jest            {DIM}Run tests after after dependencies are built{RESET}");
    println!("  dlerust deps && tsc --noEmit    {DIM}Run type checks after dependencies are built{RESET}");
    println!();
    println!("Learn more about Dlerust:    {CYAN}https://github.com/reliverse/dlerust{RESET}");
    Ok(())
}

fn print_version() -> Result<(), Box<dyn std::error::Error>> {
    println!("{}", VERSION);
    Ok(())
}

fn print_unknown_command() -> ! {
    println!("Unknown command. Run {CYAN}dlerust --help{RESET} for more details.");
    exit(1)
}

fn array_includes_either(arr: &Vec<&str>, a: &str, b: &str) -> bool {
    arr.iter().any(|item| *item == a || *item == b)
}

fn is_debug() -> bool {
    std::env::var("DEBUG")
        .map(|v| v == "dlerust")
        .unwrap_or(false)
}

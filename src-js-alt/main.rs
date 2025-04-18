use clap::Parser;
use std::{fs, path::PathBuf};

/// ReliScript command-line interface.
#[derive(Parser)]
#[command(author, version, about = "ReliScript - drop-in JS replacement", long_about = None)]
struct Cli {
    /// Path to the input `.rse` file
    input: PathBuf,

    /// Output path (defaults to the same stem with `.js` extension)
    #[arg(short, long)]
    output: Option<PathBuf>,
}

fn main() -> anyhow::Result<()> {
    let cli = Cli::parse();

    // Read input source
    let src = std::fs::read_to_string(&cli.input)?;

    // Transpile (no‑op for now)
    let js = reliscript::transpile(&src)?;

    // Determine output file name
    let out_path = cli.output.unwrap_or_else(|| {
        let mut p = cli.input.clone();
        p.set_extension("js");
        p
    });

    std::fs::write(&out_path, js)?;
    println!("✅ Wrote {}", out_path.display());
    Ok(())
}
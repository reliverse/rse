/// "transpiler" that currently does nothing 
/// apart from returning the source unchanged. 
/// TODO: Replace with a real parser & generator.
pub fn transpile(src: &str) -> anyhow::Result<String> {
    // TODO: integrate a proper grammar (e.g., [pest] or [tree-sitter])
    Ok(src.to_owned())
}
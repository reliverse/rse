use std::path::PathBuf;

use glob::glob_with;
use glob::Pattern;

pub fn globby(
    dir: &PathBuf,
    include_globs: Vec<String>,
    exclude_globs: Vec<String>,
) -> Vec<PathBuf> {
    let mut matches = Vec::new();

    let exclude_patterns = exclude_globs
        .iter()
        .map(|glob| Pattern::new(glob).unwrap())
        .collect::<Vec<_>>();

    for include_glob in include_globs {
        let options = glob::MatchOptions {
            case_sensitive: false,
            require_literal_separator: false,
            require_literal_leading_dot: false,
        };

        for entry in glob_with(&dir.join(&include_glob).to_string_lossy(), options).unwrap() {
            if let Ok(path) = entry {
                if !exclude_patterns
                    .iter()
                    .any(|exclude_pattern| exclude_pattern.matches_path(&path))
                {
                    matches.push(path);
                }
            }
        }
    }

    matches
}

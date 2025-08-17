pub struct PackageMetadata {
    pub name: String,
    pub options: BuildcOptions,
    pub dir: String,
    pub dependencies: Vec<String>,
}

pub struct BuildcOptions {
    pub cacheable: bool,
    pub out_dir: String,
    pub include: Vec<String>,
    pub exclude: Vec<String>,
}

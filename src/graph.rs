use std::collections::HashSet;
use std::env;
use std::io::Write;
use std::path::PathBuf;
use std::rc::Rc;
use std::{cell::RefCell, collections::HashMap};

use crate::colors::{BOLD, CYAN, DIM, RESET};

#[derive(Debug, Clone)]
pub struct Package {
    pub dir: PathBuf,
    pub name: String,
    pub build_script: Option<String>,
    pub dependency_names: Vec<String>,
    pub config: PackageConfig,
}

impl Package {
    pub fn absolute_out_dir(self: &Self) -> PathBuf {
        self.dir.join(self.config.out_dir.clone())
    }
}

const DEFAULT_CACHED: bool = true;
const DEFAULT_OUT_DIR: &str = "dist";
const DEFAULT_INCLUDE: &[&str] = &["src/**/*"];
const DEFAULT_EXCLUDE: &[&str] = &[
    "**/__tests__/**",
    "**/__mocks__/**",
    "**/*.test.*",
    "**/e2e/**",
    "**/dist/**",
    "**/.output/**",
];

#[derive(Debug, Clone)]
pub struct PackageConfig {
    /// Whether the build output should be cached.
    pub cache: bool,
    /// The directory where your build is output to, relative to package folder.
    pub out_dir: String,
    /// List of glob patterns to include when checking if the package needs rebuilt.
    pub include: Vec<String>,
    /// List of glob patterns to ignore when checking if the package needs rebuilt.
    pub exclude: Vec<String>,
}

impl PackageConfig {
    fn default() -> PackageConfig {
        PackageConfig {
            cache: DEFAULT_CACHED,
            out_dir: DEFAULT_OUT_DIR.to_string(),
            include: DEFAULT_INCLUDE.iter().map(|&s| s.to_string()).collect(),
            exclude: DEFAULT_EXCLUDE.iter().map(|&s| s.to_string()).collect(),
        }
    }
}

impl From<serde_json::Value> for PackageConfig {
    fn from(value: serde_json::Value) -> Self {
        PackageConfig {
            cache: value
                .get("cache")
                .and_then(|v| v.as_bool())
                .unwrap_or(DEFAULT_CACHED),
            out_dir: value
                .get("outDir")
                .and_then(|v| v.as_str())
                .map(String::from)
                .unwrap_or(DEFAULT_OUT_DIR.to_string()),
            include: value
                .get("include")
                .and_then(|v| v.as_array())
                .map(|arr| {
                    arr.iter()
                        .filter_map(|v| v.as_str().map(String::from))
                        .collect()
                })
                .unwrap_or_else(|| DEFAULT_INCLUDE.iter().map(|&s| s.to_string()).collect()),
            exclude: value
                .get("exclude")
                .and_then(|v| v.as_array())
                .map(|arr| {
                    arr.iter()
                        .filter_map(|v| v.as_str().map(String::from))
                        .collect()
                })
                .unwrap_or_else(|| DEFAULT_EXCLUDE.iter().map(|&s| s.to_string()).collect()),
        }
    }
}

#[derive(Debug, Clone)]
pub struct Node {
    id: String,
    package: Package,
    children: Vec<Rc<RefCell<Node>>>,
}

impl Node {
    pub fn new(package: Package) -> Rc<RefCell<Self>> {
        Rc::new(RefCell::new(Node {
            id: package.name.clone(),
            package,
            children: Vec::new(),
        }))
    }

    pub fn add_child(&mut self, child: Rc<RefCell<Node>>) {
        self.children.push(child);
    }

    pub fn get_dependency_build_order(&self) -> Vec<Rc<RefCell<Node>>> {
        let mut existence_set = HashSet::new();
        let mut results = Vec::new();

        for child in &self.children {
            Self::depth_first_search(child, &mut existence_set, &mut results);
        }

        results
    }

    fn depth_first_search(
        node: &Rc<RefCell<Node>>,
        existence: &mut HashSet<String>,
        result: &mut Vec<Rc<RefCell<Node>>>,
    ) {
        let id = node.borrow().id.clone();
        if existence.contains(&id) {
            return;
        }
        existence.insert(id);

        for child in &node.borrow().children {
            Self::depth_first_search(child, existence, result);
        }
        result.push(Rc::clone(node));
    }

    pub fn print<W: Write>(
        &self,
        writer: &mut W,
        depth: usize,
        is_last: bool,
    ) -> std::io::Result<()> {
        write!(
            writer,
            "{DIM}{}{}{RESET} {CYAN}{BOLD}{}{RESET}\n",
            "│ ".repeat(depth),
            if is_last { "└" } else { "├" },
            self.id,
        )?;

        if self.children.len() > 0 {
            let last_index = self.children.len() - 1;
            for (index, child) in self.children.iter().enumerate() {
                child
                    .borrow()
                    .print(writer, depth + 1, index == last_index)?;
            }
        }
        Ok(())
    }
}

pub struct Graph {
    pub root: Rc<RefCell<Node>>,
    node_map: HashMap<String, Rc<RefCell<Node>>>,
}

impl Graph {
    pub fn new(packages: Vec<Package>) -> Self {
        let root = Node::new(Package {
            dir: PathBuf::new(),
            name: "root".to_string(),
            dependency_names: vec![],
            build_script: None,
            config: PackageConfig::default(),
        });

        let nodes = packages
            .clone()
            .iter()
            .map(|pkg| Node::new(pkg.clone()))
            .collect::<Vec<_>>();

        // Add all dependencies to root

        for node in nodes.clone() {
            root.borrow_mut().add_child(node);
        }

        // Add dependency relationships

        let node_map = nodes
            .clone()
            .iter()
            .map(|node| (node.borrow().id.clone(), node.clone()))
            .collect::<HashMap<_, _>>();

        for package in packages {
            let package_node = node_map.get(&package.name);
            if package_node.is_none() {
                continue;
            }

            let package_node = package_node.unwrap();
            for dependency_name in package.dependency_names {
                let dependency_node = node_map.get(&dependency_name);
                if dependency_node.is_none() {
                    continue;
                }

                let dependency_node = dependency_node.unwrap();
                package_node.borrow_mut().add_child(dependency_node.clone());
            }
        }

        Graph { root, node_map }
    }

    /// Return all packages in the graph in build order.
    pub fn get_overall_build_order(&self) -> Vec<Package> {
        self.root
            .borrow()
            .get_dependency_build_order()
            .iter()
            .map(|node| node.borrow().package.clone())
            .collect()
    }

    /// Return a package's dependencies in build order.
    pub fn get_package_dependencies_build_order(&self, package_name: &str) -> Option<Vec<Package>> {
        match self.node_map.get(package_name) {
            None => None,
            Some(node) => Some(
                node.borrow()
                    .get_dependency_build_order()
                    .iter()
                    .map(|node| node.borrow().package.clone())
                    .collect(),
            ),
        }
    }

    /// Based off your CWD, return the package that you are inside.
    pub fn find_active_package(&self) -> Option<Package> {
        let current_dir = env::current_dir().ok()?;

        for node in &self.root.borrow().children {
            let package_dir = &node.borrow().package.dir;
            if current_dir.starts_with(package_dir) {
                return Some(node.borrow().package.clone());
            }
        }

        None
    }

    pub fn print(&self) -> std::io::Result<()> {
        println!("Dependency Graph:");
        let mut stdout = std::io::stdout().lock();
        let last_index = self.root.borrow().children.len() - 1;
        for (index, package_node) in self.root.borrow().children.clone().iter().enumerate() {
            package_node
                .borrow()
                .print(&mut stdout, 0, index == last_index)?;
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use std::path::PathBuf;

    use crate::graph::{Graph, Package};

    use super::PackageConfig;

    fn test_package(name: &str, dependency_names: Vec<&str>) -> Package {
        Package {
            dir: PathBuf::new(),
            name: name.to_string(),
            dependency_names: dependency_names.iter().map(|str| str.to_string()).collect(),
            build_script: None,
            config: PackageConfig::default(),
        }
    }

    #[test]
    fn test_dependency_graph() {
        let a = test_package("a", vec!["b", "c"]);
        let b = test_package("b", vec!["c"]);
        let c = test_package("c", vec![]);
        let packages = vec![a.clone(), b.clone(), c.clone()];
        let graph = Graph::new(packages);

        let overall_order = graph.get_overall_build_order();
        assert_eq!(
            overall_order
                .iter()
                .map(|p| p.name.clone())
                .collect::<Vec<_>>(),
            vec!["c", "b", "a"]
        );

        let a_order = graph.get_package_dependencies_build_order("a").unwrap();
        assert_eq!(
            a_order.iter().map(|p| p.name.clone()).collect::<Vec<_>>(),
            vec!["c", "b"]
        );

        let b_order = graph.get_package_dependencies_build_order("b").unwrap();
        assert_eq!(
            b_order.iter().map(|p| p.name.clone()).collect::<Vec<_>>(),
            vec!["c"]
        );

        let c_order = graph.get_package_dependencies_build_order("c").unwrap();
        assert_eq!(
            c_order.iter().map(|p| p.name.clone()).collect::<Vec<_>>(),
            Vec::<String>::new()
        );
    }
}

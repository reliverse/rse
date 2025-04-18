#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn passthrough() {
        let source = "console.log('ReliScript');";
        let js = reliscript::transpile(source).unwrap();
        assert_eq!(js, source);
    }
}

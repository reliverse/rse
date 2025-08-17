pub struct Ctx<'a> {
    pub is_debug: bool,
    pub cmd_args: Vec<&'a str>,
}

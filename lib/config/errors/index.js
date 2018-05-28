exports.configNotFound = path => {
  return `
    A config file at the specified path was not found. Ensure that a now-compose.yaml
    file exists in the current running directory. Or that the full path provided
    for now-compose.yaml is correct.

    Error: Config file not found.
    Path: ${path}
    URL: <insert url to docs here>
  `
}

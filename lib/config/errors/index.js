exports.configNotFound = path => {
  return `
    A config file at the specified path was not found. Ensure that a now-compose.yml
    file exists in the current running directory. Or that the full path provided
    for the now-compose configuration is correct.

    Error: Config file not found.
    Path: ${path}
    Solution: Specify a file with "now-compose <command> -f <filename>"
    URL: <insert url to docs here>
  `
}

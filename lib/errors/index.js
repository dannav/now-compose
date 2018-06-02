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

exports.invalidComposeYML = () => {
  return `
    No services defined in now-compose.yml.

    Error: No services defined in config.
    Solution: Reference config file reference.
    URL: <insert url to now-compose.yml reference>
  `
}

exports.general = err => {
  return `
    Error
    ${err}

    URL: <insert url to generic error document possible issues and where to find>
  `
}

exports.configDirNoPerm = path => {
  return `
    Cannot create directory ${path}.
    Please ensure that you have proper write permissions for the parent directory.

    Error: Invalid permissions to create directory.
    URL: <insert url to docs here>
  `
}

exports.cannotWriteFile = path => {
  return `
    Cannot write file ${path}

    Error: Error writing file.
    URL: <insert url to docs here>
  `
}

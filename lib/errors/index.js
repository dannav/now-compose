exports.configNotFound = path => {
  return `
    A config file at the specified path was not found. Ensure that a now-compose.yml
    file exists in the current running directory. Or that the full path provided
    for the now-compose configuration is correct.

    Error: Config file not found.
    Path: ${path}
    Solution: Specify a file to use with "now-compose -f <filename> <command>"
  `
}

exports.invalidComposeYML = () => {
  return `
    Error: No services defined in now-compose.yml.
  `
}

exports.general = err => {
  return `
    Error: ${err}
  `
}

exports.configDirNoPerm = path => {
  return `
    Cannot create directory ${path}.
    Please ensure that you have proper write permissions for the parent directory.

    Error: Invalid permissions to create directory.
  `
}

exports.cannotWriteFile = path => {
  return `
    Cannot write file ${path}

    Error: Error writing file.
  `
}

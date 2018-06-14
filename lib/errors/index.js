exports.dockerComposeNotInstalled = () => {
  return `
  Error: docker-compose must be installed to use this program.
  Visit https://docs.docker.com/compose/install/ for installation instructions.
  `
}

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

exports.composeSupportOnePort = serviceName => {
  return `
Warning: Only one exposed port is currently supported. Found
multiple for service ${serviceName}.

Skipping all but the first defined port for this service.
  `
}

exports.composeNoPortExposed = serviceName => {
  return `
Error: No ports exposed for service ${serviceName}.
  `
}

exports.composeNoHostPort = serviceName => {
  return `
Error: Port for service ${serviceName} is not exposed to the host
machine. Networking is not possible.

Solution: Ports should be bound with the host port and the port exposed
in the container. i.e. "8080:3000".
  `
}

exports.composePortLongSyntaxNotSupported = serviceName => {
  return `
Error: Only docker-compose ports short syntax is supported.
Unsupported syntax found for service ${serviceName}.
  `
}

exports.composeDockerContainerNotDefined = serviceName => {
  return `
Warning: Skipping ${serviceName}, build or image property not found for service.
A docker container must be defined.
  `
}

exports.composeNoBuildTag = serviceName => {
  return `
Warning: No build tag defined for service ${serviceName}. A Dockerfile is
required to deploy this service. If this service is for local use only then this
message can be diregarded.
  `
}

exports.composeTypeNotSupported = (prop, serviceName, supportedTypes) => {
  return `
Error: type of property '${prop}' for service '${serviceName}' not supported.
Supported types are ${supportedTypes.join(',')}.
  `
}

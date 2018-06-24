const chalk = require('chalk')

const warning = message => chalk`{yellow WARNING:} ${message}`
const info = message => chalk`{magenta INFO:} ${message}`
const error = message => chalk`{red ERROR:} ${message}`

exports.info = info
exports.warning = warning

exports.dockerComposeNotInstalled = () => {
  return warning(`docker-compose must be installed to use this program.
Visit https://docs.docker.com/compose/install/ for installation instructions.
  `)
}

exports.configNotFound = path => {
  return error(`Config file not found.
Path: ${path}
Solution: Specify a file to use with "now-compose -f <filename> <command>"
  `)
}

exports.invalidComposeYML = () => {
  return error(`No services defined in now-compose.yml.`)
}

exports.general = err => {
  return error(`${err}`)
}

exports.configDirNoPerm = path => {
  return error(`Cannot create directory ${path}.
Please ensure that you have proper write permissions for the parent directory.`)
}

exports.cannotWriteFile = path => {
  return error(`Cannot write file ${path}`)
}

exports.composeSupportOnePort = serviceName => {
  return warning(`Only one exposed port is currently supported. Found
multiple for service ${serviceName}.

Skipping all but the first defined port for this service.
  `)
}

exports.composeNoPortExposed = serviceName => {
  return error(`No ports exposed for service ${serviceName}.`)
}

exports.composeNoHostPort = serviceName => {
  return error(`Port for service ${serviceName} is not exposed to the host
machine. Networking is not possible.

Solution: Ports should be bound with the host port and the port exposed
in the container. i.e. "8080:3000".
  `)
}

exports.composePortLongSyntaxNotSupported = serviceName => {
  return error(`Only docker-compose ports short syntax is supported.
Unsupported syntax found for service ${serviceName}.
  `)
}

exports.composeDockerContainerNotDefined = serviceName => {
  return warning(`Skipping ${serviceName}, build or image property not found for service.
A docker container must be defined.
  `)
}

exports.composeNoBuildTag = serviceName => {
  return warning(`No build tag defined for service ${serviceName}. A Dockerfile is
required to deploy this service. If this service is for local use only then this
message can be diregarded.
  `)
}

exports.composeTypeNotSupported = (prop, serviceName, supportedTypes) => {
  return error(`Type of property '${prop}' for service '${serviceName}' not supported.
Supported types are ${supportedTypes.join(',')}.
  `)
}

exports.deployAPIKeyNotSet = () => {
  return error(`API key not set.

Please provide the zeit API token for the account you want to use for
deployments. It can be set using the '--apiKey' flag or by setting a
'NOW_API_KEY' environment variable before running this command.

You can create an API token for now-compose at: https://zeit.co/account/tokens
  `)
}

exports.apiForbidden = () => {
  return error(`Upload request returned 403 Forbidden.
Is your api key correct?
  `)
}

exports.apiUploadingFile = () => {
  return error(`Uploading file ${file.path}.
Message: Status ${r.statusCode} - ${r.statusMessage}
  `)
}

exports.apiOperationTimeout = () => {
  return error(`Operation timeout

You tried to upload a file that was too big. You might be able to
create it during build on zeit now.
  `)
}

exports.deployDependsOnType = s => {
  return error(
    `depends_on property for service ${s} should be an Array or String.`
  )
}

exports.deployNoBuildProperty = s => {
  return warning(`Service ${s} will not be deployed because it contains no build
property in its service config.
  `)
}

exports.deployLinkNotFound = (s, l) => {
  return warning(`Found link "${l}" for service "${s}". "${l}" is not a service
configured for deployment.
  `)
}

exports.uploadErrorUploadingFile = (file, serviceName, err) => {
  return error(`There was an issue parsing file ${file.path} while
uploading service ${serviceName}

${err}
  `)
}

exports.uploadErrorUploadingService = (serviceName, err) => {
  return error(`There was an issue encountered uploading service ${serviceName}

${err}
  `)
}

exports.exit = message => {
  console.log(message)
  process.exit(1)
}

exports.warn = message => {
  console.log(message)
}

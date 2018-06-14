const path = require('path')
const excludeServiceKeys = ['deploy', 'command']
const errors = require('../errors')

/*
  README

  This file creates a docker-compose compatible config object. The following
  commands are excluded because now-compose will be managing them:

  - "deploy" now-compose will handle deployment to now. No other deployment stories
    will be supported.

  - "command" docker containers should be self containing. To ensure that your
    container will function the same locally during development and on now, any
    commands executed by the docker container should be contained there.

  ...

  In the future it is planned that now-compose would also handle managing an
  instance of microproxy for node and static deployments. Which is why here we
  only manage services with build or image properties defined.

  TODO:
  - Refactor this to throw errors instead of exiting if validation fails
    so that we can unit test all failure cases

  - Caller should handle exceptions and exit process
*/

const excludeKeys = (o, exclude) => {
  return Object.keys(o).reduce((accumulator, key) => {
    if (exclude.indexOf(key) > -1) {
      return accumulator
    }

    accumulator[key] = o[key]

    return accumulator
  }, {})
}

// linkServices adds hostname:hostport to an env var for each container a docker
// compose service is linked to. Each env var is labeled by "NOW_HOST_SERVICENAME"
const linkServices = (service, linkedServices, servicePorts) => {
  const c = { ...service.config }

  if (linkedServices[service.name]) {
    linkedServices[service.name].forEach(link => {
      const hostEnvKey = `NOW_HOST_${link.toUpperCase()}`
      const hostEnvValue = `host.docker.internal`

      // host env var
      if (c.environment) {
        c.environment[hostEnvKey] = hostEnvValue
      } else {
        c.environment = {}
        c.environment[hostEnvKey] = hostEnvValue
      }

      if (servicePorts[link]) {
        const ports = servicePorts[link].split(':')
        const hostPort = ports[0]

        // note port is for local dev only since now only supports ssl (443)
        const portEnvKey = `NOW_PORT_${link.toUpperCase()}`
        const portEnvValue = `${hostPort}`

        // set port env var
        c.environment[portEnvKey] = portEnvValue
      }
    })
  }

  return c
}

const toDockerCompose = config => {
  const configVersion = parseInt(config.version, 10)
  if (configVersion < 3) {
    throw new Error('now-compose.yml must be at least version 3')
  }

  const services = []
  const linkedServices = {}
  const servicePorts = {}

  for (const serviceName in config.services) {
    if (!config.services.hasOwnProperty(serviceName)) {
      continue
    }

    let foundContainerTag = false
    const definition = config.services[serviceName]

    // warn that we can't deploy service if there is no dockerfile to build
    if (Object.keys(definition).indexOf('build') === -1) {
      console.log(errors.composeNoBuildTag(serviceName))
    }

    for (const configOption in definition) {
      if (!definition.hasOwnProperty(configOption)) {
        continue
      }

      // a build or image property is required for the service
      // do config validation
      if (configOption === 'build' || configOption === 'image') {
        foundContainerTag = true
        let serviceConfig = excludeKeys(definition, excludeServiceKeys)

        /*
          TODO - temporary.. do this better

          Since we generate docker-compose.yml to a `.now` dir in a projects root
          we need to resolve any `build` and `env` file properties in docker-compose.yml
          to be one directory up (located where now-compose.yml is)
        */
        if (serviceConfig.build) {
          serviceConfig.build = path.join('../', serviceConfig.build)
        }

        // env_file validation and path fix
        if (serviceConfig['env_file']) {
          if (Array.isArray(serviceConfig['env_file'])) {
            // loop through env_files and adjust path
            serviceConfig['env_file'] = serviceConfig['env_file'].map(file => {
              return path.join('../', file)
            })
          } else {
            if (typeof serviceConfig['env_file'] === 'string') {
              serviceConfig['env_file'] = path.join(
                '../',
                serviceConfig['env_file']
              )
            } else {
              console.log(
                errors.composeTypeNotSupported('env_file', serviceName, [
                  'array',
                  'string'
                ])
              )

              process.exit(1)
            }
          }
        }

        // TODO - support port long syntax
        // port validation
        if (Array.isArray(serviceConfig.ports)) {
          if (serviceConfig.ports.length > 1) {
            console.log(errors.composeSupportOnePort(serviceName))
          }

          if (!serviceConfig.ports.length) {
            console.log(errors.composeNoPortExposed(serviceName))
            process.exit(1)
          } else {
            const ports = serviceConfig.ports.slice(0, 1)
            if (ports[0].indexOf(':') === -1) {
              console.log(errors.composeNoHostPort(serviceName))
              process.exit(1)
            }

            servicePorts[serviceName] = ports[0]
          }
        } else {
          console.log(errors.composePortLongSyntaxNotSupported(serviceName))
          process.exit(1)
        }

        // store links so we can link all services after parsing
        linkedServices[serviceName] = serviceConfig.links || []

        // service config is good
        services.push({ name: serviceName, config: serviceConfig })
        break
      }
    }

    if (!foundContainerTag) {
      console.log(errors.composeDockerContainerNotDefined(serviceName))
    }
  }

  // delete from linkedServices those services which we skipped (no build or image props)
  // they aren't in docker-compose.yml so they shouldn't be added to env vars
  const validServiceNames = services.map(s => s.name)
  for (let i = 0; i < Object.keys(linkedServices).length; i++) {
    const service = Object.keys(linkedServices)[i]

    const validLinked = Object.values(linkedServices[service]).filter(l => {
      return validServiceNames.indexOf(l) > -1
    })

    linkedServices[service] = validLinked
  }

  // convert services arr to obj and link them (networking)
  const dockerServices = services.reduce((o, service) => {
    o[service.name] = linkServices(service, linkedServices, servicePorts)
    return o
  }, {})

  return {
    ...config,
    ...{ services: dockerServices }
  }
}

module.exports = toDockerCompose

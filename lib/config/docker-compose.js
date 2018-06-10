const path = require('path')
const excludeServiceKeys = ['deploy', 'command']

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

const toDockerCompose = config => {
  const services = []
  const linkedServices = {}
  const servicePorts = {}

  for (const serviceName in config.services) {
    if (!config.services.hasOwnProperty(serviceName)) {
      continue
    }

    let foundContainerTag = false
    const definition = config.services[serviceName]

    for (const configOption in definition) {
      if (!definition.hasOwnProperty(configOption)) {
        continue
      }

      if (configOption === 'build' || configOption === 'image') {
        let serviceConfig = excludeKeys(definition, excludeServiceKeys)

        /*
          TODO - temporary.. do this better

          Since we generate docker-compose.yml to a `.now` dir in a projects root
          we need to resolve any `build` properties in docker-compose.yml to be
          one directory up (located where now-compose.yml is)
        */
        if (serviceConfig.build) {
          serviceConfig.build = path.join('../', serviceConfig.build)
        }

        linkedServices[serviceName] = serviceConfig.links

        // TODO - support port long syntax
        if (Array.isArray(serviceConfig.ports)) {
          if (serviceConfig.ports.length > 0) {
            console.log(`
              Warning: Only one exposed port is currently supported. Found
              multiple for service ${serviceName}.

              Skipping all but the first defined port for this service.
            `)
          }

          if (!serviceConfig.ports.length) {
            console.log(`
              Error: No ports exposed for service ${serviceName}.
            `)

            process.exit(1)
          } else {
            const ports = serviceConfig.ports.slice(0, 1)
            if (ports[0].indexOf(':') === -1) {
              console.log(`
                Error: Port for service ${serviceName} is not exposed to the host
                machine. Networking is not possible.

                Solution: Ports should be bound with the host port and the port exposed
                in the container. i.e. "8080:3000".
              `)

              process.exit(1)
            }

            servicePorts[serviceName] = ports
          }
        } else {
          console.log(`
            Error: Only docker-compose ports short syntax is supported.
            Unsupported syntax found for service ${serviceName}.
          `)

          process.exit(1)
        }

        services.push({ name: serviceName, config: serviceConfig })
        break
      }
    }

    if (!foundContainerTag) {
      console.log(`
        Skipping ${serviceName}, build or image property not found for service.
        A docker container must be defined.
      `)
    }
  }

  /*
      TODO - set NOW_HOST_{SERVICENAME} environment variables for linked services
  */

  const dockerServices = services.reduce((o, service) => {
    o[service.name] = service.config
    return o
  }, {})

  return {
    ...config,
    ...{ services: dockerServices }
  }
}

module.exports = toDockerCompose

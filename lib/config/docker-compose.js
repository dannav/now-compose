const path = require('path')
const excludeServiceKeys = ['deploy']

const excludeKeys = (o, exclude) => {
  return Object.keys(o).reduce((accumulator, key) => {
    if (exclude.indexOf(key) > -1) {
      return accumulator
    }

    accumulator[key] = o[key]

    return accumulator
  }, {})
}

// create a docker-compose compatible config object
module.exports = config => {
  const services = []

  // services passed to docker-compose are those with build or image config options
  for (const serviceName in config.services) {
    if (!config.services.hasOwnProperty(serviceName)) {
      continue
    }

    const definition = config.services[serviceName]
    for (const configOption in definition) {
      if (!definition.hasOwnProperty(configOption)) {
        continue
      }

      if (configOption === 'build' || configOption === 'image') {
        let serviceConfig = excludeKeys(definition, excludeServiceKeys)

        /*
         TODO - temporary.. do this better.
         Since we generate docker-compose.yml to a `.now` dir in a projects root
         we need to resolve any `build` properties in docker-compose.yml to be one directory up
        */
        if (serviceConfig.build) {
          serviceConfig.build = path.join('../', serviceConfig.build)
        }

        services.push({ name: serviceName, config: serviceConfig })
        break
      }
    }
  }

  const dockerServices = services.reduce((o, service) => {
    o[service.name] = service.config
    return o
  }, {})

  return {
    ...config,
    ...{ services: dockerServices }
  }
}

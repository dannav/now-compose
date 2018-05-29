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
        const serviceConfig = excludeKeys(definition, excludeServiceKeys)
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

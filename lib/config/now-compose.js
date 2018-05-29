// create a now-compose compatible config obj
const excludeServiceKeys = ['networks', 'volumes', 'build', 'image', 'command']

const excludeKeys = (o, exclude) => {
  return Object.keys(o).reduce((accumulator, key) => {
    if (exclude.indexOf(key) > -1) {
      return accumulator
    }

    accumulator[key] = o[key]

    return accumulator
  }, {})
}

// create a now-compose compatible config object
module.exports = config => {
  const services = []

  // now-services are those without build or image tags
  for (const serviceName in config.services) {
    if (!config.services.hasOwnProperty(serviceName)) {
      continue
    }

    const definition = config.services[serviceName]
    let isNowComposeService = true
    for (const configOption in definition) {
      if (!definition.hasOwnProperty(configOption)) {
        continue
      }

      if (configOption === 'build' || configOption === 'image') {
        isNowComposeService = false
        break
      }
    }

    if (isNowComposeService) {
      const serviceConfig = excludeKeys(definition, excludeServiceKeys)
      services.push({ name: serviceName, config: serviceConfig })
    }
  }

  const nowServices = services.reduce((o, service) => {
    o[service.name] = service.config
    return o
  }, {})

  return {
    ...config,
    ...{ services: nowServices }
  }
}

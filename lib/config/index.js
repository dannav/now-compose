const fs = require('fs')
const errors = require('./errors')
const { safeLoad } = require('js-yaml')

// parsing methods
const toDockerCompose = require('./docker-compose')
const toNowCompose = require('./now-compose')

// parse now-compose.yaml file at given path. each service with a "build" or "image"
// property is considered a docker-compose service. These services will be bound
// to a docker-compose config obj. all other services are considered now-compose
// services and will be handled by micro-proxy.
exports.parse = async (config, filePath) => {
  try {
    const configYAML = await safeLoad(config, { filename: filePath })

    if (!configYAML.services) {
      console.log(`
        Error: services key not defined in now-compose.yaml. Cannot setup project.
      `)

      process.exit(1)
    }

    return {
      dockerComposeConfig: toDockerCompose(configYAML),
      nowComposeConfig: toNowCompose(configYAML)
    }
  } catch (err) {
    console.log('ERROR', err)
  }
}

exports.read = path =>
  new Promise((res, rej) => {
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) {
        if (err.code === 'ENOENT') {
          return rej(errors.configNotFound(path))
        }

        return rej(err)
      }

      return res(data)
    })
  })

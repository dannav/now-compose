const fs = require('fs')
const errors = require('./errors')

// parse now-compose.yaml file at given path. each service with a "build" or "image"
// property is considered a docker-compose service. These services will be bound
// to a docker-compose config obj. all other services are considered now-compose
// services and will be handled by micro-proxy.
exports.parse = config => {
  return {
    dockerComposeConfig: {},
    nowComposeConfig: {}
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

      return data
    })
  })

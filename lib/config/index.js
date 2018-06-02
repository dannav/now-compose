const fs = require('fs')
const errors = require('../errors')
const { safeLoad, safeDump } = require('js-yaml')

// parsing methods
const toDockerCompose = require('./docker-compose')
const toNowCompose = require('./now-compose')

// parse now-compose.yaml file at given path. each service with a "build" or "image"
// property is considered a docker-compose service. These services will be bound
// to a docker-compose config obj. all other services are considered now-compose
// services and will be handled by micro-proxy.
exports.parseConfig = async (config, filePath) => {
  try {
    const configYAML = await safeLoad(config, { filename: filePath })

    if (!configYAML.services) {
      console.log(errors.invalidComposeYML())
      process.exit(1)
    }

    return {
      dockerComposeConfig: toDockerCompose(configYAML),
      nowComposeConfig: toNowCompose(configYAML)
    }
  } catch (err) {
    console.log(errors.general(err))
    process.exit(1)
  }
}

// read handles reading a file and returning it's data
exports.readConfig = path =>
  new Promise((res, rej) => {
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) {
        if (err.code === 'ENOENT') {
          console.log(errors.configNotFound(path))
          process.exit(1)
        }

        return rej(err)
      }

      return res(data)
    })
  })

exports.mkdir = path =>
  new Promise((res, rej) => {
    fs.mkdir(path, err => {
      if (err) {
        switch (err.code) {
          case 'EACCES':
            console.log(errors.configDirNoPerm(path))
            process.exit(1)
          case 'EEXIST':
            // path already exists so don't throw
            return res(path)
          default:
            return rej(err)
        }
      }

      return res(path)
    })
  })

exports.writeFile = (path, data, yaml = false) =>
  new Promise((res, rej) => {
    if (yaml) {
      data = safeDump(data)
    }

    fs.writeFile(path, data, err => {
      if (err) {
        console.log(errors.cannotWriteFile(path))
        process.exit(1)
      }

      return res(path)
    })
  })

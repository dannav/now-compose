const fs = require('fs')
const errors = require('../errors')
const { safeLoad, safeDump } = require('js-yaml')

// parsing methods
const { toDockerCompose } = require('./docker-compose')

// parse now-compose.yaml file at given path. each service with a "build" or "image"
// property is considered a docker-compose service.
exports.parseConfig = async (config, filePath) => {
  try {
    const configYAML = await safeLoad(config, { filename: filePath })

    if (!configYAML.services) {
      errors.exit(errors.invalidComposeYML())
    }

    return {
      dockerComposeConfig: toDockerCompose(configYAML)
    }
  } catch (err) {
    errors.exit(errors.general(err))
  }
}

// read handles reading a file and returning it's data
exports.readConfig = path =>
  new Promise((res, rej) => {
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) {
        if (err.code === 'ENOENT') {
          errors.exit(errors.configNotFound(path))
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
            errors.exit(errors.configDirNoPerm(path))
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
        return rej(errors.cannotWriteFile(path))
      }

      return res(path)
    })
  })

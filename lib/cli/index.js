const path = require('path')
const fs = require('fs')

const { parseConfig, readConfig } = require('../config')
const Interceptor = require('./interceptor')
const exec = require('./exec')
const errors = require('../errors')

// configFilePath returns the absolute path of now-compose.yaml in the current
// directory or point to the file defined in the "--file" flag argument relative to cwd
const configFilePath = args => {
  const currentDir = process.cwd()

  if (args['--file']) {
    return path.join(currentDir, args['--file'])
  }

  // handle .yaml or .yml default file extensions
  const filePath = path.join(currentDir, 'now-compose.yaml')
  if (fs.existsSync(filePath)) {
    return filePath
  }

  return path.join(currentDir, 'now-compose.yml')
}

// run through supported commands and generate new interceptor for each.
// fall through for unsupported commands and forward to docker-compose
module.exports = async (command, args) => {
  try {
    const cPath = configFilePath(args)
    const cData = await readConfig(cPath)
    const config = await parseConfig(cData, cPath)

    try {
      const mod = require(`./commands/${command}`)
      const i = new Interceptor(mod, config, args)

      // if process is long running and we receive term signal and cleanup before exit
      process.on('SIGINT', async () => {
        await i.shutdown()
        process.exit(0)
      })

      process.on('SIGTERM', async () => {
        await i.shutdown()
        process.exit(0)
      })

      await i.run()
    } catch (err) {
      if (err.code === 'MODULE_NOT_FOUND') {
        // pass command and arguments through to docker-compose
        try {
          await exec(`docker-compose ${command}`, args)
        } catch (err) {
          console.log(errors.general(err))
          process.exit(1)
        }
      } else {
        console.log(errors.general(err))
        process.exit(1)
      }
    }
  } catch (err) {
    console.log(errors.general(err))
    process.exit(1)
  }
}

const path = require('path')
const fs = require('fs')

const { parseConfig, readConfig, mkdir, writeFile } = require('../config')
const Interceptor = require('./interceptor')
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

// gracefulShutdown will call a commands shutdown method if this process receives
// a sigint or sigterm signal
const gracefulShutdown = interceptor => {
  process.on('SIGINT', async () => {
    await interceptor.shutdown()
    process.exit(0)
  })

  process.on('SIGTERM', async () => {
    await interceptor.shutdown()
    process.exit(0)
  })
}

// createComposeConfig creates a docker-compose.yml file and returns that path to it
const createComposeConfig = async config => {
  const cwd = process.cwd()
  const nowFolder = path.join(cwd, '.now')
  const dockerComposePath = path.join(nowFolder, 'docker-compose.yml')

  try {
    await mkdir(nowFolder)
    await writeFile(dockerComposePath, config.dockerComposeConfig, true)
  } catch (err) {
    console.log(errors.general(err))
    process.exit(1)
  }

  return dockerComposePath
}

// core application flow
module.exports = async (command, args) => {
  try {
    const cPath = configFilePath(args)
    const cData = await readConfig(cPath)
    const config = await parseConfig(cData, cPath)

    // module for command to be run
    let mod = {}

    /*
    TODO - before using require check command existence
    If a require is not resolved in command it can throw MODULE_NOT_FOUND too
    */
    try {
      mod = require(`./commands/${command}`)
    } catch (err) {
      if (err.code === 'MODULE_NOT_FOUND') {
        mod = require('./commands/generic') // use generic command module
      } else {
        console.log(errors.general(err))
        process.exit(1)
      }
    }

    // create docker-compose.yml and add it to command args
    const dockerComposePath = await createComposeConfig(config)
    const cArgs = {
      ...args,
      '--file': dockerComposePath
    }

    const i = new Interceptor(mod, config, cArgs)

    // attach shutdown listeners
    gracefulShutdown(i)

    await i.run()
  } catch (err) {
    console.log(errors.general(err))
    process.exit(1)
  }
}

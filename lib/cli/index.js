const path = require('path')
const fs = require('fs')

const { parse, read } = require('../config')
const Interceptor = require('./interceptor')

// configFilePath returns the absolute path of now-compose.yaml in the current
// directory or point to the file defined in the "--file" flag argument relative to cwd
const configFilePath = args => {
  const currentDir = process.cwd()

  if (args['--file']) {
    return path.join(currentDir, args['--file'])
  }

  return path.join(currentDir, 'now-compose.yml')
}

// run through supported commands and generate new interceptor for each.
// fall through for unsupported commands and forward to docker-compose
module.exports = async (command, args) => {
  try {
    const filePath = configFilePath(args)
    const fileData = await read(filePath)
    const parsedConfig = await parse(fileData, filePath)

    console.log(JSON.stringify(parsedConfig, null, 2))
    process.exit(0)

    // if a command to intercept is defined in ./commands, setup a new interceptor
    // and start command execution process
    try {
      const mod = require(`./commands/${command}`)
      const interceptor = new Interceptor(m)
      await interceptor.run()

      // TODO :- add listener to process.sigint and process.sigterm
      // interceptor should listen to these commands as well and handle appropriately
    } catch (err) {
      if (e.code === 'MODULE_NOT_FOUND') {
        // pass command and arguments through to docker-compose
        console.log('Passing through...')
      } else {
        console.log(err)
        process.exit(1)
      }
    }
  } catch (err) {
    // TODO :- generic error response
    console.log(err)
    process.exit(1)
  }
}

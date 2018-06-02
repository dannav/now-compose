const path = require('path')
const errors = require('../errors')
const { mkdir, writeFile } = require('../config')

module.exports = class Interceptor {
  constructor(mod, config, args) {
    this.config = config
    this.command = new mod(config, args)
  }

  async setupConfig(config) {
    const cwd = process.cwd()
    const nowFolder = path.join(cwd, '.now')
    const dockerComposePath = path.join(nowFolder, 'docker-compose.yml')

    try {
      await mkdir(nowFolder)

      await writeFile(dockerComposePath, config.dockerComposeConfig, true)

      // TODO
      // create rules.json if available in config

      return dockerComposePath
    } catch (err) {
      console.log(err)
      console.log(errors.general())
      process.exit(1)
    }
  }

  async shutdown() {
    // TODO
    // anything else we need to do during shutdown of a long running command?
    this.command.shutdown()
  }

  async run() {
    try {
      const dockerComposePath = await this.setupConfig(this.config)
      await this.command.run({ dockerComposePath })
    } catch (err) {
      process.exit(1)
    }
  }
}

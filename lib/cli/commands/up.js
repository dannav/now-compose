const exec = require('../exec')

class UpCommand {
  constructor(config, args) {
    // TODO
    // filter and set certain args here like --file flag for docker compose
    this.config = config
    this.args = args
  }

  async shutdown() {
    console.log('SHUTTING DOWN')
    process.exit(0)
  }

  async run({ dockerComposePath }) {
    const upArgs = {
      ...this.args,
      '--file': dockerComposePath
    }

    await exec('docker-compose', upArgs)
  }
}

module.exports = UpCommand

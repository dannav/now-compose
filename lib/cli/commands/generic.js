const exec = require('../exec')

class GenericCommand {
  constructor(config, args) {
    this.config = config
    this.args = args
  }

  async shutdown() {
    process.exit(0)
  }

  async run() {
    await exec('docker-compose', this.args)
  }
}

module.exports = GenericCommand

const exec = require('../exec')

class UpCommand {
  constructor(config, args) {
    this.config = config
    this.args = args
  }

  // TODO - when micro-proxy is implemented shutting it down will be handled here
  async shutdown() {
    process.exit(0)
  }

  async run() {
    /*
      TODO - handle path aliases and spinning up micro-proxy server
    */

    await exec('docker-compose', this.args)
  }
}

module.exports = UpCommand
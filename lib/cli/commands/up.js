const { exec } = require('../exec')

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
      TODO - handle path aliases and spinning up micro-proxy server if is a node or static build
    */

    // build without cache first (fixes issue where container isn't updated)
    const noCacheIdx = this.args['_'].indexOf('--no-cache')
    if (noCacheIdx > -1) {
      let buildArgs = {}
      buildArgs['--file'] = this.args['--file']
      buildArgs['build'] = ''
      buildArgs['--no-cache'] = ''

      await exec('docker-compose', buildArgs)
      this.args['_'].splice(noCacheIdx, 1)
    }

    await exec('docker-compose', this.args)
  }
}

module.exports = UpCommand

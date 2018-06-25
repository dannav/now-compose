const nowDeploy = require('../../now/deployment')
const errors = require('../../errors')

class DeployCommand {
  constructor(config, args) {
    this.config = config
    this.args = args
  }

  async shutdown() {
    process.exit(0)
  }

  async run() {
    const apiKey = this.args['--apiKey'] || process.env.NOW_API_KEY
    if (!apiKey) {
      errors.exit(errors.deployAPIKeyNotSet())
    }

    // set in global for use by deployment api
    global.NOW_API_KEY = apiKey
    global.NOW_DEPLOY_PUBLIC = this.args['--public'] ? true : false

    // upload each projects files
    try {
      await nowDeploy(this.config.dockerComposeConfig)
    } catch (err) {
      let message = err
      if (err.message) {
        message = err.message
      }

      errors.exit(errors.general(message))
    }
  }
}

module.exports = DeployCommand

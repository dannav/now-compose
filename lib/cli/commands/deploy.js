const nowDeploy = require('../../now/deployment')

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
      console.log(
        `
        ERROR: Api key not set.

        Please provide the zeit api key for the account you want to use for
        deployments. It can be set using the '--apiKey' flag or by setting a
        'NOW_API_KEY' environment variable before running this command.
        `
      )

      process.exit(1)
    }

    // set in global for use by deployment api
    global.NOW_API_KEY = apiKey
    global.NOW_DEPLOY_PUBLIC = this.args['--public'] ? true : false

    // upload each projects files
    try {
      await nowDeploy(this.config.dockerComposeConfig)
    } catch (err) {
      console.log(
        `
        Error: ${err.message}
        `
      )
      process.exit(1)
    }
  }
}

module.exports = DeployCommand

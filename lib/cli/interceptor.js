/*
  README

  Interceptor hooks into lifecycle events defined for each command.

  TODO - add before / after lifecycle method support

*/

class Interceptor {
  constructor(mod, config, args) {
    this.command = new mod(config, args)
  }

  async shutdown() {
    this.command.shutdown()
  }

  async run() {
    try {
      await this.command.run()
    } catch (_) {
      process.exit(1)
    }
  }
}

module.exports = Interceptor

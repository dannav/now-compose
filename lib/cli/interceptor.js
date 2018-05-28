module.exports = class Interceptor extends EventEmitter {
  constructor(commandModule) {}

  // before() runs before the docker-compose command provided is executed
  async before() {}

  // exec() runs the docker-compose command
  async exec() {}

  // after() runs after a docker-compose command is executed
  async after() {}

  // run() fires off the command execution process
  async run() {
    await this.before()
  }
}

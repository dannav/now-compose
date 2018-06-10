const { spawn } = require('child_process')

// flattenArgs takes a zeit/arg obj and reduces to flat array
// https://github.com/zeit/arg
const flattenArgs = args => {
  return Object.keys(args).reduce((acc, key) => {
    let a = []

    if (key === '_') {
      a = a.concat(args[key])
    } else {
      a = a.concat([key], args[key])
    }

    return acc.concat(a)
  }, [])
}

// shiftFlag takes an arg and it's value and moves it to front of array
const shiftFlag = (args, flag) => {
  if (args.indexOf(flag) > -1) {
    const flagAndVal = args.splice(args.indexOf(flag), 2)
    return [...flagAndVal, ...args]
  }

  return args
}

// exec forwards commands and args passed to now-compose to docker-compose
// cmd inherits now-compose's stdio
const exec = (command = 'docker-compose', args) =>
  new Promise((res, rej) => {
    const cmd = spawn(command, shiftFlag(flattenArgs(args), '--file'), {
      cwd: process.cwd(),
      shell: true,
      stdio: 'inherit'
    })

    cmd.on('close', code => {
      if (code > 0) {
        return rej(code)
      }

      return res(code)
    })
  })

module.exports = exec

const { spawn } = require('child_process')
const Stream = require('stream')

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

// exec forwards commands and args passed to now-compose to another binary
// all stdout and stderr from command is piped to now-compose's stdout
// all callers should handle exceptions
module.exports = (command, args) =>
  new Promise((res, rej) => {
    let err = ''

    const cmd = spawn(command, shiftFlag(flattenArgs(args), '--file'), {
      cwd: process.cwd(),
      shell: true
    })

    let errorStream = new Stream()
    errorStream.writable = true
    errorStream.bytes = 0

    errorStream.write = function(buf) {
      errorStream.bytes += buf.length
      err += buf.toString()
    }

    errorStream.end = function(buf) {
      if (arguments.length) errorStream.write(buf)
      errorStream.writable = false
    }

    // set encoding so we can get output as string
    cmd.stdout.setEncoding('utf8')
    cmd.stderr.setEncoding('utf8')

    cmd.stdout.pipe(process.stdout)
    cmd.stderr.pipe(errorStream)

    cmd.on('close', code => {
      console.log(err)
      if (code > 0) {
        return rej(err)
      }

      return res(code)
    })
  })

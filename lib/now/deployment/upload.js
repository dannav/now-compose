const fs = require('fs')
const crypto = require('crypto')
const dTree = require('directory-tree-promise')
const PromiseThrottle = require('promise-throttle')
const nowAPI = require('../api')
const errors = require('../../errors')

// UploadQueue ratelimits upload file requests to zeit now api
class UploadQueue {
  constructor() {
    this.queue = []
  }

  push(p) {
    this.queue.push(p)
  }

  sleep(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms)
    })
  }

  secondsTillStart(startAtSeconds) {
    const now = new Date().getTime()
    const end = new Date(startAtSeconds * 1000).getTime() // convert to ms

    return Math.abs(end - now)
  }

  // run upload file requests. run first to get rate limit and then return promise
  // of all requests ratelimited. If we don't get rate limits use sane defaults
  // (3 req/ second)
  async process() {
    try {
      const first = this.queue.shift()
      const firstResp = await first()
      const rateLimit = firstResp.headers['X-Rate-Limit-Limit'] || 60 * 3
      const rateLimitResetsInSecs =
        parseInt(firstResp.headers['X-Rate-Limit-Reset'], 10) ||
        new Date().getTime() / 1000

      // wait till we have a constant rate limit / minute
      await this.sleep(this.secondsTillStart(rateLimitResetsInSecs))

      // make at most rateLimit requests per minute
      const promiseThrottle = new PromiseThrottle({
        requestsPerSecond: rateLimit / 60,
        promiseImplementation: Promise
      })

      const requests = this.queue.map(r => {
        return promiseThrottle.add(r)
      })

      return Promise.all(requests)
    } catch (err) {
      process.exit(0)
    }
  }
}

// getFileSHA gets the sha1 hash of a file
const getFileSHA = file =>
  new Promise((res, rej) => {
    const shasum = crypto.createHash('sha1')
    const stream = fs.createReadStream(file.path)

    shasum.setEncoding('hex')
    stream.pipe(shasum)

    stream.on('error', err => {
      return rej(err)
    })

    shasum.on('finish', () => {
      return res(shasum.read())
    })
  })

// upload iterates through a projects directory and uploads files to now
const upload = async (dir, serviceName) => {
  const queue = new UploadQueue()

  try {
    const dirFiles = await dTree(dir, async n => {
      try {
        // TODO :- use https://github.com/kaelzhang/node-ignore to ignore anything in .gitignore
        const isNodeModules = n.path.indexOf('node_modules') > -1
        if (isNodeModules) {
          n.processed = false
          return n
        }

        if (n.isFile) {
          const file = n
          file.sha = await getFileSHA(file)

          // if we can't upload all of a services files we should exit
          try {
            queue.push(nowAPI.prepareUploadFile(file))
          } catch (err) {
            errors.exit(errors.general(err))
          }

          file.processed = true
          return file
        }

        return n
      } catch (err) {
        errors.exit(errors.uploadErrorUploadingFile(file, serviceName, err))
      }
    })

    // run upload requests
    return queue.process().then(() => {
      return { files: dirFiles }
    })
  } catch (err) {
    errors.exit(errors.uploadErrorUploadingService(serviceName, err))
  }
}

module.exports = upload

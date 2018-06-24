const request = require('got')
const fs = require('fs')
const errors = require('../../errors')

const nowAPIURLV2 = 'https://api.zeit.co/v2/now/'
const nowAPIURLV3 = 'https://api.zeit.co/v3/now/'
const timeout = 300 * 1000 // 5 minute

// write file upload progress on same line in console
const printUploadProgress = (message, progress) => {
  const percent = (progress * 100).toFixed(2)
  process.stdout.clearLine()
  process.stdout.cursorTo(0)

  if (percent >= 99.9) {
    process.stdout.write(
      `${message.replace('Uploading', 'Uploaded')} - ${percent}%`
    )
  } else {
    process.stdout.write(`${message} - ${percent}%`)
  }
}

// uploadFile reads file content and pushes it to zeit/now
// this method returns a fn you must run to start the request
// so that we can queue all requests and ratelimit
const defaultFile = { sha: '', size: 0, path: '' }
exports.prepareUploadFile = (file = defaultFile) => () =>
  new Promise((res, rej) => {
    const nowAPIKey = global.NOW_API_KEY
    const url = `${nowAPIURLV2}files`

    const options = {
      method: 'POST',
      throwHttpErrors: false,
      timeout,
      headers: {
        Authorization: `Bearer ${nowAPIKey}`,
        'Content-Type': 'application/octet-stream',
        'Content-Length': file.size,
        'x-now-digest': file.sha,
        'x-now-size': file.size
      }
    }

    try {
      const stream = fs
        .createReadStream(file.path)
        .pipe(request.stream(url, options))

      stream.on('response', r => {
        // create new line after uploaded files
        process.stdout.write('\n')

        if (r.statusCode === 403) {
          return rej(errors.apiForbidden())
        }

        if (r.statusCode !== 200) {
          return rej(errors.apiUploadingFile())
        }

        return res(r)
      })

      stream.on('uploadProgress', progress => {
        const relativeFilePath = file.path.replace(process.cwd(), '.')
        printUploadProgress(
          errors.info(`Uploading ${relativeFilePath}`),
          progress.percent
        )
      })

      stream.on('error', err => {
        if (err.message === timedOutError) {
          return rej(errors.apiOperationTimeout())
        }
      })
    } catch (err) {
      return rej(errors.general(err))
    }
  })

// DeploymentError represents an error thrown during deployment
function DeploymentError(name, body, statusCode) {
  this.message = errors.general(`An error occured deploying service ${name}`)
  this.body = body
  this.name = 'DeploymentError'
  this.statusCode = statusCode
}

// createDeployment creates a new zeit/now service deployment
exports.createDeployment = async body => {
  const nowAPIKey = global.NOW_API_KEY
  const url = `${nowAPIURLV2}deployments`

  const options = {
    throwHttpErrors: false,
    timeout,
    headers: {
      Authorization: `Bearer ${nowAPIKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }

  const resp = await request.post(url, options)
  if (resp.statusCode == 200) {
    return JSON.parse(resp.body)
  }

  throw new DeploymentError(body.name, resp.body, resp.statusCode)
}

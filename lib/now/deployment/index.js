const path = require('path')
const toposort = require('toposort')
const upload = require('./upload')
const api = require('../api')
const errors = require('../../errors')

// getDeployOrder topologically sorts services based on dependant services
const getDeployOrder = services => {
  let o = []

  Object.keys(services).forEach(s => {
    const service = services[s]
    if (!service.build) {
      return null
    }

    if (service['depends_on']) {
      if (Array.isArray(service['depends_on'])) {
        if (service['depends_on'].length) {
          service['depends_on'].forEach(d => {
            o.push([s, d])
          })
        }
      } else {
        if (typeof service['depends_on'] === 'string') {
          o.push([s, service['depends_on']])
        } else {
          errors.exit(errors.deployDependsOnType(s))
        }
      }
    }
  })

  // get rid of any possible falsey values
  o = o.filter(f => f)

  try {
    const sorted = toposort(o).reverse()
    return sorted
  } catch (err) {
    errors.exit(errors.general(err.message))
  }
}

// warnOnNonExistingLinks displays a warning if a service has links that aren't being deployed
const warnOnNonExistingLinks = (services, deploying) => {
  Object.keys(services).forEach(s => {
    const service = services[s]

    // disregard services without build tag (we can't deploy those because there is no dockerfile)
    if (!service.build) {
      errors.warn(errors.deployNoBuildProperty(s))
      return
    }

    if (service['links'] && Array.isArray(service['links'])) {
      service['links'].forEach(l => {
        if (deploying.indexOf(l) == -1) {
          errors.warn(errors.deployLinkNotFound(s, l))
        }
      })
    }
  })
}

// flattenTree takes a directory tree and returns it as flat array filtering
// out unprocessed files and dirs
const flattenTree = (node, flat = []) => {
  if (node.children) {
    if (!node.children.length) {
      if (node.processed) {
        flat.push(node)
      }
    }

    for (const child of node.children) {
      flattenTree(child, flat)
    }
  } else {
    if (node.processed) {
      flat.push(node)
    }
  }

  return flat
}

// prepareDeployment builds the request body for deploying to zeit now
const prepareDeployment = (files, serviceCfg, name, deployed) =>
  new Promise((res, rej) => {
    if (!files.length) {
      return rej()
    }

    // set service link environment variables. NOW_PORT_* is always 443 because zeit
    // deployments always work over ssl
    let serviceLinks = {}
    if (serviceCfg.links) {
      serviceLinks = serviceCfg.links.reduce((env, v) => {
        if (deployed[v]) {
          env[`NOW_HOST_${v.toUpperCase()}`] = deployed[v].url
          env[`NOW_PORT_${v.toUpperCase()}`] = 443
        }

        return env
      }, {})
    }

    // set NOW_DEPLOYED so apps can handle specifics of deployed environment
    serviceCfg.environment['NOW_DEPLOYED'] = 'true'

    const body = {
      env: { ...serviceCfg.environment, ...serviceLinks },
      public: global.NOW_DEPLOY_PUBLIC,
      forceNew: true,
      name: name,
      deploymentType: 'DOCKER',
      files: files.map(f => {
        const relativePath = f.path.replace(
          `${process.cwd()}${path.sep}${name}${path.sep}`,
          ''
        )

        return {
          file: relativePath,
          sha: f.sha,
          size: f.size
        }
      })
    }

    res(body)
  })

// deploy determines order to deploy services, sets links in environment variables
// and pushes to now
const deploy = async config => {
  const deployOrder = getDeployOrder(config.services)

  warnOnNonExistingLinks(config.services, deployOrder)

  const services = Object.keys(config.services)
    .map(s => {
      if (!config.services[s].build) {
        return null
      }

      // TODO - do this better. We are not in the context of the `.now` dir so we
      // need to adjust the build dir to be relative to the current directory
      const serviceDir = config.services[s].build.replace('../', '')
      const dir = path.join(process.cwd(), serviceDir)
      return { dir, name: s }
    })
    .filter(f => f) // disregard nulls (services without build tag)
    .sort((a, b) => {
      const aIdx = deployOrder.indexOf(a.name)
      const bIdx = deployOrder.indexOf(b.name)

      if (aIdx < bIdx) {
        return -1
      }

      if (aIdx > bIdx) {
        return 1
      }

      return 0
    })

  const serviceFiles = []
  for (const s of services) {
    const processed = await upload(s.dir, s.name)
    const flat = flattenTree(processed.files)
    serviceFiles.push(flat)
  }

  console.log(errors.info(`Deploying services to now...\n`))

  let i = 0
  let deployed = {}
  for (const f of serviceFiles) {
    const serviceName = deployOrder[i]
    const serviceCfg = config.services[serviceName]
    const deployReq = await prepareDeployment(
      f,
      serviceCfg,
      serviceName,
      deployed
    )

    const resp = await api.createDeployment(deployReq)

    deployed[serviceName] = resp
    i++
  }

  Object.keys(deployed).forEach(sName => {
    const publicURL = deployed[sName].url
    console.log(errors.info(`[${sName}] Available at url:  ${publicURL}`))
  })

  process.exit(0)
}

module.exports = deploy

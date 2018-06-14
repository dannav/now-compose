const micro = require('micro')
const { send } = require('micro')
const axios = require('axios')

// ENV VARS
const port = process.env.port || 3000
const isDeployed = process.env.NOW_DEPLOYED ? true : false
const apiPort = process.env.NOW_PORT_API
const apiHost = process.env.NOW_HOST_API

const readme = `
  now-compose is a docker-compose integration for use with https://zeit.co/now
  for more information on now-compose visit: https://github.com/dannav/now-compose/
`

const server = micro(async (req, res) => {
  const apiURL = isDeployed
    ? `https://${apiHost}`
    : `http://${apiHost}:${apiPort}`

  const r = await axios.get(apiURL)

  if (r.status == 200) {
    return send(res, 200, {
      readme,
      people: r.data
    })
  }

  send(res, 500, 'Internal Server Error')
})

console.log(`Server started on port :${port}`)
server.listen(port)

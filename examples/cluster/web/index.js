const micro = require('micro')
const { send } = require('micro')
const axios = require('axios')

// ENV VARS
const port = process.env.port || 3000
const isDeployed = process.env.NOW_DEPLOYED ? true : false
const peopleAPIPort = process.env['NOW_PORT_PEOPLE_API']
const peopleAPIHost = process.env['NOW_HOST_PEOPLE_API']

const locationsAPIHost = process.env['NOW_HOST_LOCATIONS_API']
const locationsAPIPort = process.env['NOW_PORT_LOCATIONS_API']

const readme = `
  now-compose is a docker-compose integration for use with https://zeit.co/now
  for more information on now-compose visit: https://github.com/dannav/now-compose/
`

const peopleAPIURL = isDeployed
  ? `https://${peopleAPIHost}`
  : `http://${peopleAPIHost}:${peopleAPIPort}`

const locationsAPIURL = isDeployed
  ? `https://${locationsAPIHost}`
  : `http://${locationsAPIHost}:${locationsAPIPort}`

const getData = async url => {
  const r = await axios.get(url)

  if (r.status == 200) {
    return r.data
  }

  throw new Error(r.status)
}

const server = micro(async (req, res) => {
  try {
    const people = await getData(peopleAPIURL)
    const locations = await getData(locationsAPIURL)

    return send(res, 200, {
      readme,
      people,
      locations
    })
  } catch (err) {
    return send(res, 500, 'Internal Server Error')
  }
})

console.log(`Server started on port :${port}`)
server.listen(port)

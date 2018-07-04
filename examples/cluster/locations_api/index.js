const micro = require('micro')
const { send } = require('micro')

// ENV VARS
const port = process.env.PORT || 3002

const server = micro(async (req, res) => {
  const data = [
    {
      location_id: 1,
      city: 'Tampa',
      state: 'FL',
      created: '2018-06-12T02:50:27.000Z',
      deleted: 0
    },
    {
      location_id: 2,
      city: 'Miami',
      state: 'FL',
      created: '2018-06-12T02:50:27.000Z',
      deleted: 0
    }
  ]

  send(res, 200, data)
})

console.log(`Server started on port :${port}`)
server.listen(port)

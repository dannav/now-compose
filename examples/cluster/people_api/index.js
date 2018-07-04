const micro = require('micro')
const { send } = require('micro')

// ENV VARS
const port = process.env.PORT || 3000

const server = micro(async (req, res) => {
  const data = [
    {
      people_id: 1,
      firstname: 'Danny',
      lastname: 'Navarro',
      created: '2018-06-12T02:50:27.000Z',
      deleted: 0
    },
    {
      people_id: 2,
      firstname: 'Jane',
      lastname: 'Doe',
      created: '2018-06-12T02:50:27.000Z',
      deleted: 0
    },
    {
      people_id: 3,
      firstname: 'Kanye',
      lastname: 'West',
      created: '2018-06-12T02:50:27.000Z',
      deleted: 0
    },
    {
      people_id: 4,
      firstname: 'Takeoff',
      lastname: '',
      created: '2018-06-12T02:50:27.000Z',
      deleted: 0
    },
    {
      people_id: 5,
      firstname: 'Quavo',
      lastname: '',
      created: '2018-06-12T02:50:27.000Z',
      deleted: 0
    },
    {
      people_id: 6,
      firstname: 'Billy',
      lastname: 'Joel',
      created: '2018-06-12T02:50:27.000Z',
      deleted: 0
    }
  ]

  send(res, 200, data)
})

console.log(`Server started on port :${port}`)
server.listen(port)

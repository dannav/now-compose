const micro = require('micro')
const { send } = require('micro')
const db = require('./db')

// ENV VARS
const port = process.env.PORT || 3000

const server = micro(async (req, res) => {
  const people = await db.query(`
    SELECT * FROM people
  `)

  send(res, 200, people)
})

console.log(`Server started on port :${port}`)
server.listen(port)

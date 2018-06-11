const micro = require('micro')
const { json } = require('micro')
// const db = require('./db')

// ENV VARS
const port = process.env.port || 3000

const server = micro(async (req, res) => {
  console.log(process.env)
  // const people = await db.query(`
  //   SELECT * FROM people
  // `)

  return json({ hello: 'world' })
})

console.log(`Server started on port :${port}`)
server.listen(port)

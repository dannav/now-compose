const micro = require('micro')

// ENV VARS
const port = process.env.port || 3000

const server = micro(async (req, res) => {
  return 'Hello world!'
})

console.log(`Server started on port :${port}`)
server.listen(port)

const mysql = require('mysql')

const db = mysql.createPool({
  charset: 'utf8mb4',
  host: process.env.NOW_HOST_DB,
  port: process.env.NOW_PORT_DB,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
})

exports.pool = db

exports.query = (sql = '', values = []) =>
  new Promise((res, rej) => {
    db.query(sql, values, (err, results) => {
      if (err) return rej(err)

      if (results.length === 0) {
        return rej(new Error(`No results found for query: "${sql}"`))
      }

      if (results.length === 1) {
        return res(results[0])
      }

      return res(results)
    })
  })

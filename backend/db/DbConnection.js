const mysql = require('mysql2')

const connection = mysql.createConnection({
    host: process.env.HOST_DB,
    port: process.env.PORT_DB,
    user: process.env.USER_DB,
    password: process.env.PASSWORD_DB,
    database: process.env.NAME_DB

})

connection.connect((err) => {
    if (err) throw err
    console.log("Connected to database")
})


module.exports = connection
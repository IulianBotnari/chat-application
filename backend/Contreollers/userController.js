const mysql = require('../db/DbConnection')


const getUser = ("/users", (req, res) => {

    mysql.query("SELECT * FROM users", (error, results) => {
        if (error) throw error
        res.json(results)
    })

})

module.exports = {
    getUser
}


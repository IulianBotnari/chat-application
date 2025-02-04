const connectdb = require('../db/DbConnection')



const getUser = ("/users", (req, res) => {

    connectdb.query("SELECT * FROM users", (error, results) => {
        if (error) throw error
        res.json(results)
    })

})




module.exports = {
    getUser
}


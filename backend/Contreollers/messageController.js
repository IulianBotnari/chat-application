

const connectdb = require("../db/DbConnection")


async function deleteMessage(req, res) {
    const { msgIndex, tableChat } = req.body

    const query = `DELETE FROM ?? WHERE id = ?`

    try {
        await connectdb.query(query, [tableChat, msgIndex], (error, result) => {
            if (result.affectedRows > 0) {
                res.json({ message: "Chat deleted" })
            } else if (error) {
                res.json({ message: error })
            }
        })

    } catch (err) {
        console.error(res.json({ message: err }))
    }


}


module.exports = { deleteMessage }
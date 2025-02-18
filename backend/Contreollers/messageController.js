

const connectdb = require("../db/DbConnection")


async function deleteMessage(req, res) {
    const { msgIndex, tableChat } = req.body

    const query = `DELETE FROM ?? WHERE id = ?`

    try {
        const [result] = await connectdb.query(query, [tableChat, msgIndex])
        if (result.affectedRows > 0) {
            res.json({ message: "Chat deleted" })
        } else {
            res.json({ message: "Message not found" })
        }
    }

    catch (err) {
        console.error(res.json({ message: err }))
    }


}


module.exports = { deleteMessage }

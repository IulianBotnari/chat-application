const connectdb = require('../db/DbConnection');






async function getUser(req, res) {
    try {
        const [users] = await connectdb.query("SELECT * FROM users");

        if (users.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(users);
    } catch (err) {
        console.error("Errore nel recupero utente:", err);
        res.status(500).json({ error: err.message });
    }
}


async function getChatList(req, res) {
    const username = req.query.username
    const likeparam = "%" + username + "%"
    const dataBaseName = "chatapplication"

    try {
        const [chatList] = await connectdb.query("SELECT table_name FROM information_schema.tables WHERE table_name LIKE ? AND table_schema = ?", [likeparam, dataBaseName])
        if (chatList.length === 0) {
            return res.status(404).json({ message: "Chat not found" });
        }

        // Recupera il contenuto delle tabelle
        const tableDataPromises = chatList.map(async (table) => {
            const [tableData] = await connectdb.query(`SELECT * FROM ??`, [table.TABLE_NAME]);
            return { table_name: table.TABLE_NAME, data: tableData };
        });

        // Risolvi tutte le promesse per ottenere i dati da tutte le tabelle
        const tableData = await Promise.all(tableDataPromises);

        // Risponde con i dati delle tabelle
        res.json(tableData);
    }

    catch (err) {
        console.error("Errore nel recupero chat list:", err);
        res.status(500).json({ error: err.message });

    }
}






module.exports = {
    getUser,
    getChatList
}


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
            const [tableData] = await connectdb.query(`SELECT * FROM ?? ORDER BY id DESC LIMIT 1`, [table.TABLE_NAME]);
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

async function createChat(req, res) {
    const { tableName } = req.query
    const [nameTable1, nameTable2] = tableName.split(',')


    console.log(tableName);

    console.log(nameTable1);


    console.log(nameTable2);
    const requestTableName = nameTable1 + '_' + nameTable2
    const reverseTableName = nameTable2 + '_' + nameTable1

    try {

        const [result] = await connectdb.query('SELECT * FROM ??', [reverseTableName]);

        if (result.length > 0) {
            return res.json({ message: 'Chat already exists' });
        }

    } catch (err) { console.error(); }




    try {
        const query = (`
            CREATE TABLE ?? (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`);
        await connectdb.query(query, [requestTableName])
        res.status(201).json({ message: "Chat creata con successo" })
    } catch (err) {
        console.error(`Errore nella creazione della chat`, err)
    }
}






module.exports = {
    getUser,
    getChatList,
    createChat
}


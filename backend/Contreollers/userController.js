const connectdb = require('../db/DbConnection');






async function getUser(req, res) {
    const search = req.query.search;
    console.log(search);

    try {
        // Controlla se è stato fornito un termine di ricerca
        if (search && search.length > 1) {
            const [userSearch] = await connectdb.query('SELECT * FROM users');
            const results = userSearch.filter(user => user.username.toLowerCase() === search.toLowerCase());
            console.log(userSearch);


            // Se ci sono risultati per la ricerca, restituisci i risultati
            if (results.length > 0) {
                return res.json(results);  // Risposta inviata, quindi si esce dalla funzione
            } else {
                return res.status(404).json({ message: "User not found" });  // Nessun utente trovato per la ricerca
            }
        }

        // Se non c'è una ricerca, restituisci tutti gli utenti
        const [users] = await connectdb.query("SELECT * FROM users");

        if (users.length === 0) {
            return res.status(404).json({ message: "No users found" });
        }

        res.json(users);  // Risposta inviata
    } catch (err) {
        console.error("Errore nel recupero utente:", err);
        res.status(500).json({ error: err.message });  // Risposta in caso di errore
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

    if (nameTable2 === nameTable1) {
        res.json({ message: 'Non puoi creare una chat con te stesso' })
    }





    const requestTableName = nameTable1 + nameTable2
    const reverseTableName = nameTable2 + nameTable1



    try {

        const [result] = await connectdb.query('SELECT * FROM ??', [reverseTableName]);

        if (result.length > 0) {
            return res.json({ message: 'Chat already exists' });
        }

    } catch (err) { console.error(); }




    try {
        if (nameTable2 === nameTable1) {
            return res.json({ message: 'Non puoi creare una chat con te stesso' })
        }
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


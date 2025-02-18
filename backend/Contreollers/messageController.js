

// const connectdb = require("../db/DbConnection")


// async function deleteMessage(req, res) {
//     const { msgIndex, tableChat } = req.body

//     const query = `DELETE FROM ?? WHERE id = ?`

//     try {
//         connectdb.query(query, [tableChat, msgIndex], (error, result) => {
//             if (result.affectedRows > 0) {
//                 res.json({ message: "Chat deleted" })
//             } else if (error) {
//                 res.json({ message: error })
//             }
//         })

//     } catch (err) {
//         console.error(res.json({ message: err }))
//     }


// }


// module.exports = { deleteMessage }

const connectdb = require("../db/DbConnection");

async function deleteMessage(req, res) {
    const { msgIndex, tableChat } = req.body; // Estrarre i parametri dal corpo della richiesta

    const query = `DELETE FROM ?? WHERE id = ?`;

    try {
        // Avvolgere la query in una Promise per usare await
        await new Promise((resolve, reject) => {
            connectdb.query(query, [tableChat, msgIndex], (error, result) => {
                if (error) {
                    reject(error); // Rifiuta la Promise in caso di errore
                } else if (result.affectedRows > 0) {
                    resolve(result); // Risolvi la Promise se ci sono righe cancellate
                } else {
                    reject(new Error("No rows were deleted.")); // Rifiuta se non sono state trovate righe da eliminare
                }
            });
        });

        // Se tutto va bene, invia una risposta positiva
        res.json({ message: "Chat deleted" });

    } catch (err) {
        // Gestisci gli errori e invia una risposta con il messaggio di errore
        console.error(err);
        res.status(500).json({ message: err.message });
    }
}

module.exports = { deleteMessage };

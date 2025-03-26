// const fs = require("fs");
// const path = require("path");

// const getFile = (req, res) => {
//     const fileName = req.query.file // Ottieni il nome del file dai parametri della query

//     if (!fileName) {
//         return res.status(400).json({ error: "Nessun file specificato" });
//     }

//     // Prevenire attacchi di Directory Traversal
//     const safePath = path.join(__dirname, "../uploads", path.basename(fileName));

//     fs.readFile(safePath, "utf8", (err, data) => {
//         if (err) {
//             return res.status(500).json({ error: "Errore nella lettura del file" });
//         }

//         const message = {
//             sender: "Server",
//             content: data,
//             timestamp: Date.now(),

//         };

//         console.log("Messaggio inviato:", message);
//         res.json(message); // Invio l'oggetto completo
//     });
// };

// module.exports = { getFile };


const fs = require("fs");
const path = require("path");

const getFile = (req, res) => {
    const fileName = req.query.file; // Ottieni il nome del file dalla query

    if (!fileName) {
        return res.status(400).json({ error: "Nessun file specificato" });
    }

    // Prevenire attacchi di Directory Traversal
    const safePath = path.join(__dirname, "../uploads", path.basename(fileName));

    // Controlla se il file esiste
    if (!fs.existsSync(safePath)) {
        return res.status(404).json({ error: "File non trovato" });
    }

    // Determina il content type in base all'estensione del file
    const mimeTypes = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".pdf": "application/pdf",
        ".txt": "text/plain",
        ".log": "text/plain"
    };

    const ext = path.extname(fileName).toLowerCase();
    const contentType = mimeTypes[ext] || "application/octet-stream";

    // Imposta l'intestazione HTTP per il content type corretto
    res.setHeader("Content-Type", contentType);

    // Invia il file come risposta
    res.sendFile(safePath, (err) => {
        if (err) {
            res.status(500).json({ error: "Errore nell'invio del file" });
        }
    });
};

module.exports = { getFile };

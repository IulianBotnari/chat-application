const fs = require("fs");
const path = require("path");

const getFile = (req, res) => {
    const fileName = req.query.file; // Ottieni il nome del file dai parametri della query

    if (!fileName) {
        return res.status(400).json({ error: "Nessun file specificato" });
    }

    // Prevenire attacchi di Directory Traversal
    const safePath = path.join(__dirname, "../uploads", path.basename(fileName));

    fs.readFile(safePath, "utf8", (err, data) => {
        if (err) {
            return res.status(500).json({ error: "Errore nella lettura del file" });
        }

        const message = {
            sender: "Server",
            content: data,
            timestamp: Date.now(),
        };

        console.log("Messaggio inviato:", message);
        res.json(message); // Invio l'oggetto completo
    });
};

module.exports = { getFile };
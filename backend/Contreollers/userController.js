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




module.exports = {
    getUser
}


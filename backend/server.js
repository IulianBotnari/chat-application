
// Importazione dei moduli necessari
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const expressSession = require('express-session');
const router = require("./Router/Router");
const multer = require('multer')
const path = require('path')
const fs = require('fs');

// Configurazione delle variabili d'ambiente
const connectdb = require('./db/DbConnection');
const { isUtf8 } = require('buffer');
const host = process.env.HOST;
const port = process.env.PORT;
const secret_key = process.env.SECRET_KEY;

// Inizializzazione dell'app Express e del server HTTP
const app = express();
const httpServer = createServer(app);

// Configurazione di middlewares
app.use(express.json()); // Per parsing delle richieste JSON
app.use(cors()); // Abilitazione CORS per tutte le origini


// Configurazione di Socket.IO con CORS

const io = new Server(httpServer, {
    cors: {
        origin: "*", // Consente connessioni da qualsiasi origine
        methods: ["GET", "POST"]
    }
});



// Configurazione di Passport con strategia locale
passport.use(new LocalStrategy(
    async (username, password, done) => {
        try {
            const [rows] = await connectdb.query('SELECT * FROM users WHERE username = ?', [username])


            const user = rows[0]
            if (!user) return done(null, false, { message: 'User not found' })

            // Verifica della password
            const isMatch = await bcrypt.compare(password, user.password)
            if (!isMatch) return done(null, false, { message: 'Wrong password' })

            return done(null, user)

        } catch (err) {
            return done(err)
        }
    }))



// Serializzazione e deserializzazione dell'utente per la gestione della sessione
passport.serializeUser((user, done) => done(null, user.id))


passport.deserializeUser((id, done) => {
    connectdb.query('SELECT * FROM users WHERE id = ?', [id], (err, result) => {
        if (err) throw err

        done(null, result[0])
    })
})



// Middleware per autenticazione JWT
const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1]

    if (!token) return res.status(403).json({ message: 'Access denied, no token provided' })

    jwt.verify(token, secret_key, (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Invalid token' })

        req.user = decoded
        next()
    })
}


// Endpoint per la registrazione di un nuovo utente
app.post('/register', async (req, res) => {
    const { name, surname, username, password, email, profile_pic } = req.body;
    try {
        const [existingUsers] = await connectdb.query('SELECT * FROM users WHERE username = ?', [username]) || [[]]
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'Username già esistente' });
        }

        const hashedPassword = await bcrypt.hash(password, 10); // Hash della password
        await connectdb.query(
            'INSERT INTO users (name, surname, username, password, email, profile_pic) VALUES (?,?,?,?,?,?)',
            [name, surname, username, hashedPassword, email, profile_pic]
        );

        res.json({ message: 'User successfully inserted' })
    } catch (err) {
        console.error("Errore di registrazione:", err);
        res.status(500).json({ message: 'Registration failed', error: err.message })
    }
});

// Endpoint per il login
app.post('/login', passport.authenticate('local', { session: false }), (req, res) => {

    const token = jwt.sign({ userId: req.user.id }, secret_key, { expiresIn: '3h' })
    res.json({ token })
})


// Uso del router principale
// app.use("/", authenticateJWT, router)
app.use("/", router)





// Endpoint per il recupero dei messaggi
app.get('/messages', authenticateJWT, async (req, res) => {
    const { tablename } = req.query

    try {

        const [messages] = await connectdb.query(`SELECT * FROM ${tablename} ORDER BY timestamp ASC`);
        res.json(messages);

    } catch (err) {
        console.error("Errore durante il recupero dei messaggi:", err); // Log dell'errore
        res.status(500).json({ error: err.message });
    }
});

// gestione storage con multer

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads')
    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
})

const upload = multer({ storage: storage })

app.post("/post-file", upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "Nessun file caricato" });
    }

    const filePath = req.file.path;
    console.log("File ricevuto:", req.file);

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: "Errore nella lettura del file" });
        }

        const messages = {
            sender: 'Server',
            content: data,
            timestamp: Date.now()
        };

        // console.log("Messaggio inviato:", messages);
        // res.json({ filePath }); // CORRETTO: restituisce l'oggetto completo
        res.json({ messages }); // CORRETTO: restituisce l'oggetto completo
    });
});




// Configurazione di Socket.IO per la comunicazione in tempo reale
io.on('connection', (socket) => {
    console.log('Un utente si è connesso');

    socket.on('join', (room) => {
        socket.join(room);
        console.log(`Utente unito alla stanza ${room}`);
    });

    socket.on('leave', (room) => {
        socket.leave(room);
        console.log(`Utente uscito dalla stanza ${room}`);
    });



    // il problema e passare il path al database, da capire come visualizzare il file nella chat

    socket.on('chat message', async (data) => {
        const { username, message, tableName } = data;

        // console.log(message)

        try {
            await connectdb.query(`INSERT INTO \`${tableName}\` (username, message) VALUES (?, ?)`, [username, message]);
            io.to(tableName).emit('chat message', { username, message, timestamp: new Date(), tableName });
        } catch (err) {
            console.error(err);
        }
    });

    socket.on('disconnect', () => {
        console.log('Un utente si è disconnesso');
    });
});

// Avvio del server
httpServer.listen(port, () => {
    console.log(`Server running at ${host}:${port}`)
})
